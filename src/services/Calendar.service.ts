import { CalendarResponseDto, CalendarSlotResponseDto } from '../dtos/CalendarResponse.dto';
import { UserRole } from '../entities/UserRole.enum';
import { WorkScheduleWeekday } from '../entities/WorkScheduleWeekday.enum';
import { appointmentRepository } from '../repositories/Appointment.repository';
import { doctorRepository } from '../repositories/Doctor.repository';
import { workScheduleRepository } from '../repositories/WorkSchedule.repository';
import { NotFoundError } from '../utils/errors/AppError';

export class CalendarService {
  private readonly doctorRepo = doctorRepository;
  private readonly workScheduleRepo = workScheduleRepository;
  private readonly appointmentRepo = appointmentRepository;

  public async getDoctorCalendar(doctorId: string, date: string): Promise<CalendarResponseDto> {
    const doctor = await this.doctorRepo.findByUserId(doctorId);
    if (!doctor || doctor.user.role !== UserRole.DOCTOR) {
      throw new NotFoundError('Médico não encontrado.', 'MEDICO_NAO_ENCONTRADO');
    }

    const weekday = this.getWeekdayFromDate(date);
    const schedules = await this.workScheduleRepo.findByDoctorIdAndWeekday(doctorId, weekday);
    const appointments = await this.appointmentRepo.findByDoctorAndDate(doctorId, date);

    return {
      doctorId,
      date,
      slots: schedules.flatMap((schedule) => this.buildSlots(date, schedule.startTime, schedule.endTime, schedule.slotDurationMinutes, appointments)),
    };
  }

  private buildSlots(
    date: string,
    startTime: string,
    endTime: string,
    slotDurationMinutes: number,
    appointments: Array<{ startsAt: Date; endsAt: Date }>,
  ): CalendarSlotResponseDto[] {
    const slots: CalendarSlotResponseDto[] = [];
    let cursor = this.combineDateAndTime(date, startTime);
    const boundary = this.combineDateAndTime(date, endTime);

    while (cursor < boundary) {
      const slotEnd = new Date(cursor.getTime() + slotDurationMinutes * 60 * 1000);
      const available = !appointments.some(
        (appointment) => appointment.startsAt < slotEnd && appointment.endsAt > cursor,
      );

      slots.push({
        startsAt: cursor.toISOString(),
        endsAt: slotEnd.toISOString(),
        available,
      });

      cursor = slotEnd;
    }

    return slots;
  }

  private getWeekdayFromDate(date: string): WorkScheduleWeekday {
    const current = new Date(`${date}T00:00:00.000Z`);
    const weekdays: WorkScheduleWeekday[] = [
      WorkScheduleWeekday.SUNDAY,
      WorkScheduleWeekday.MONDAY,
      WorkScheduleWeekday.TUESDAY,
      WorkScheduleWeekday.WEDNESDAY,
      WorkScheduleWeekday.THURSDAY,
      WorkScheduleWeekday.FRIDAY,
      WorkScheduleWeekday.SATURDAY,
    ];

    return weekdays[current.getUTCDay()]!;
  }

  private combineDateAndTime(date: string, time: string): Date {
    return new Date(`${date}T${time}:00.000Z`);
  }
}

export const calendarService = new CalendarService();

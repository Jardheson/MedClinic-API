import { AppointmentResponseDto } from '../dtos/AppointmentResponse.dto';
import { CreateAppointmentDto } from '../dtos/CreateAppointment.dto';
import { UpdateAppointmentStatusDto } from '../dtos/UpdateAppointmentStatus.dto';
import { AppointmentStatus } from '../entities/AppointmentStatus.enum';
import { appointmentRepository } from '../repositories/Appointment.repository';
import { doctorRepository } from '../repositories/Doctor.repository';
import { patientRepository } from '../repositories/Patient.repository';
import { workScheduleRepository } from '../repositories/WorkSchedule.repository';
import { BadRequestError, ConflictError, NotFoundError } from '../utils/errors/AppError';
import { WorkScheduleWeekday } from '../entities/WorkScheduleWeekday.enum';

export class AppointmentService {
  private readonly appointmentRepo = appointmentRepository;
  private readonly doctorRepo = doctorRepository;
  private readonly patientRepo = patientRepository;
  private readonly workScheduleRepo = workScheduleRepository;

  public async create(dto: CreateAppointmentDto): Promise<AppointmentResponseDto> {
    const doctor = await this.doctorRepo.findByUserId(dto.doctorId);
    if (!doctor) {
      throw new BadRequestError(
        'doctorId deve pertencer a um médico cadastrado.',
        'MEDICO_NAO_ENCONTRADO',
      );
    }

    const patient = await this.patientRepo.findById(dto.patientId);
    if (!patient) {
      throw new NotFoundError('Paciente não encontrado para agendamento.', 'PACIENTE_NAO_ENCONTRADO');
    }

    const startsAt = new Date(dto.startsAt);
    const schedule = await this.resolveSchedule(dto.doctorId, startsAt);
    if (!schedule) {
      throw new BadRequestError(
        'Horário solicitado está fora da escala do médico.',
        'HORARIO_FORA_DA_ESCALA',
      );
    }

    const endsAt = new Date(startsAt.getTime() + schedule.slotDurationMinutes * 60 * 1000);

    const schedulingResult = await this.appointmentRepo.scheduleWithLock({
      doctorId: dto.doctorId,
      patientId: dto.patientId,
      startsAt,
      endsAt,
      status: AppointmentStatus.SCHEDULED,
    });

    if (schedulingResult.conflict === 'doctor') {
      throw new ConflictError('Horário indisponível para o médico.', 'HORARIO_INDISPONIVEL');
    }

    if (schedulingResult.conflict === 'patient') {
      throw new ConflictError('Paciente indisponível neste horário.', 'PACIENTE_INDISPONIVEL');
    }

    return this.mapToResponse(schedulingResult.appointment!);
  }

  public async updateStatus(
    appointmentId: string,
    dto: UpdateAppointmentStatusDto,
  ): Promise<AppointmentResponseDto> {
    const appointment = await this.appointmentRepo.findById(appointmentId);
    if (!appointment) {
      throw new NotFoundError('Consulta não encontrada.', 'CONSULTA_NAO_ENCONTRADA');
    }

    if (!this.isValidTransition(appointment.status, dto.status)) {
      throw new BadRequestError('Transição de status inválida.', 'TRANSICAO_INVALIDA');
    }

    appointment.status = dto.status;
    return this.mapToResponse(await this.appointmentRepo.save(appointment));
  }

  private async resolveSchedule(doctorId: string, startsAt: Date) {
    const weekday = this.getWeekday(startsAt);
    const schedules = await this.workScheduleRepo.findByDoctorIdAndWeekday(doctorId, weekday);
    const requestedMinutes = startsAt.getUTCHours() * 60 + startsAt.getUTCMinutes();

    return schedules.find((schedule) => {
      const startMinutes = this.toMinutes(schedule.startTime);
      const endMinutes = this.toMinutes(schedule.endTime);
      const fitsInside = requestedMinutes >= startMinutes && requestedMinutes < endMinutes;
      const alignsToSlot = (requestedMinutes - startMinutes) % schedule.slotDurationMinutes === 0;
      const slotEndsInside = requestedMinutes + schedule.slotDurationMinutes <= endMinutes;

      return fitsInside && alignsToSlot && slotEndsInside;
    });
  }

  private isValidTransition(currentStatus: AppointmentStatus, nextStatus: AppointmentStatus): boolean {
    const allowedTransitions: Record<AppointmentStatus, AppointmentStatus[]> = {
      [AppointmentStatus.SCHEDULED]: [AppointmentStatus.IN_PROGRESS, AppointmentStatus.CANCELED],
      [AppointmentStatus.IN_PROGRESS]: [AppointmentStatus.DONE, AppointmentStatus.CANCELED],
      [AppointmentStatus.DONE]: [],
      [AppointmentStatus.CANCELED]: [],
    };

    return currentStatus === nextStatus || allowedTransitions[currentStatus].includes(nextStatus);
  }

  private getWeekday(date: Date): WorkScheduleWeekday {
    const weekdays: WorkScheduleWeekday[] = [
      WorkScheduleWeekday.SUNDAY,
      WorkScheduleWeekday.MONDAY,
      WorkScheduleWeekday.TUESDAY,
      WorkScheduleWeekday.WEDNESDAY,
      WorkScheduleWeekday.THURSDAY,
      WorkScheduleWeekday.FRIDAY,
      WorkScheduleWeekday.SATURDAY,
    ];

    return weekdays[date.getUTCDay()]!;
  }

  private toMinutes(time: string): number {
    const [hour, minute] = time.split(':').map(Number);
    return hour * 60 + minute;
  }

  private mapToResponse(appointment: {
    id: string;
    doctorId: string;
    patientId: string;
    status: AppointmentStatus;
    startsAt: Date;
    endsAt: Date;
    createdAt: Date;
  }): AppointmentResponseDto {
    return {
      id: appointment.id,
      doctorId: appointment.doctorId,
      patientId: appointment.patientId,
      status: appointment.status,
      startsAt: appointment.startsAt,
      endsAt: appointment.endsAt,
      createdAt: appointment.createdAt,
    };
  }
}

export const appointmentService = new AppointmentService();

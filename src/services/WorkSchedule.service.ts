import { ReplaceWorkScheduleDto } from '../dtos/ReplaceWorkSchedule.dto';
import { WorkScheduleResponseDto } from '../dtos/WorkScheduleResponse.dto';
import { UserRole } from '../entities/UserRole.enum';
import { WorkScheduleWeekday } from '../entities/WorkScheduleWeekday.enum';
import { doctorRepository } from '../repositories/Doctor.repository';
import { workScheduleRepository } from '../repositories/WorkSchedule.repository';
import { BadRequestError, NotFoundError } from '../utils/errors/AppError';

export class WorkScheduleService {
  private readonly doctorRepo = doctorRepository;
  private readonly workScheduleRepo = workScheduleRepository;

  public async replaceForDoctor(
    doctorId: string,
    dto: ReplaceWorkScheduleDto,
  ): Promise<WorkScheduleResponseDto[]> {
    await this.ensureDoctorExists(doctorId);
    this.validateItems(dto.items);

    const schedules = await this.workScheduleRepo.replaceForDoctor(doctorId, dto.items);
    return schedules.map((item) => this.mapToResponse(item));
  }

  public async listByDoctor(doctorId: string): Promise<WorkScheduleResponseDto[]> {
    await this.ensureDoctorExists(doctorId);
    const schedules = await this.workScheduleRepo.findByDoctorId(doctorId);
    return schedules.map((item) => this.mapToResponse(item));
  }

  private async ensureDoctorExists(doctorId: string): Promise<void> {
    const doctor = await this.doctorRepo.findByUserId(doctorId);
    if (!doctor || doctor.user.role !== UserRole.DOCTOR) {
      throw new NotFoundError('Médico não encontrado.', 'MEDICO_NAO_ENCONTRADO');
    }
  }

  private validateItems(items: ReplaceWorkScheduleDto['items']): void {
    const grouped = new Map<WorkScheduleWeekday, typeof items>();

    for (const item of items) {
      if (item.startTime >= item.endTime) {
        throw new BadRequestError('startTime deve ser menor que endTime.', 'HORARIO_INVALIDO');
      }

      const duration = this.diffMinutes(item.startTime, item.endTime);
      if (duration % item.slotDurationMinutes !== 0) {
        throw new BadRequestError(
          'O intervalo da escala deve ser múltiplo de slotDurationMinutes.',
          'DURACAO_SLOT_INVALIDA',
        );
      }

      const current = grouped.get(item.weekday) ?? [];
      current.push(item);
      grouped.set(item.weekday, current);
    }

    for (const [, dayItems] of grouped) {
      const sorted = [...dayItems].sort((a, b) => a.startTime.localeCompare(b.startTime));
      for (let index = 1; index < sorted.length; index += 1) {
        if (sorted[index - 1]!.endTime > sorted[index]!.startTime) {
          throw new BadRequestError(
            'A escala do médico possui intervalos sobrepostos no mesmo dia.',
            'ESCALA_SOBREPOSTA',
          );
        }
      }
    }
  }

  private diffMinutes(startTime: string, endTime: string): number {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    return endHour * 60 + endMinute - (startHour * 60 + startMinute);
  }

  private mapToResponse(item: {
    id: string;
    doctorId: string;
    weekday: WorkScheduleWeekday;
    startTime: string;
    endTime: string;
    slotDurationMinutes: number;
    createdAt: Date;
  }): WorkScheduleResponseDto {
    return {
      id: item.id,
      doctorId: item.doctorId,
      weekday: item.weekday,
      startTime: item.startTime,
      endTime: item.endTime,
      slotDurationMinutes: item.slotDurationMinutes,
      createdAt: item.createdAt,
    };
  }
}

export const workScheduleService = new WorkScheduleService();

import { DataSource, Repository } from 'typeorm';
import { AppDataSource } from '../database/data-source';
import { WorkSchedule } from '../entities/WorkSchedule.entity';
import { WorkScheduleWeekday } from '../entities/WorkScheduleWeekday.enum';

export interface ReplaceWorkScheduleItemRepositoryDto {
  weekday: WorkScheduleWeekday;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
}

export class WorkScheduleRepository {
  private readonly ormRepository: Repository<WorkSchedule>;

  constructor(dataSource: DataSource = AppDataSource) {
    this.ormRepository = dataSource.getRepository(WorkSchedule);
  }

  public async replaceForDoctor(
    doctorId: string,
    items: ReplaceWorkScheduleItemRepositoryDto[],
  ): Promise<WorkSchedule[]> {
    await this.ormRepository.delete({ doctorId });
    const schedules = this.ormRepository.create(items.map((item) => ({ doctorId, ...item })));
    return this.ormRepository.save(schedules);
  }

  public async findByDoctorId(doctorId: string): Promise<WorkSchedule[]> {
    return this.ormRepository.find({
      where: { doctorId },
      order: { weekday: 'ASC', startTime: 'ASC' },
    });
  }

  public async findByDoctorIdAndWeekday(
    doctorId: string,
    weekday: WorkScheduleWeekday,
  ): Promise<WorkSchedule[]> {
    return this.ormRepository.find({
      where: { doctorId, weekday },
      order: { startTime: 'ASC' },
    });
  }
}

export const workScheduleRepository = new WorkScheduleRepository();

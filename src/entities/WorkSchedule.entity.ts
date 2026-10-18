import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './User.entity';
import { WorkScheduleWeekday } from './WorkScheduleWeekday.enum';

@Entity('work_schedules')
@Index('idx_work_schedules_doctor_weekday', ['doctorId', 'weekday'])
export class WorkSchedule {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ name: 'doctor_id', type: 'uuid', nullable: false })
  public doctorId: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctor_id' })
  public doctor: User;

  @Column({
    type: 'enum',
    enum: WorkScheduleWeekday,
    enumName: 'work_schedule_weekday',
    nullable: false,
  })
  public weekday: WorkScheduleWeekday;

  @Column({ name: 'start_time', type: 'time', nullable: false })
  public startTime: string;

  @Column({ name: 'end_time', type: 'time', nullable: false })
  public endTime: string;

  @Column({ name: 'slot_duration_minutes', type: 'int', nullable: false })
  public slotDurationMinutes: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: false })
  public createdAt: Date;
}

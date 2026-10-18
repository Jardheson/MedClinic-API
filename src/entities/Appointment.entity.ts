import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AppointmentStatus } from './AppointmentStatus.enum';
import { Patient } from './Patient.entity';
import { User } from './User.entity';

@Entity('appointments')
@Index('idx_appointments_patient_status', ['patientId', 'status'])
@Index('idx_appointments_doctor_status', ['doctorId', 'status'])
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ name: 'doctor_id', type: 'uuid', nullable: false })
  public doctorId: string;

  @Column({ name: 'patient_id', type: 'uuid', nullable: false })
  public patientId: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'doctor_id' })
  public doctor: User;

  @ManyToOne(() => Patient, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patient_id' })
  public patient: Patient;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    enumName: 'appointment_status',
    default: AppointmentStatus.SCHEDULED,
    nullable: false,
  })
  public status: AppointmentStatus;

  @Column({ name: 'starts_at', type: 'timestamp', nullable: false })
  public startsAt: Date;

  @Column({ name: 'ends_at', type: 'timestamp', nullable: false })
  public endsAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: false })
  public createdAt: Date;
}

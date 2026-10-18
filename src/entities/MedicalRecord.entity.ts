import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Patient } from './Patient.entity';
import { User } from './User.entity';

@Entity('medical_records')
@Index('idx_medical_records_patient_created_at', ['patientId', 'createdAt'])
export class MedicalRecord {
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

  @Column({ type: 'text', nullable: false })
  public descricao: string;

  @Column({ type: 'text', nullable: true })
  public prescricao: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: false })
  public createdAt: Date;
}

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('patients')
@Index('idx_patients_cpf_unique', ['cpf'], { unique: true })
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ type: 'varchar', length: 150, nullable: false })
  public name: string;

  @Column({ type: 'varchar', length: 11, nullable: false, unique: true })
  public cpf: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz', nullable: false })
  public createdAt: Date;
}

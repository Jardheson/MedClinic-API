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

@Entity('doctors')
@Index('idx_doctors_crm_unique', ['crm'], { unique: true })
@Index('idx_doctors_user_id_unique', ['userId'], { unique: true })
export class Doctor {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: false, unique: true })
  public userId: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  public user: User;

  @Column({ type: 'varchar', length: 20, nullable: false, unique: true })
  public crm: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: false })
  public createdAt: Date;
}

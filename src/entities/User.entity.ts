import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserRole } from './UserRole.enum';

@Entity('users')
@Index('idx_users_email_unique', ['email'], { unique: true })
@Index('idx_users_role', ['role'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ type: 'varchar', length: 150, nullable: false })
  public nome: string;

  @Column({ type: 'varchar', length: 150, nullable: false, unique: true })
  public email: string;

  @Column({ type: 'varchar', length: 255, nullable: false, select: false })
  public senha: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    enumName: 'user_role',
    default: UserRole.ATTENDANT,
    nullable: false,
  })
  public role: UserRole;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: false })
  public createdAt: Date;
}

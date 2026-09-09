import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserRole } from './UserRole.enum';

@Entity('users')
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
    default: UserRole.ATTENDANT,
    nullable: false,
  })
  public role: UserRole;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', nullable: false })
  public createdAt: Date;
}

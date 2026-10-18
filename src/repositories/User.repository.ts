import { DataSource, Repository } from 'typeorm';
import { AppDataSource } from '../database/data-source';
import { User } from '../entities/User.entity';
import { UserRole } from '../entities/UserRole.enum';

export interface CreateUserRepositoryDto {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
}

export class UserRepository {
  private readonly ormRepository: Repository<User>;

  constructor(dataSource: DataSource = AppDataSource) {
    this.ormRepository = dataSource.getRepository(User);
  }

  public async save(user: User): Promise<User> {
    return this.ormRepository.save(user);
  }

  public async create(dto: CreateUserRepositoryDto): Promise<User> {
    const user = this.ormRepository.create({
      nome: dto.name,
      email: dto.email,
      senha: dto.passwordHash,
      role: dto.role ?? UserRole.ATTENDANT,
    });
    return this.ormRepository.save(user);
  }

  public async findByEmail(email: string, includePassword: boolean = false): Promise<User | null> {
    const qb = this.ormRepository.createQueryBuilder('u').where('u.email = :email', { email });
    if (includePassword) {
      qb.addSelect('u.senha');
    }
    return qb.getOne();
  }

  public async findById(id: string): Promise<User | null> {
    return this.ormRepository.findOne({ where: { id } });
  }

  public async existsByRole(role: UserRole): Promise<boolean> {
    return this.ormRepository.exist({ where: { role } });
  }
}

export const userRepository = new UserRepository();

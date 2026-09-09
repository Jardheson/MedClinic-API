import { Repository } from 'typeorm';
import { AppDataSource } from '../database/data-source';
import { User } from '../entities/User.entity';
import { UserRole } from '../entities/UserRole.enum';
import { CreateUserDto } from '../dtos/CreateUser.dto';

export class UserRepository {
  private readonly ormRepository: Repository<User>;

  constructor() {
    this.ormRepository = AppDataSource.getRepository(User);
  }

  public async save(user: User): Promise<User> {
    return this.ormRepository.save(user);
  }

  public async create(dto: CreateUserDto & { senha: string }): Promise<User> {
    const user = this.ormRepository.create({
      nome: dto.nome,
      email: dto.email,
      senha: dto.senha,
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
}

export const userRepository = new UserRepository();

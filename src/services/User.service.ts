import { CreateUserDto } from '../dtos/CreateUser.dto';
import { UserResponseDto } from '../dtos/UserResponse.dto';
import { userRepository } from '../repositories/User.repository';
import { ConflictError, NotFoundError } from '../utils/errors/AppError';
import { hashPassword } from '../utils/hashPassword';
import { mapUserToResponseDto } from './mappers/User.mapper';

export class UserService {
  private readonly userRepo = userRepository;

  public async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.userRepo.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictError('E-mail já cadastrado.', 'EMAIL_JA_CADASTRADO');
    }

    const passwordHash = await hashPassword(dto.password);
    const createdUser = await this.userRepo.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      role: dto.roles[0],
    });

    return mapUserToResponseDto(createdUser);
  }

  public async getMe(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError('Usuário autenticado não encontrado.');
    }
    return mapUserToResponseDto(user);
  }
}

export const userService = new UserService();

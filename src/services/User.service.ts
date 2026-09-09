import { UserResponseDto } from '../dtos/UserResponse.dto';
import { User } from '../entities/User.entity';
import { NotFoundError } from '../utils/errors/AppError';
import { userRepository } from '../repositories/User.repository';

export class UserService {
  private readonly userRepo = userRepository;

  public async getMe(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError('Usuário autenticado não encontrado.');
    }
    return UserService.mapToResponse(user);
  }

  private static mapToResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      nome: user.nome,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}

export const userService = new UserService();

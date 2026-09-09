import { UserResponseDto } from '../dtos/UserResponse.dto';
import { NotFoundError } from '../utils/errors/AppError';
import { userRepository } from '../repositories/User.repository';
import { mapUserToResponseDto } from './mappers/User.mapper';

export class UserService {
  private readonly userRepo = userRepository;

  public async getMe(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError('Usuário autenticado não encontrado.');
    }
    return mapUserToResponseDto(user);
  }
}

export const userService = new UserService();

import { UserResponseDto } from '../../dtos/UserResponse.dto';
import { User } from '../../entities/User.entity';

export function mapUserToResponseDto(user: User): UserResponseDto {
  return {
    id: user.id,
    name: user.nome,
    email: user.email,
    roles: [user.role],
  };
}

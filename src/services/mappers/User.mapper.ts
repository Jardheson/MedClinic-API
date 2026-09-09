import { UserResponseDto } from '../../dtos/UserResponse.dto';
import { User } from '../../entities/User.entity';

export function mapUserToResponseDto(user: User): UserResponseDto {
  return {
    id: user.id,
    nome: user.nome,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

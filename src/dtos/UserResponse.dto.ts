import { UserRole } from '../entities/UserRole.enum';

export interface UserResponseDto {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

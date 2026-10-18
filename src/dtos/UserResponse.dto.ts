import { UserRole } from '../entities/UserRole.enum';

export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
}

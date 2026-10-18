import { UserRole } from '../entities/UserRole.enum';

export interface DoctorResponseDto {
  id: string;
  crm: string;
  createdAt: Date;
  name: string;
  email: string;
  roles: UserRole[];
}

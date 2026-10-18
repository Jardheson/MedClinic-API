import { AppointmentStatus } from '../entities/AppointmentStatus.enum';

export interface AppointmentResponseDto {
  id: string;
  doctorId: string;
  patientId: string;
  status: AppointmentStatus;
  startsAt: Date;
  endsAt: Date;
  createdAt: Date;
}

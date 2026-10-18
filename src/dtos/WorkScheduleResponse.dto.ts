import { WorkScheduleWeekday } from '../entities/WorkScheduleWeekday.enum';

export interface WorkScheduleResponseDto {
  id: string;
  doctorId: string;
  weekday: WorkScheduleWeekday;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  createdAt: Date;
}

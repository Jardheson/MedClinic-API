export interface CalendarSlotResponseDto {
  startsAt: string;
  endsAt: string;
  available: boolean;
}

export interface CalendarResponseDto {
  doctorId: string;
  date: string;
  slots: CalendarSlotResponseDto[];
}

import { z } from 'zod';
import { WorkScheduleWeekday } from '../entities/WorkScheduleWeekday.enum';

const WorkScheduleItemSchema = z.object({
  weekday: z.nativeEnum(WorkScheduleWeekday),
  startTime: z.string().regex(/^\d{2}:\d{2}$/u, 'startTime inválido. Use HH:mm.'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/u, 'endTime inválido. Use HH:mm.'),
  slotDurationMinutes: z.coerce
    .number()
    .int('slotDurationMinutes deve ser inteiro.')
    .positive('slotDurationMinutes deve ser positivo.')
    .max(480, 'slotDurationMinutes deve ser menor ou igual a 480.'),
});

export const ReplaceWorkScheduleSchema = z.object({
  params: z.object({
    doctorId: z.string().uuid('doctorId inválido.'),
  }),
  body: z.object({
    items: z.array(WorkScheduleItemSchema).min(1, 'items deve conter ao menos um horário.'),
  }),
});

export type ReplaceWorkScheduleDto = z.infer<typeof ReplaceWorkScheduleSchema>['body'];

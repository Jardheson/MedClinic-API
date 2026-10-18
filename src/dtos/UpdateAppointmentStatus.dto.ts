import { z } from 'zod';
import { AppointmentStatus } from '../entities/AppointmentStatus.enum';

export const UpdateAppointmentStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(AppointmentStatus, {
      message:
        'Status inválido. Use "scheduled", "in_progress", "done" ou "canceled".',
    }),
  }),
  params: z.object({
    id: z.string().uuid('id inválido.'),
  }),
});

export type UpdateAppointmentStatusDto = z.infer<typeof UpdateAppointmentStatusSchema>['body'];

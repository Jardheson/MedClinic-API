import { z } from 'zod';

export const CreateAppointmentSchema = z.object({
  body: z.object({
    doctorId: z.string({ required_error: 'doctorId é obrigatório.' }).uuid('doctorId inválido.'),
    patientId: z.string({ required_error: 'patientId é obrigatório.' }).uuid('patientId inválido.'),
    startsAt: z.string({ required_error: 'startsAt é obrigatório.' }).datetime(),
  }),
});

export type CreateAppointmentDto = z.infer<typeof CreateAppointmentSchema>['body'];

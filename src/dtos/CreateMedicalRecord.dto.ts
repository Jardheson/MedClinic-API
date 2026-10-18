import { z } from 'zod';

export const CreateMedicalRecordSchema = z.object({
  body: z.object({
    descricao: z
      .string({ required_error: 'Descrição do prontuário é obrigatória.' })
      .min(10, 'Descrição do prontuário deve ter pelo menos 10 caracteres.')
      .max(5000, 'Descrição do prontuário deve ter no máximo 5000 caracteres.'),
    prescricao: z
      .string()
      .trim()
      .max(5000, 'Prescrição deve ter no máximo 5000 caracteres.')
      .optional(),
  }),
  params: z.object({
    patientId: z.string().uuid('patientId inválido.'),
  }),
});

export type CreateMedicalRecordDto = z.infer<typeof CreateMedicalRecordSchema>['body'];

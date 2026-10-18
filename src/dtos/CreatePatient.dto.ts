import { z } from 'zod';

export const CreatePatientSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'name é obrigatório.' })
      .min(2, 'name deve ter pelo menos 2 caracteres.')
      .max(150, 'name deve ter no máximo 150 caracteres.'),
    cpf: z
      .string({ required_error: 'cpf é obrigatório.' })
      .regex(/^\d{11}$/, 'cpf deve conter exatamente 11 dígitos numéricos.'),
  }),
});

export type CreatePatientDto = z.infer<typeof CreatePatientSchema>['body'];

import { z } from 'zod';

export const CreateDoctorSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'name é obrigatório.' })
      .min(2, 'name deve ter pelo menos 2 caracteres.')
      .max(150, 'name deve ter no máximo 150 caracteres.'),
    email: z
      .string({ required_error: 'email é obrigatório.' })
      .email('email inválido.'),
    password: z
      .string({ required_error: 'password é obrigatório.' })
      .min(8, 'password deve ter pelo menos 8 caracteres.'),
    crm: z
      .string({ required_error: 'crm é obrigatório.' })
      .trim()
      .min(4, 'crm deve ter pelo menos 4 caracteres.')
      .max(20, 'crm deve ter no máximo 20 caracteres.'),
  }),
});

export type CreateDoctorDto = z.infer<typeof CreateDoctorSchema>['body'];

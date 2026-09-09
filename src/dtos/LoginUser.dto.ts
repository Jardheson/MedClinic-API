import { z } from 'zod';

export const LoginUserSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'E-mail é obrigatório.' })
      .email('Formato de e-mail inválido.'),
    senha: z
      .string({ required_error: 'Senha é obrigatória.' })
      .min(1, 'Senha é obrigatória.'),
  }),
});

export type LoginUserDto = z.infer<typeof LoginUserSchema>['body'];

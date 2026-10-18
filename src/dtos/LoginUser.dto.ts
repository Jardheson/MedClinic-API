import { z } from 'zod';

export const LoginUserSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'email é obrigatório.' })
      .email('email inválido.'),
    password: z
      .string({ required_error: 'password é obrigatório.' })
      .min(1, 'password é obrigatório.'),
  }),
});

export type LoginUserDto = z.infer<typeof LoginUserSchema>['body'];

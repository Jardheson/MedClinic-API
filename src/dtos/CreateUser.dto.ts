import { z } from 'zod';
import { UserRole } from '../entities/UserRole.enum';

export const CreateUserSchema = z.object({
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
    roles: z
      .array(z.nativeEnum(UserRole), { required_error: 'roles é obrigatório.' })
      .min(1, 'roles deve conter ao menos um perfil.'),
  }),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>['body'];

import { z } from 'zod';
import { UserRole } from '../entities/UserRole.enum';

export const CreateUserSchema = z.object({
  body: z.object({
    nome: z
      .string({ required_error: 'Nome é obrigatório.' })
      .min(2, 'Nome deve ter pelo menos 2 caracteres.')
      .max(150, 'Nome deve ter no máximo 150 caracteres.'),
    email: z
      .string({ required_error: 'E-mail é obrigatório.' })
      .email('Formato de e-mail inválido.'),
    senha: z
      .string({ required_error: 'Senha é obrigatória.' })
      .min(8, 'Senha deve ter pelo menos 8 caracteres.'),
    role: z
      .nativeEnum(UserRole, {
        required_error: 'Perfil (role) é obrigatório.',
        message: 'Perfil inválido. Use "administrador" ou "atendente".',
      })
      .default(UserRole.ATTENDANT),
  }),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>['body'];

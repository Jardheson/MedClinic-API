import { DataSource } from 'typeorm';
import { UserRole } from '../entities/UserRole.enum';
import { UserRepository } from '../repositories/User.repository';
import { hashPassword } from '../utils/hashPassword';

export interface AdminSeedConfig {
  name?: string;
  email?: string;
  password?: string;
}

export async function runAdminSeed(
  dataSource: DataSource,
  config: AdminSeedConfig = {},
): Promise<'created' | 'skipped'> {
  const name = config.name?.trim();
  const email = config.email?.trim().toLowerCase();
  const password = config.password?.trim();

  if (!name || !email || !password) {
    throw new Error(
      'Defina ADMIN_SEED_NAME, ADMIN_SEED_EMAIL e ADMIN_SEED_PASSWORD antes de executar o seed.',
    );
  }

  if (password.length < 8) {
    throw new Error('ADMIN_SEED_PASSWORD deve ter pelo menos 8 caracteres.');
  }

  const userRepository = new UserRepository(dataSource);
  const existingAdmin = await userRepository.existsByRole(UserRole.ADMIN);
  if (existingAdmin) {
    return 'skipped';
  }

  const existingEmail = await userRepository.findByEmail(email);
  if (existingEmail) {
    throw new Error(`O e-mail ${email} já está em uso por outro usuário.`);
  }

  const passwordHash = await hashPassword(password);
  await userRepository.create({
    name,
    email,
    passwordHash,
    role: UserRole.ADMIN,
  });

  return 'created';
}

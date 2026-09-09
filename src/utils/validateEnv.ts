import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z
    .string()
    .default('3000')
    .transform((val) => Number(val))
    .pipe(z.number().int().positive()),
  DB_HOST: z.string().min(1, 'DB_HOST é obrigatório.'),
  DB_PORT: z
    .string()
    .default('5432')
    .transform((val) => Number(val))
    .pipe(z.number().int().positive()),
  DB_USER: z.string().min(1, 'DB_USER é obrigatório.'),
  DB_PASSWORD: z.string().min(1, 'DB_PASSWORD é obrigatório.'),
  DB_NAME: z.string().min(1, 'DB_NAME é obrigatório.'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET deve ter pelo menos 16 caracteres.'),
  JWT_EXPIRES_IN: z.string().default('1d'),
});

export function validateEnv(): void {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  • ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    console.error(
      '[MedClinic-API] Variáveis de ambiente inválidas ou ausentes:\n' + issues,
    );
    process.exit(1);
  }
}

export type Env = z.infer<typeof envSchema>;

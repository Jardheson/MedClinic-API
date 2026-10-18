import 'dotenv/config';
import { z } from 'zod';

const requiredString = (name: string) =>
  z
    .string({ required_error: `${name} é obrigatório.` })
    .min(1, `${name} é obrigatório.`);

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z
    .string()
    .default('3000')
    .transform((val) => Number(val))
    .pipe(z.number().int().positive()),
  DB_HOST: requiredString('DB_HOST'),
  DB_PORT: z
    .string()
    .default('5432')
    .transform((val) => Number(val))
    .pipe(z.number().int().positive()),
  DB_USER: requiredString('DB_USER'),
  DB_PASSWORD: requiredString('DB_PASSWORD'),
  DB_NAME: requiredString('DB_NAME'),
  DB_SSL_ENABLED: z.enum(['true', 'false']).default('false'),
  JWT_SECRET: z
    .string({ required_error: 'JWT_SECRET é obrigatório.' })
    .min(16, 'JWT_SECRET deve ter pelo menos 16 caracteres.'),
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

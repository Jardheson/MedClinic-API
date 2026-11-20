import { afterEach, describe, expect, it, vi } from 'vitest';

const originalEnv = { ...process.env };

function restoreEnv() {
  process.env = { ...originalEnv };
}

describe('validateEnv', () => {
  afterEach(() => {
    restoreEnv();
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('não encerra o processo quando as variáveis obrigatórias estão válidas', async () => {
    process.env = {
      ...process.env,
      NODE_ENV: 'test',
      PORT: '3000',
      DB_HOST: 'localhost',
      DB_PORT: '5432',
      DB_USER: 'postgres',
      DB_PASSWORD: 'postgres',
      DB_NAME: 'medclinic',
      JWT_SECRET: 'uma-chave-de-teste-com-32-caracteres-ou-mais',
      JWT_EXPIRES_IN: '1d',
    };

    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('exit-called');
    }) as never);

    const { validateEnv } = await import('../src/utils/validateEnv');

    expect(() => validateEnv()).not.toThrow();
    expect(exitSpy).not.toHaveBeenCalled();
  });

  it('encerra o processo quando faltam variáveis obrigatórias', async () => {
    process.env = {
      ...process.env,
      NODE_ENV: 'test',
      DB_HOST: '',
      DB_PORT: '5432',
      DB_USER: '',
      DB_PASSWORD: '',
      DB_NAME: '',
      JWT_SECRET: 'curta',
      JWT_EXPIRES_IN: '1d',
    };

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('exit-called');
    }) as never);

    const { validateEnv } = await import('../src/utils/validateEnv');

    expect(() => validateEnv()).toThrow('exit-called');
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('encerra o processo quando JWT_SECRET tem menos de 32 caracteres', async () => {
    process.env = {
      ...process.env,
      NODE_ENV: 'test',
      DB_HOST: 'localhost',
      DB_PORT: '5432',
      DB_USER: 'postgres',
      DB_PASSWORD: 'postgres',
      DB_NAME: 'medclinic',
      JWT_SECRET: '1234567890123456789012345678901',
      JWT_EXPIRES_IN: '1d',
    };

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation((() => {
      throw new Error('exit-called');
    }) as never);

    const { validateEnv } = await import('../src/utils/validateEnv');

    expect(() => validateEnv()).toThrow('exit-called');
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('JWT_SECRET deve ter pelo menos 32 caracteres.'),
    );
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});

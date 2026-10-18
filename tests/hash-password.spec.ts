import { describe, expect, it } from 'vitest';
import { comparePassword, hashPassword } from '../src/utils/hashPassword';

describe('hashPassword utils', () => {
  it('gera hash diferente da senha original', async () => {
    const password = 'SenhaForte123!';

    const hashedPassword = await hashPassword(password);

    expect(hashedPassword).not.toBe(password);
    expect(hashedPassword.length).toBeGreaterThan(20);
  });

  it('compara senha correta com hash válido', async () => {
    const password = 'SenhaForte123!';
    const hashedPassword = await hashPassword(password);

    await expect(comparePassword(password, hashedPassword)).resolves.toBe(true);
  });

  it('rejeita senha incorreta para o hash informado', async () => {
    const hashedPassword = await hashPassword('SenhaForte123!');

    await expect(comparePassword('SenhaErrada123!', hashedPassword)).resolves.toBe(false);
  });
});

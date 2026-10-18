import { sign } from 'jsonwebtoken';
import { describe, expect, it } from 'vitest';
import { UserRole } from '../src/entities/UserRole.enum';
import { UnauthorizedError } from '../src/utils/errors/AppError';
import { generateAccessToken, verifyAccessToken } from '../src/utils/jwt';

const TEST_JWT_SECRET = process.env.JWT_SECRET ?? 'development-secret-change-me';

describe('jwt utils', () => {
  it('gera token e retorna expiresIn configurado', () => {
    const result = generateAccessToken({
      userId: 'doctor-1',
      role: UserRole.DOCTOR,
    });

    expect(result.token).toEqual(expect.any(String));
    expect(result.expiresIn).toBe('1d');
  });

  it('valida token gerado internamente', () => {
    const { token } = generateAccessToken({
      userId: 'doctor-1',
      role: UserRole.DOCTOR,
    });

    const payload = verifyAccessToken(token);

    expect(payload.userId).toBe('doctor-1');
    expect(payload.role).toBe(UserRole.DOCTOR);
  });

  it('retorna erro de token inválido para string malformada', () => {
    expect(() => verifyAccessToken('token-invalido')).toThrow(UnauthorizedError);
    expect(() => verifyAccessToken('token-invalido')).toThrow('Token inválido.');
  });

  it('retorna erro quando o token está expirado', () => {
    const expiredToken = sign(
      { userId: 'doctor-1', role: UserRole.DOCTOR },
      TEST_JWT_SECRET,
      { expiresIn: -1 },
    );

    expect(() => verifyAccessToken(expiredToken)).toThrow(UnauthorizedError);
    expect(() => verifyAccessToken(expiredToken)).toThrow('Token expirado. Realize um novo login.');
  });
});

import 'dotenv/config';
import { Secret, sign, SignOptions, TokenExpiredError, JsonWebTokenError, verify } from 'jsonwebtoken';
import { UserRole } from '../entities/UserRole.enum';
import { UnauthorizedError } from './errors/AppError';

export interface TokenPayload {
  userId: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

const JWT_SECRET: Secret = process.env.JWT_SECRET ?? 'development-secret-change-me';
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN ?? '1d';

export function generateAccessToken(payload: TokenPayload): { token: string; expiresIn: string } {
  const options = { expiresIn: JWT_EXPIRES_IN } as SignOptions;
  const token = sign(payload, JWT_SECRET, options);
  return { token, expiresIn: JWT_EXPIRES_IN };
}

export function verifyAccessToken(token: string): TokenPayload {
  try {
    const decoded = verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      throw new UnauthorizedError('Token expirado. Realize um novo login.');
    }
    if (error instanceof JsonWebTokenError) {
      throw new UnauthorizedError('Token inválido.');
    }
    throw new UnauthorizedError('Token inválido ou expirado.');
  }
}

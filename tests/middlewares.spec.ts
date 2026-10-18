import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserRole } from '../src/entities/UserRole.enum';
import {
  AppError,
  ForbiddenError,
  UnauthorizedError,
} from '../src/utils/errors/AppError';

const { verifyAccessTokenMock, findByIdMock } = vi.hoisted(() => ({
  verifyAccessTokenMock: vi.fn(),
  findByIdMock: vi.fn(),
}));

vi.mock('../src/utils/jwt', () => ({
  verifyAccessToken: verifyAccessTokenMock,
}));

vi.mock('../src/repositories/User.repository', () => ({
  userRepository: {
    findById: findByIdMock,
  },
}));

describe('middlewares', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('authenticate retorna erro quando o header Authorization está ausente', async () => {
    const { authenticate } = await import('../src/middlewares/authenticate.middleware');
    const next = vi.fn();

    await authenticate({ headers: {} } as any, {} as any, next);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it('authenticate injeta req.user quando o token é válido', async () => {
    verifyAccessTokenMock.mockReturnValueOnce({
      userId: 'doctor-1',
      role: UserRole.DOCTOR,
    });
    findByIdMock.mockResolvedValueOnce({
      id: 'doctor-1',
      role: UserRole.DOCTOR,
    });

    const { authenticate } = await import('../src/middlewares/authenticate.middleware');
    const req: any = {
      headers: { authorization: 'Bearer token-valido' },
    };
    const next = vi.fn();

    await authenticate(req, {} as any, next);

    expect(req.user).toEqual({
      userId: 'doctor-1',
      role: UserRole.DOCTOR,
    });
    expect(next).toHaveBeenCalledWith();
  });

  it('authorize nega acesso quando req.user está ausente', async () => {
    const { authorize } = await import('../src/middlewares/authorize.middleware');
    const next = vi.fn();

    authorize(UserRole.ADMIN)({} as any, {} as any, next);

    expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
  });

  it('authorize nega acesso quando o perfil não está permitido', async () => {
    const { authorize } = await import('../src/middlewares/authorize.middleware');
    const next = vi.fn();

    authorize(UserRole.ADMIN)(
      { user: { userId: 'doctor-1', role: UserRole.DOCTOR } } as any,
      {} as any,
      next,
    );

    expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
  });

  it('authorize permite acesso quando o perfil está permitido', async () => {
    const { authorize } = await import('../src/middlewares/authorize.middleware');
    const next = vi.fn();

    authorize(UserRole.DOCTOR)(
      { user: { userId: 'doctor-1', role: UserRole.DOCTOR } } as any,
      {} as any,
      next,
    );

    expect(next).toHaveBeenCalledWith();
  });

  it('errorHandler retorna payload padronizado para AppError', async () => {
    const { errorHandler } = await import('../src/middlewares/errorHandler.middleware');
    const status = vi.fn().mockReturnThis();
    const json = vi.fn().mockReturnThis();
    const res = { status, json } as any;

    errorHandler(new AppError('Erro controlado.', 409), {} as any, res, vi.fn());

    expect(status).toHaveBeenCalledWith(409);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 409,
        message: 'Erro controlado.',
      }),
    );
  });

  it('errorHandler retorna 500 para erro não tratado', async () => {
    const { errorHandler } = await import('../src/middlewares/errorHandler.middleware');
    const status = vi.fn().mockReturnThis();
    const json = vi.fn().mockReturnThis();
    const res = { status, json } as any;
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    errorHandler(new Error('Falha inesperada'), {} as any, res, vi.fn());

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: 'Erro interno do servidor.',
      }),
    );

    consoleErrorSpy.mockRestore();
  });
});

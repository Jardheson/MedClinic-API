import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotFoundError } from '../src/utils/errors/AppError';
import { UserRole } from '../src/entities/UserRole.enum';

const { getMeMock } = vi.hoisted(() => ({
  getMeMock: vi.fn(),
}));

vi.mock('../src/services/User.service', () => ({
  userService: {
    getMe: getMeMock,
  },
}));

vi.mock('../src/middlewares/authenticate.middleware', () => ({
  authenticate: (req: any, _res: any, next: any) => {
    req.user = { userId: 'doctor-1', role: UserRole.DOCTOR };
    next();
  },
}));

describe('User routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna 200 ao buscar /users/me com usuário autenticado', async () => {
    getMeMock.mockResolvedValueOnce({
      id: 'doctor-1',
      name: 'Dra. Alice',
      email: 'alice@medclinic.com',
      roles: [UserRole.DOCTOR],
    });

    const { app } = await import('../src/app');

    const response = await request(app).get('/api/v1/users/me');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: 'doctor-1',
      email: 'alice@medclinic.com',
      roles: [UserRole.DOCTOR],
    });
    expect(getMeMock).toHaveBeenCalledWith('doctor-1');
  });

  it('retorna 404 quando o usuário autenticado não é encontrado', async () => {
    getMeMock.mockRejectedValueOnce(new NotFoundError('Usuário autenticado não encontrado.'));

    const { app } = await import('../src/app');

    const response = await request(app).get('/api/v1/users/me');

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Usuário autenticado não encontrado.');
  });
});

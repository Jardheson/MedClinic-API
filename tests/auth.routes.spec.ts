import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { loginMock } = vi.hoisted(() => ({
  loginMock: vi.fn(),
}));

vi.mock('../src/services/Auth.service', () => ({
  authService: {
    login: loginMock,
  },
}));

describe('Auth routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna 200 no login com credenciais válidas', async () => {
    loginMock.mockResolvedValueOnce({
      accessToken: 'jwt-token',
      tokenType: 'Bearer',
      expiresIn: '1d',
    });

    const { app } = await import('../src/app');

    const response = await request(app).post('/api/v1/auth/login').send({
      email: 'alice@medclinic.com',
      password: 'SenhaForte123!',
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      accessToken: 'jwt-token',
      tokenType: 'Bearer',
      expiresIn: '1d',
    });
    expect(loginMock).toHaveBeenCalledWith({
      email: 'alice@medclinic.com',
      password: 'SenhaForte123!',
    });
  });

  it('retorna 400 quando o payload do login é inválido', async () => {
    const { app } = await import('../src/app');

    const response = await request(app).post('/api/v1/auth/login').send({
      email: 'email-invalido',
      password: '',
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Dados inválidos');
    expect(loginMock).not.toHaveBeenCalled();
  });
});

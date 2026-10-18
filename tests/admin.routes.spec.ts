import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const authContext = vi.hoisted(() => ({
  role: 'admin',
}));

vi.mock('../src/middlewares/authenticate.middleware', () => ({
  authenticate: (req: any, _res: any, next: any) => {
    req.user = { userId: 'user-1', role: authContext.role };
    next();
  },
}));

describe('Admin routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authContext.role = 'admin';
  });

  it('retorna 200 em /admin/ping para administrador', async () => {
    authContext.role = 'admin';
    const { app } = await import('../src/app');

    const response = await request(app).get('/api/v1/admin/ping');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'pong admin',
      authenticatedAs: {
        userId: 'user-1',
        role: 'admin',
      },
    });
  });

  it('retorna 403 em /admin/ping para perfil sem permissão', async () => {
    authContext.role = 'doctor';
    const { app } = await import('../src/app');

    const response = await request(app).get('/api/v1/admin/ping');

    expect(response.status).toBe(403);
    expect(response.body.message).toContain('não possui permissão');
  });
});

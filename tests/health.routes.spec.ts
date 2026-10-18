import request from 'supertest';
import { describe, expect, it } from 'vitest';

describe('Health route', () => {
  it('retorna status da API em /api/v1/health', async () => {
    const { app } = await import('../src/app');

    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});

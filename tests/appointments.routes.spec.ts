import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BadRequestError, NotFoundError } from '../src/utils/errors/AppError';
import { UserRole } from '../src/entities/UserRole.enum';

const { createMock, updateStatusMock } = vi.hoisted(() => ({
  createMock: vi.fn(),
  updateStatusMock: vi.fn(),
}));

vi.mock('../src/services/Appointment.service', () => ({
  appointmentService: {
    create: createMock,
    updateStatus: updateStatusMock,
  },
}));

vi.mock('../src/middlewares/authenticate.middleware', () => ({
  authenticate: (req: any, _res: any, next: any) => {
    req.user = { userId: 'attendant-1', role: UserRole.ATTENDANT };
    next();
  },
}));

vi.mock('../src/middlewares/authorize.middleware', () => ({
  authorize:
    (..._allowedRoles: UserRole[]) =>
    (_req: any, _res: any, next: any) => {
      next();
    },
}));

describe('Appointment routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna 201 ao criar consulta com payload válido', async () => {
    createMock.mockResolvedValueOnce({
      id: 'appointment-1',
      doctorId: '550e8400-e29b-41d4-a716-446655440001',
      patientId: '550e8400-e29b-41d4-a716-446655440000',
      status: 'scheduled',
      startsAt: '2026-10-19T09:00:00.000Z',
      endsAt: '2026-10-19T10:00:00.000Z',
      createdAt: '2026-10-18T16:00:00.000Z',
    });

    const { app } = await import('../src/app');

    const response = await request(app).post('/api/v1/appointments').send({
      doctorId: '550e8400-e29b-41d4-a716-446655440001',
      patientId: '550e8400-e29b-41d4-a716-446655440000',
      startsAt: '2026-10-19T09:00:00.000Z',
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      id: 'appointment-1',
      status: 'scheduled',
    });
    expect(createMock).toHaveBeenCalledWith({
      doctorId: '550e8400-e29b-41d4-a716-446655440001',
      patientId: '550e8400-e29b-41d4-a716-446655440000',
      startsAt: '2026-10-19T09:00:00.000Z',
    });
  });

  it('retorna 400 quando o payload de criação é inválido', async () => {
    const { app } = await import('../src/app');

    const response = await request(app).post('/api/v1/appointments').send({
      doctorId: 'invalido',
      patientId: 'invalido',
      startsAt: 'data-ruim',
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Dados inválidos');
    expect(createMock).not.toHaveBeenCalled();
  });

  it('retorna 400 quando o service rejeita doctorId que não é médico', async () => {
    createMock.mockRejectedValueOnce(
      new BadRequestError('doctorId deve pertencer a um usuário com perfil "doctor".'),
    );

    const { app } = await import('../src/app');

    const response = await request(app).post('/api/v1/appointments').send({
      doctorId: '550e8400-e29b-41d4-a716-446655440001',
      patientId: '550e8400-e29b-41d4-a716-446655440000',
      startsAt: '2026-10-19T09:00:00.000Z',
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('perfil "doctor"');
  });

  it('retorna 200 ao atualizar status da consulta', async () => {
    updateStatusMock.mockResolvedValueOnce({
      id: '550e8400-e29b-41d4-a716-446655440099',
      doctorId: '550e8400-e29b-41d4-a716-446655440001',
      patientId: '550e8400-e29b-41d4-a716-446655440000',
      status: 'done',
      startsAt: '2026-10-19T09:00:00.000Z',
      endsAt: '2026-10-19T10:00:00.000Z',
      createdAt: '2026-10-18T16:00:00.000Z',
    });

    const { app } = await import('../src/app');

    const response = await request(app)
      .patch('/api/v1/appointments/550e8400-e29b-41d4-a716-446655440099/status')
      .send({ status: 'done' });

    expect(response.status).toBe(200);
    expect(updateStatusMock).toHaveBeenCalledWith(
      '550e8400-e29b-41d4-a716-446655440099',
      { status: 'done' },
    );
  });

  it('retorna 400 quando id é inválido', async () => {
    const { app } = await import('../src/app');

    const response = await request(app)
      .patch('/api/v1/appointments/invalido/status')
      .send({ status: 'done' });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('id inválido');
  });

  it('retorna 404 quando a consulta não existe', async () => {
    updateStatusMock.mockRejectedValueOnce(new NotFoundError('Consulta não encontrada.'));

    const { app } = await import('../src/app');

    const response = await request(app)
      .patch('/api/v1/appointments/550e8400-e29b-41d4-a716-446655440099/status')
      .send({ status: 'done' });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Consulta não encontrada.');
  });
});

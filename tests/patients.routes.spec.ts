import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConflictError, NotFoundError } from '../src/utils/errors/AppError';
import { UserRole } from '../src/entities/UserRole.enum';

const { createMock, findByIdMock } = vi.hoisted(() => ({
  createMock: vi.fn(),
  findByIdMock: vi.fn(),
}));

vi.mock('../src/services/Patient.service', () => ({
  patientService: {
    create: createMock,
    findById: findByIdMock,
  },
}));

vi.mock('../src/middlewares/authenticate.middleware', () => ({
  authenticate: (req: any, _res: any, next: any) => {
    req.user = { userId: 'admin-1', role: UserRole.ADMIN };
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

describe('Patient routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna 201 ao criar paciente com payload válido', async () => {
    createMock.mockResolvedValueOnce({
      id: 'patient-1',
      name: 'Maria Souza',
      cpf: '12345678901',
      createdAt: '2026-10-18T15:00:00.000Z',
    });

    const { app } = await import('../src/app');

    const response = await request(app).post('/api/v1/patients').send({
      name: 'Maria Souza',
      cpf: '12345678901',
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      id: 'patient-1',
      cpf: '12345678901',
    });
    expect(createMock).toHaveBeenCalledWith({
      name: 'Maria Souza',
      cpf: '12345678901',
    });
  });

  it('retorna 400 quando os dados do paciente são inválidos', async () => {
    const { app } = await import('../src/app');

    const response = await request(app).post('/api/v1/patients').send({
      name: 'M',
      cpf: '123',
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Dados inválidos');
    expect(createMock).not.toHaveBeenCalled();
  });

  it('retorna 409 quando o service sinaliza conflito de cpf', async () => {
    createMock.mockRejectedValueOnce(new ConflictError('CPF já cadastrado.', 'CPF_JA_CADASTRADO'));

    const { app } = await import('../src/app');

    const response = await request(app).post('/api/v1/patients').send({
      name: 'Maria Souza',
      cpf: '12345678901',
    });

    expect(response.status).toBe(409);
    expect(response.body.message).toContain('CPF já cadastrado');
  });

  it('retorna 200 ao buscar paciente por id válido', async () => {
    findByIdMock.mockResolvedValueOnce({
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Maria Souza',
      cpf: '12345678901',
      createdAt: '2026-10-18T15:00:00.000Z',
    });

    const { app } = await import('../src/app');

    const response = await request(app).get(
      '/api/v1/patients/550e8400-e29b-41d4-a716-446655440000',
    );

    expect(response.status).toBe(200);
    expect(findByIdMock).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440000');
  });

  it('retorna 400 quando id é inválido', async () => {
    const { app } = await import('../src/app');

    const response = await request(app).get('/api/v1/patients/invalido');

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('id inválido');
  });

  it('retorna 404 quando o paciente não existe', async () => {
    findByIdMock.mockRejectedValueOnce(new NotFoundError('Paciente não encontrado.'));

    const { app } = await import('../src/app');

    const response = await request(app).get(
      '/api/v1/patients/550e8400-e29b-41d4-a716-446655440000',
    );

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Paciente não encontrado.');
  });
});

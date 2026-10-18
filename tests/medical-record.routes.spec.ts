import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ForbiddenError } from '../src/utils/errors/AppError';
import { UserRole } from '../src/entities/UserRole.enum';

const { createMock, listByPatientMock } = vi.hoisted(() => ({
  createMock: vi.fn(),
  listByPatientMock: vi.fn(),
}));

vi.mock('../src/services/MedicalRecord.service', () => ({
  medicalRecordService: {
    create: createMock,
    listByPatient: listByPatientMock,
  },
}));

vi.mock('../src/middlewares/authenticate.middleware', () => ({
  authenticate: (req: any, _res: any, next: any) => {
    req.user = { userId: 'doctor-1', role: UserRole.DOCTOR };
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

describe('Medical record routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna 201 ao criar prontuário com payload válido', async () => {
    createMock.mockResolvedValueOnce({
      id: 'record-1',
      doctorId: 'doctor-1',
      patientId: '550e8400-e29b-41d4-a716-446655440000',
      descricao: 'Paciente evoluiu bem após atendimento clínico.',
      prescricao: 'Retorno em 7 dias.',
      createdAt: '2026-10-18T12:00:00.000Z',
    });

    const { app } = await import('../src/app');

    const response = await request(app)
      .post('/api/v1/patients/550e8400-e29b-41d4-a716-446655440000/medical-records')
      .send({
        descricao: 'Paciente evoluiu bem após atendimento clínico.',
        prescricao: 'Retorno em 7 dias.',
      });

    expect(response.status).toBe(201);
    expect(response.body.id).toBe('record-1');
    expect(createMock).toHaveBeenCalledWith(
      'doctor-1',
      '550e8400-e29b-41d4-a716-446655440000',
      {
        descricao: 'Paciente evoluiu bem após atendimento clínico.',
        prescricao: 'Retorno em 7 dias.',
      },
    );
  });

  it('retorna 400 quando patientId é inválido', async () => {
    const { app } = await import('../src/app');

    const response = await request(app).get('/api/v1/patients/invalido/medical-records');

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('patientId inválido');
    expect(listByPatientMock).not.toHaveBeenCalled();
  });

  it('retorna 403 quando o service nega acesso por falta de vínculo', async () => {
    listByPatientMock.mockRejectedValueOnce(
      new ForbiddenError(
        'Médico não possui vínculo válido com este paciente para acessar o prontuário.',
      ),
    );

    const { app } = await import('../src/app');

    const response = await request(app).get(
      '/api/v1/patients/550e8400-e29b-41d4-a716-446655440000/medical-records',
    );

    expect(response.status).toBe(403);
    expect(response.body.message).toContain('vínculo válido');
  });

  it('retorna 200 ao listar prontuários do paciente', async () => {
    listByPatientMock.mockResolvedValueOnce([
      {
        id: 'record-2',
        doctorId: 'doctor-1',
        patientId: '550e8400-e29b-41d4-a716-446655440000',
        descricao: 'Consulta de retorno sem intercorrências.',
        prescricao: null,
        createdAt: '2026-10-18T14:00:00.000Z',
      },
    ]);

    const { app } = await import('../src/app');

    const response = await request(app).get(
      '/api/v1/patients/550e8400-e29b-41d4-a716-446655440000/medical-records',
    );

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(listByPatientMock).toHaveBeenCalledWith(
      'doctor-1',
      UserRole.DOCTOR,
      '550e8400-e29b-41d4-a716-446655440000',
    );
  });
});

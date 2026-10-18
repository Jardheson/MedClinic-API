import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserRole } from '../src/entities/UserRole.enum';

const { createMock, listMock, findByIdMock } = vi.hoisted(() => ({
  createMock: vi.fn(),
  listMock: vi.fn(),
  findByIdMock: vi.fn(),
}));

vi.mock('../src/services/Doctor.service', () => ({
  doctorService: {
    create: createMock,
    list: listMock,
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

describe('Doctor routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna 201 ao criar médico', async () => {
    createMock.mockResolvedValueOnce({
      id: 'doctor-user-1',
      name: 'Dra. Alice',
      email: 'alice@medclinic.com',
      crm: 'CRM1234',
      roles: [UserRole.DOCTOR],
    });

    const { app } = await import('../src/app');

    const response = await request(app).post('/api/v1/doctors').send({
      name: 'Dra. Alice',
      email: 'alice@medclinic.com',
      password: 'SenhaForte123!',
      crm: 'CRM1234',
    });

    expect(response.status).toBe(201);
    expect(response.body.id).toBe('doctor-user-1');
    expect(createMock).toHaveBeenCalledWith({
      name: 'Dra. Alice',
      email: 'alice@medclinic.com',
      password: 'SenhaForte123!',
      crm: 'CRM1234',
    });
  });

  it('retorna 200 ao listar médicos', async () => {
    listMock.mockResolvedValueOnce({
      data: [{ id: 'doctor-user-1', name: 'Dra. Alice', email: 'alice@medclinic.com', crm: 'CRM1234', roles: [UserRole.DOCTOR] }],
      meta: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
    });

    const { app } = await import('../src/app');
    const response = await request(app).get('/api/v1/doctors?page=1&pageSize=10&name=Alice');

    expect(response.status).toBe(200);
    expect(listMock).toHaveBeenCalledWith({
      page: 1,
      pageSize: 10,
      name: 'Alice',
      crm: undefined,
    });
  });

  it('retorna 200 ao buscar médico por id', async () => {
    findByIdMock.mockResolvedValueOnce({
      id: 'doctor-user-1',
      name: 'Dra. Alice',
      email: 'alice@medclinic.com',
      crm: 'CRM1234',
      roles: [UserRole.DOCTOR],
    });

    const { app } = await import('../src/app');
    const response = await request(app).get('/api/v1/doctors/550e8400-e29b-41d4-a716-446655440001');

    expect(response.status).toBe(200);
    expect(findByIdMock).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440001');
  });
});

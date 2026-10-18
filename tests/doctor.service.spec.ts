import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DoctorService } from '../src/services/Doctor.service';
import { UserRole } from '../src/entities/UserRole.enum';
import { ConflictError, NotFoundError } from '../src/utils/errors/AppError';

const { hashPasswordMock } = vi.hoisted(() => ({
  hashPasswordMock: vi.fn(),
}));

vi.mock('../src/utils/hashPassword', () => ({
  hashPassword: hashPasswordMock,
}));

function createDependencies() {
  return {
    doctorRepo: {
      findByCrm: vi.fn(),
      create: vi.fn(),
      list: vi.fn(),
      findByUserId: vi.fn(),
    },
    userRepo: {
      findByEmail: vi.fn(),
      create: vi.fn(),
    },
  };
}

function buildService(deps: ReturnType<typeof createDependencies>): DoctorService {
  const service = new DoctorService();
  Reflect.set(service, 'doctorRepo', deps.doctorRepo);
  Reflect.set(service, 'userRepo', deps.userRepo);
  return service;
}

describe('DoctorService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('bloqueia criação quando o e-mail já existe', async () => {
    const deps = createDependencies();
    deps.userRepo.findByEmail.mockResolvedValueOnce({ id: 'user-1' });

    const service = buildService(deps);

    await expect(
      service.create({
        name: 'Dra. Alice',
        email: 'alice@medclinic.com',
        password: 'SenhaForte123!',
        crm: 'CRM1234',
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('bloqueia criação quando o crm já existe', async () => {
    const deps = createDependencies();
    deps.userRepo.findByEmail.mockResolvedValueOnce(null);
    deps.doctorRepo.findByCrm.mockResolvedValueOnce({ userId: 'doctor-1' });

    const service = buildService(deps);

    await expect(
      service.create({
        name: 'Dra. Alice',
        email: 'alice@medclinic.com',
        password: 'SenhaForte123!',
        crm: 'CRM1234',
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('cria médico e retorna payload público usando userId', async () => {
    const deps = createDependencies();
    deps.userRepo.findByEmail.mockResolvedValueOnce(null);
    deps.doctorRepo.findByCrm.mockResolvedValueOnce(null);
    hashPasswordMock.mockResolvedValueOnce('password-hash');
    deps.userRepo.create.mockResolvedValueOnce({
      id: 'doctor-user-1',
      nome: 'Dra. Alice',
      email: 'alice@medclinic.com',
      role: UserRole.DOCTOR,
    });
    deps.doctorRepo.create.mockResolvedValueOnce({
      id: 'doctor-row-1',
      userId: 'doctor-user-1',
      crm: 'CRM1234',
      createdAt: new Date('2026-10-18T12:00:00.000Z'),
    });

    const service = buildService(deps);

    const result = await service.create({
      name: 'Dra. Alice',
      email: 'alice@medclinic.com',
      password: 'SenhaForte123!',
      crm: 'CRM1234',
    });

    expect(result).toMatchObject({
      id: 'doctor-user-1',
      name: 'Dra. Alice',
      email: 'alice@medclinic.com',
      crm: 'CRM1234',
      roles: [UserRole.DOCTOR],
    });
  });

  it('retorna médico por userId', async () => {
    const deps = createDependencies();
    deps.doctorRepo.findByUserId.mockResolvedValueOnce({
      userId: 'doctor-user-1',
      crm: 'CRM1234',
      createdAt: new Date('2026-10-18T12:00:00.000Z'),
      user: {
        id: 'doctor-user-1',
        nome: 'Dra. Alice',
        email: 'alice@medclinic.com',
        role: UserRole.DOCTOR,
      },
    });

    const service = buildService(deps);
    const result = await service.findById('doctor-user-1');

    expect(result.id).toBe('doctor-user-1');
    expect(result.crm).toBe('CRM1234');
  });

  it('retorna erro quando o médico não existe', async () => {
    const deps = createDependencies();
    deps.doctorRepo.findByUserId.mockResolvedValueOnce(null);

    const service = buildService(deps);

    await expect(service.findById('doctor-user-1')).rejects.toBeInstanceOf(NotFoundError);
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PatientService } from '../src/services/Patient.service';
import { ConflictError, NotFoundError } from '../src/utils/errors/AppError';

interface PatientRepositoryMock {
  findByCpf: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  findById: ReturnType<typeof vi.fn>;
}

function createDependencies(): { patientRepo: PatientRepositoryMock } {
  return {
    patientRepo: {
      findByCpf: vi.fn(),
      create: vi.fn(),
      findById: vi.fn(),
    },
  };
}

function buildService(deps: ReturnType<typeof createDependencies>): PatientService {
  const service = new PatientService();
  Reflect.set(service, 'patientRepo', deps.patientRepo);
  return service;
}

describe('PatientService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('bloqueia criação quando o cpf do paciente já existe', async () => {
    const deps = createDependencies();
    deps.patientRepo.findByCpf.mockResolvedValueOnce({ id: 'patient-1' });

    const service = buildService(deps);

    await expect(
      service.create({
        name: 'Maria Souza',
        cpf: '12345678901',
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('cria paciente e retorna payload mapeado', async () => {
    const deps = createDependencies();
    deps.patientRepo.findByCpf.mockResolvedValueOnce(null);
    deps.patientRepo.create.mockResolvedValueOnce({
      id: 'patient-1',
      name: 'Maria Souza',
      cpf: '12345678901',
      createdAt: new Date('2026-10-18T12:00:00.000Z'),
    });

    const service = buildService(deps);

    const result = await service.create({
      name: 'Maria Souza',
      cpf: '12345678901',
    });

    expect(deps.patientRepo.create).toHaveBeenCalledWith({
      name: 'Maria Souza',
      cpf: '12345678901',
    });
    expect(result).toMatchObject({
      id: 'patient-1',
      cpf: '12345678901',
      name: 'Maria Souza',
    });
  });

  it('busca paciente por id com sucesso', async () => {
    const deps = createDependencies();
    deps.patientRepo.findById.mockResolvedValueOnce({
      id: 'patient-1',
      name: 'Maria Souza',
      cpf: '12345678901',
      createdAt: new Date('2026-10-18T12:00:00.000Z'),
    });

    const service = buildService(deps);

    const result = await service.findById('patient-1');

    expect(deps.patientRepo.findById).toHaveBeenCalledWith('patient-1');
    expect(result.name).toBe('Maria Souza');
  });

  it('retorna erro quando o paciente não existe', async () => {
    const deps = createDependencies();
    deps.patientRepo.findById.mockResolvedValueOnce(null);

    const service = buildService(deps);

    await expect(service.findById('patient-inexistente')).rejects.toBeInstanceOf(NotFoundError);
  });
});

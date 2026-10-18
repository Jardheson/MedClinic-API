import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserService } from '../src/services/User.service';
import { UserRole } from '../src/entities/UserRole.enum';
import { NotFoundError } from '../src/utils/errors/AppError';

interface UserRepositoryMock {
  findById: ReturnType<typeof vi.fn>;
}

function createDependencies(): { userRepo: UserRepositoryMock } {
  return {
    userRepo: {
      findById: vi.fn(),
    },
  };
}

function buildService(deps: ReturnType<typeof createDependencies>): UserService {
  const service = new UserService();
  Reflect.set(service, 'userRepo', deps.userRepo);
  return service;
}

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna dados do usuário autenticado sem senha', async () => {
    const deps = createDependencies();
    deps.userRepo.findById.mockResolvedValueOnce({
      id: 'user-1',
      nome: 'Dra. Alice',
      email: 'alice@medclinic.com',
      role: UserRole.DOCTOR,
      createdAt: new Date('2026-10-18T10:00:00.000Z'),
    });

    const service = buildService(deps);
    const result = await service.getMe('user-1');

    expect(result).toMatchObject({
      id: 'user-1',
      name: 'Dra. Alice',
      email: 'alice@medclinic.com',
      roles: [UserRole.DOCTOR],
    });
  });

  it('retorna erro quando o usuário autenticado não existe', async () => {
    const deps = createDependencies();
    deps.userRepo.findById.mockResolvedValueOnce(null);

    const service = buildService(deps);

    await expect(service.getMe('user-inexistente')).rejects.toBeInstanceOf(NotFoundError);
  });
});

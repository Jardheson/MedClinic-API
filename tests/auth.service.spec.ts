import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../src/services/Auth.service';
import { UserRole } from '../src/entities/UserRole.enum';
import { UnauthorizedError } from '../src/utils/errors/AppError';

const {
  comparePasswordMock,
  generateAccessTokenMock,
} = vi.hoisted(() => ({
  comparePasswordMock: vi.fn(),
  generateAccessTokenMock: vi.fn(),
}));

vi.mock('../src/utils/hashPassword', () => ({
  comparePassword: comparePasswordMock,
}));

vi.mock('../src/utils/jwt', () => ({
  generateAccessToken: generateAccessTokenMock,
}));

interface UserRepositoryMock {
  findByEmail: ReturnType<typeof vi.fn>;
}

function createUserRepositoryMock(): UserRepositoryMock {
  return {
    findByEmail: vi.fn(),
  };
}

function buildService(userRepo: UserRepositoryMock): AuthService {
  const service = new AuthService();
  Reflect.set(service, 'userRepo', userRepo);
  return service;
}

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna token no login com credenciais válidas', async () => {
    const userRepo = createUserRepositoryMock();
    userRepo.findByEmail.mockResolvedValueOnce({
      id: 'doctor-1',
      email: 'alice@medclinic.com',
      senha: 'senha-hash',
      role: UserRole.DOCTOR,
    });
    comparePasswordMock.mockResolvedValueOnce(true);
    generateAccessTokenMock.mockReturnValueOnce({
      token: 'jwt-token',
      expiresIn: '1d',
    });

    const service = buildService(userRepo);

    const result = await service.login({
      email: 'alice@medclinic.com',
      password: 'SenhaForte123!',
    });

    expect(comparePasswordMock).toHaveBeenCalledWith('SenhaForte123!', 'senha-hash');
    expect(generateAccessTokenMock).toHaveBeenCalledWith({
      userId: 'doctor-1',
      role: UserRole.DOCTOR,
    });
    expect(result).toEqual({
      accessToken: 'jwt-token',
      tokenType: 'Bearer',
      expiresIn: '1d',
    });
  });

  it('falha no login quando a senha não confere', async () => {
    const userRepo = createUserRepositoryMock();
    userRepo.findByEmail.mockResolvedValueOnce({
      id: 'doctor-1',
      email: 'alice@medclinic.com',
      senha: 'senha-hash',
      role: UserRole.DOCTOR,
    });
    comparePasswordMock.mockResolvedValueOnce(false);

    const service = buildService(userRepo);

    await expect(
      service.login({
        email: 'alice@medclinic.com',
        password: 'SenhaErrada123!',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });
});

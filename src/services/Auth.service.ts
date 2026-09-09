import { CreateUserDto } from '../dtos/CreateUser.dto';
import { LoginUserDto } from '../dtos/LoginUser.dto';
import { LoginResponseDto } from '../dtos/LoginResponse.dto';
import { UserResponseDto } from '../dtos/UserResponse.dto';
import { User } from '../entities/User.entity';
import { userRepository } from '../repositories/User.repository';
import {
  ConflictError,
  UnauthorizedError,
} from '../utils/errors/AppError';
import { comparePassword, hashPassword } from '../utils/hashPassword';
import { generateAccessToken } from '../utils/jwt';

export class AuthService {
  private readonly userRepo = userRepository;

  public async register(dto: CreateUserDto): Promise<UserResponseDto> {
    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing) {
      throw new ConflictError('E-mail já cadastrado.');
    }

    const hashed = await hashPassword(dto.senha);
    const user = await this.userRepo.create({
      nome: dto.nome,
      email: dto.email,
      senha: hashed,
      role: dto.role,
    });

    return AuthService.mapToResponse(user);
  }

  public async login(dto: LoginUserDto): Promise<LoginResponseDto> {
    const user = await this.userRepo.findByEmail(dto.email, true);
    if (!user) {
      throw new UnauthorizedError('Credenciais inválidas.');
    }

    const passwordMatch = await comparePassword(dto.senha, user.senha);
    if (!passwordMatch) {
      throw new UnauthorizedError('Credenciais inválidas.');
    }

    const { token, expiresIn } = generateAccessToken({
      userId: user.id,
      role: user.role,
    });

    return {
      accessToken: token,
      tokenType: 'Bearer',
      expiresIn,
    };
  }

  private static mapToResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      nome: user.nome,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}

export const authService = new AuthService();

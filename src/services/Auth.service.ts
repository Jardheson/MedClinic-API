import { UserRole } from '../entities/UserRole.enum';
import { CreateUserDto } from '../dtos/CreateUser.dto';
import { LoginUserDto } from '../dtos/LoginUser.dto';
import { LoginResponseDto } from '../dtos/LoginResponse.dto';
import { UserResponseDto } from '../dtos/UserResponse.dto';
import { userRepository } from '../repositories/User.repository';
import {
  ConflictError,
  UnauthorizedError,
} from '../utils/errors/AppError';
import { comparePassword, hashPassword } from '../utils/hashPassword';
import { generateAccessToken } from '../utils/jwt';
import { mapUserToResponseDto } from './mappers/User.mapper';

export class AuthService {
  private readonly userRepo = userRepository;

  public async register(dto: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.findUserByEmail(dto.email);
    if (existingUser) {
      throw new ConflictError('E-mail já cadastrado.');
    }

    const hashedPassword = await this.hashUserPassword(dto.senha);
    const createdUser = await this.persistNewUser(dto, hashedPassword);
    return mapUserToResponseDto(createdUser);
  }

  public async login(dto: LoginUserDto): Promise<LoginResponseDto> {
    const user = await this.findUserByEmailIncludingPassword(dto.email);
    if (!user) {
      throw new UnauthorizedError('Credenciais inválidas.');
    }

    const passwordMatch = await comparePassword(dto.senha, user.senha);
    if (!passwordMatch) {
      throw new UnauthorizedError('Credenciais inválidas.');
    }

    return this.buildLoginResponse(user.id, user.role);
  }

  private async findUserByEmail(email: string) {
    return this.userRepo.findByEmail(email);
  }

  private async findUserByEmailIncludingPassword(email: string) {
    return this.userRepo.findByEmail(email, true);
  }

  private async hashUserPassword(plainPassword: string): Promise<string> {
    return hashPassword(plainPassword);
  }

  private async persistNewUser(dto: CreateUserDto, hashedPassword: string) {
    return this.userRepo.create({
      nome: dto.nome,
      email: dto.email,
      senha: hashedPassword,
      role: dto.role,
    });
  }

  private buildLoginResponse(userId: string, role: UserRole): LoginResponseDto {
    const { token, expiresIn } = generateAccessToken({ userId, role });
    return { accessToken: token, tokenType: 'Bearer', expiresIn };
  }
}

export const authService = new AuthService();

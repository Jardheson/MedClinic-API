import { UserRole } from '../entities/UserRole.enum';
import { LoginUserDto } from '../dtos/LoginUser.dto';
import { LoginResponseDto } from '../dtos/LoginResponse.dto';
import { userRepository } from '../repositories/User.repository';
import { UnauthorizedError } from '../utils/errors/AppError';
import { comparePassword } from '../utils/hashPassword';
import { generateAccessToken } from '../utils/jwt';

export class AuthService {
  private readonly userRepo = userRepository;

  public async login(dto: LoginUserDto): Promise<LoginResponseDto> {
    const user = await this.findUserByEmailIncludingPassword(dto.email);
    if (!user) {
      throw new UnauthorizedError('Credenciais inválidas.', 'CREDENCIAIS_INVALIDAS');
    }

    const passwordMatch = await comparePassword(dto.password, user.senha);
    if (!passwordMatch) {
      throw new UnauthorizedError('Credenciais inválidas.', 'CREDENCIAIS_INVALIDAS');
    }

    return this.buildLoginResponse(user.id, user.role);
  }

  private async findUserByEmailIncludingPassword(email: string) {
    return this.userRepo.findByEmail(email, true);
  }

  private buildLoginResponse(userId: string, role: UserRole): LoginResponseDto {
    const { token, expiresIn } = generateAccessToken({ userId, role });
    return { accessToken: token, tokenType: 'Bearer', expiresIn };
  }
}

export const authService = new AuthService();

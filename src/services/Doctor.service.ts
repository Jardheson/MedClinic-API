import { CreateDoctorDto } from '../dtos/CreateDoctor.dto';
import { DoctorResponseDto } from '../dtos/DoctorResponse.dto';
import { UserRole } from '../entities/UserRole.enum';
import { doctorRepository } from '../repositories/Doctor.repository';
import { userRepository } from '../repositories/User.repository';
import { ConflictError, NotFoundError } from '../utils/errors/AppError';
import { hashPassword } from '../utils/hashPassword';

interface ListDoctorsDto {
  page: number;
  pageSize: number;
  name?: string;
  crm?: string;
}

export class DoctorService {
  private readonly doctorRepo = doctorRepository;
  private readonly userRepo = userRepository;

  public async create(dto: CreateDoctorDto): Promise<DoctorResponseDto> {
    const existingUser = await this.userRepo.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictError('E-mail já cadastrado.', 'EMAIL_JA_CADASTRADO');
    }

    const existingDoctor = await this.doctorRepo.findByCrm(dto.crm);
    if (existingDoctor) {
      throw new ConflictError('CRM já cadastrado.', 'CRM_JA_CADASTRADO');
    }

    const passwordHash = await hashPassword(dto.password);
    const user = await this.userRepo.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      role: UserRole.DOCTOR,
    });

    const doctor = await this.doctorRepo.create({
      userId: user.id,
      crm: dto.crm,
    });

    return this.mapToResponse({ ...doctor, user });
  }

  public async list(dto: ListDoctorsDto) {
    const [data, total] = await this.doctorRepo.list(dto);
    return {
      data: data.map((doctor) => this.mapToResponse(doctor)),
      meta: {
        page: dto.page,
        pageSize: dto.pageSize,
        total,
        totalPages: Math.ceil(total / dto.pageSize) || 1,
      },
    };
  }

  public async findById(doctorId: string): Promise<DoctorResponseDto> {
    const doctor = await this.doctorRepo.findByUserId(doctorId);
    if (!doctor) {
      throw new NotFoundError('Médico não encontrado.', 'MEDICO_NAO_ENCONTRADO');
    }

    return this.mapToResponse(doctor);
  }

  private mapToResponse(doctor: {
    userId: string;
    crm: string;
    createdAt: Date;
    user: {
      id: string;
      nome: string;
      email: string;
      role: UserRole;
    };
  }): DoctorResponseDto {
    return {
      id: doctor.userId,
      crm: doctor.crm,
      createdAt: doctor.createdAt,
      name: doctor.user.nome,
      email: doctor.user.email,
      roles: [doctor.user.role],
    };
  }
}

export const doctorService = new DoctorService();

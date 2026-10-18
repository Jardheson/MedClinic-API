import { CreatePatientDto } from '../dtos/CreatePatient.dto';
import { PatientResponseDto } from '../dtos/PatientResponse.dto';
import { patientRepository } from '../repositories/Patient.repository';
import { BadRequestError, ConflictError, NotFoundError } from '../utils/errors/AppError';

interface ListPatientsDto {
  page: number;
  pageSize: number;
  name?: string;
}

export class PatientService {
  private readonly patientRepo = patientRepository;

  public async create(dto: CreatePatientDto): Promise<PatientResponseDto> {
    const existingPatient = await this.patientRepo.findByCpf(dto.cpf);
    if (existingPatient) throw new ConflictError('CPF já cadastrado.', 'CPF_JA_CADASTRADO');
    return this.mapToResponse(await this.patientRepo.create(dto));
  }

  public async list(dto: ListPatientsDto) {
    const [data, total] = await this.patientRepo.list(dto);
    return { data: data.map((p) => this.mapToResponse(p)), meta: { page: dto.page, pageSize: dto.pageSize, total, totalPages: Math.ceil(total / dto.pageSize) || 1 } };
  }

  public async findById(patientId: string): Promise<PatientResponseDto> {
    return this.mapToResponse(await this.getByIdOrFail(patientId));
  }

  public async update(patientId: string, dto: Partial<CreatePatientDto>): Promise<PatientResponseDto> {
    if (!dto.name && !dto.cpf) throw new BadRequestError('Informe ao menos um campo para atualização.');
    const patient = await this.getByIdOrFail(patientId);
    if (dto.cpf && dto.cpf !== patient.cpf) {
      const existingPatient = await this.patientRepo.findByCpf(dto.cpf);
      if (existingPatient && existingPatient.id !== patientId) throw new ConflictError('CPF já cadastrado.', 'CPF_JA_CADASTRADO');
      patient.cpf = dto.cpf;
    }
    if (dto.name) patient.name = dto.name;
    return this.mapToResponse(await this.patientRepo.save(patient));
  }

  public async delete(patientId: string): Promise<void> {
    await this.getByIdOrFail(patientId);
    await this.patientRepo.delete(patientId);
  }

  private async getByIdOrFail(patientId: string) {
    const patient = await this.patientRepo.findById(patientId);
    if (!patient) throw new NotFoundError('Paciente não encontrado.', 'PACIENTE_NAO_ENCONTRADO');
    return patient;
  }

  private mapToResponse(patient: { id: string; name: string; cpf: string; createdAt: Date }): PatientResponseDto {
    return { id: patient.id, name: patient.name, cpf: patient.cpf, createdAt: patient.createdAt };
  }
}

export const patientService = new PatientService();

import { DataSource, ILike, Repository } from 'typeorm';
import { AppDataSource } from '../database/data-source';
import { Patient } from '../entities/Patient.entity';

export interface CreatePatientRepositoryDto {
  name: string;
  cpf: string;
}

export interface ListPatientsRepositoryDto {
  page: number;
  pageSize: number;
  name?: string;
}

export class PatientRepository {
  private readonly ormRepository: Repository<Patient>;

  constructor(dataSource: DataSource = AppDataSource) {
    this.ormRepository = dataSource.getRepository(Patient);
  }

  public async create(dto: CreatePatientRepositoryDto): Promise<Patient> {
    const patient = this.ormRepository.create({ name: dto.name, cpf: dto.cpf });
    return this.ormRepository.save(patient);
  }

  public async findById(id: string): Promise<Patient | null> {
    return this.ormRepository.findOne({ where: { id } });
  }

  public async findByCpf(cpf: string): Promise<Patient | null> {
    return this.ormRepository.findOne({ where: { cpf } });
  }

  public async list(dto: ListPatientsRepositoryDto): Promise<[Patient[], number]> {
    return this.ormRepository.findAndCount({
      where: dto.name ? { name: ILike(`%${dto.name}%`) } : undefined,
      skip: (dto.page - 1) * dto.pageSize,
      take: dto.pageSize,
      order: { createdAt: 'DESC' },
    });
  }

  public async save(patient: Patient): Promise<Patient> {
    return this.ormRepository.save(patient);
  }

  public async delete(id: string): Promise<void> {
    await this.ormRepository.delete({ id });
  }
}

export const patientRepository = new PatientRepository();

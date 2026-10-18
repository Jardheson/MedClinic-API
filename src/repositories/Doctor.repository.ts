import { DataSource, Repository } from 'typeorm';
import { AppDataSource } from '../database/data-source';
import { Doctor } from '../entities/Doctor.entity';

export interface CreateDoctorRepositoryDto {
  userId: string;
  crm: string;
}

export interface ListDoctorsRepositoryDto {
  page: number;
  pageSize: number;
  name?: string;
  crm?: string;
}

export class DoctorRepository {
  private readonly ormRepository: Repository<Doctor>;

  constructor(dataSource: DataSource = AppDataSource) {
    this.ormRepository = dataSource.getRepository(Doctor);
  }

  public async create(dto: CreateDoctorRepositoryDto): Promise<Doctor> {
    const doctor = this.ormRepository.create(dto);
    return this.ormRepository.save(doctor);
  }

  public async findById(id: string): Promise<Doctor | null> {
    return this.ormRepository.findOne({
      where: { id },
      relations: { user: true },
    });
  }

  public async findByUserId(userId: string): Promise<Doctor | null> {
    return this.ormRepository.findOne({
      where: { userId },
      relations: { user: true },
    });
  }

  public async findByCrm(crm: string): Promise<Doctor | null> {
    return this.ormRepository.findOne({
      where: { crm },
      relations: { user: true },
    });
  }

  public async list(dto: ListDoctorsRepositoryDto): Promise<[Doctor[], number]> {
    const qb = this.ormRepository
      .createQueryBuilder('doctor')
      .leftJoinAndSelect('doctor.user', 'user')
      .orderBy('doctor.created_at', 'DESC')
      .skip((dto.page - 1) * dto.pageSize)
      .take(dto.pageSize);

    if (dto.name) {
      qb.andWhere('user.nome ILIKE :name', { name: `%${dto.name}%` });
    }

    if (dto.crm) {
      qb.andWhere('doctor.crm ILIKE :crm', { crm: `%${dto.crm}%` });
    }

    return qb.getManyAndCount();
  }
}

export const doctorRepository = new DoctorRepository();

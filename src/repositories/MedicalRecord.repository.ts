import { DataSource, Repository } from 'typeorm';
import { AppDataSource } from '../database/data-source';
import { MedicalRecord } from '../entities/MedicalRecord.entity';

export interface CreateMedicalRecordRepositoryDto {
  doctorId: string;
  patientId: string;
  descricao: string;
  prescricao?: string;
}

export class MedicalRecordRepository {
  private readonly ormRepository: Repository<MedicalRecord>;

  constructor(dataSource: DataSource = AppDataSource) {
    this.ormRepository = dataSource.getRepository(MedicalRecord);
  }

  public async create(dto: CreateMedicalRecordRepositoryDto): Promise<MedicalRecord> {
    const medicalRecord = this.ormRepository.create({
      doctorId: dto.doctorId,
      patientId: dto.patientId,
      descricao: dto.descricao,
      prescricao: dto.prescricao ?? null,
    });

    return this.ormRepository.save(medicalRecord);
  }

  public async findByPatientId(patientId: string): Promise<MedicalRecord[]> {
    return this.ormRepository.find({
      where: { patientId },
      order: { createdAt: 'DESC' },
    });
  }
}

export const medicalRecordRepository = new MedicalRecordRepository();

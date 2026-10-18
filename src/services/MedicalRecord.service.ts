import { CreateMedicalRecordDto } from '../dtos/CreateMedicalRecord.dto';
import { MedicalRecordResponseDto } from '../dtos/MedicalRecordResponse.dto';
import { AppointmentStatus } from '../entities/AppointmentStatus.enum';
import { UserRole } from '../entities/UserRole.enum';
import { appointmentRepository } from '../repositories/Appointment.repository';
import { medicalRecordRepository } from '../repositories/MedicalRecord.repository';
import { patientRepository } from '../repositories/Patient.repository';
import { userRepository } from '../repositories/User.repository';
import { ForbiddenError, NotFoundError } from '../utils/errors/AppError';

export class MedicalRecordService {
  private readonly appointmentRepo = appointmentRepository;
  private readonly medicalRecordRepo = medicalRecordRepository;
  private readonly patientRepo = patientRepository;
  private readonly userRepo = userRepository;

  public async create(
    doctorId: string,
    patientId: string,
    dto: CreateMedicalRecordDto,
  ): Promise<MedicalRecordResponseDto> {
    await this.ensureDoctorExists(doctorId);
    await this.ensurePatientExists(patientId);
    await this.checkDoctorLink(doctorId, patientId);

    const medicalRecord = await this.medicalRecordRepo.create({
      doctorId,
      patientId,
      descricao: dto.descricao,
      prescricao: dto.prescricao,
    });

    return this.mapToResponse(medicalRecord);
  }

  public async listByPatient(
    actorId: string,
    actorRole: UserRole,
    patientId: string,
  ): Promise<MedicalRecordResponseDto[]> {
    await this.ensurePatientExists(patientId);

    if (actorRole === UserRole.ADMIN) {
      const admin = await this.userRepo.findById(actorId);
      if (!admin) {
        throw new NotFoundError('Usuário autenticado não encontrado.');
      }
    } else {
      await this.ensureDoctorExists(actorId);
      await this.checkDoctorLink(actorId, patientId);
    }

    const medicalRecords = await this.medicalRecordRepo.findByPatientId(patientId);
    return medicalRecords.map((record) => this.mapToResponse(record));
  }

  private async ensureDoctorExists(doctorId: string): Promise<void> {
    const doctor = await this.userRepo.findById(doctorId);
    if (!doctor) {
      throw new NotFoundError('Médico autenticado não encontrado.', 'USUARIO_NAO_ENCONTRADO');
    }
  }

  private async ensurePatientExists(patientId: string): Promise<void> {
    const patient = await this.patientRepo.findById(patientId);
    if (!patient) {
      throw new NotFoundError('Paciente não encontrado.', 'PACIENTE_NAO_ENCONTRADO');
    }
  }

  private async checkDoctorLink(doctorId: string, patientId: string): Promise<void> {
    const doctorHasLink = await this.appointmentRepo.doctorHasLinkWithPatient(
      doctorId,
      patientId,
      [AppointmentStatus.IN_PROGRESS, AppointmentStatus.DONE],
    );

    if (!doctorHasLink) {
      throw new ForbiddenError(
        'Médico não possui vínculo válido com este paciente para acessar o prontuário.',
      );
    }
  }

  private mapToResponse(record: {
    id: string;
    doctorId: string;
    patientId: string;
    descricao: string;
    prescricao: string | null;
    createdAt: Date;
  }): MedicalRecordResponseDto {
    return {
      id: record.id,
      doctorId: record.doctorId,
      patientId: record.patientId,
      descricao: record.descricao,
      prescricao: record.prescricao,
      createdAt: record.createdAt,
    };
  }
}

export const medicalRecordService = new MedicalRecordService();

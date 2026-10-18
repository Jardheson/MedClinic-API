import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MedicalRecordService } from '../src/services/MedicalRecord.service';
import { AppointmentStatus } from '../src/entities/AppointmentStatus.enum';
import { UserRole } from '../src/entities/UserRole.enum';
import {
  ForbiddenError,
  NotFoundError,
} from '../src/utils/errors/AppError';

interface AppointmentRepositoryMock {
  doctorHasLinkWithPatient: ReturnType<typeof vi.fn>;
}

interface MedicalRecordRepositoryMock {
  create: ReturnType<typeof vi.fn>;
  findByPatientId: ReturnType<typeof vi.fn>;
}

interface PatientRepositoryMock {
  findById: ReturnType<typeof vi.fn>;
}

interface UserRepositoryMock {
  findById: ReturnType<typeof vi.fn>;
}

function createDependencies() {
  return {
    appointmentRepo: {
      doctorHasLinkWithPatient: vi.fn(),
    } satisfies AppointmentRepositoryMock,
    medicalRecordRepo: {
      create: vi.fn(),
      findByPatientId: vi.fn(),
    } satisfies MedicalRecordRepositoryMock,
    patientRepo: {
      findById: vi.fn(),
    } satisfies PatientRepositoryMock,
    userRepo: {
      findById: vi.fn(),
    } satisfies UserRepositoryMock,
  };
}

function buildService(deps: ReturnType<typeof createDependencies>): MedicalRecordService {
  const service = new MedicalRecordService();
  Reflect.set(service, 'appointmentRepo', deps.appointmentRepo);
  Reflect.set(service, 'medicalRecordRepo', deps.medicalRecordRepo);
  Reflect.set(service, 'patientRepo', deps.patientRepo);
  Reflect.set(service, 'userRepo', deps.userRepo);
  return service;
}

describe('MedicalRecordService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('nega acesso ao prontuário quando o médico não possui vínculo válido', async () => {
    const deps = createDependencies();
    deps.userRepo.findById.mockResolvedValueOnce({ id: 'doctor-1' });
    deps.patientRepo.findById.mockResolvedValueOnce({ id: 'patient-1' });
    deps.appointmentRepo.doctorHasLinkWithPatient.mockResolvedValueOnce(false);

    const service = buildService(deps);

    await expect(
      service.create('doctor-1', 'patient-1', {
        descricao: 'Paciente com queixa de cefaleia persistente.',
        prescricao: 'Hidratação e analgesia leve.',
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);

    expect(deps.appointmentRepo.doctorHasLinkWithPatient).toHaveBeenCalledWith(
      'doctor-1',
      'patient-1',
      [AppointmentStatus.IN_PROGRESS, AppointmentStatus.DONE],
    );
  });

  it('cria prontuário quando existe vínculo por consulta em andamento ou concluída', async () => {
    const deps = createDependencies();
    deps.userRepo.findById.mockResolvedValueOnce({ id: 'doctor-1' });
    deps.patientRepo.findById.mockResolvedValueOnce({ id: 'patient-1' });
    deps.appointmentRepo.doctorHasLinkWithPatient.mockResolvedValueOnce(true);
    deps.medicalRecordRepo.create.mockResolvedValueOnce({
      id: 'record-1',
      doctorId: 'doctor-1',
      patientId: 'patient-1',
      descricao: 'Paciente apresentou melhora clínica após observação.',
      prescricao: 'Manter repouso por 48 horas.',
      createdAt: new Date('2026-10-18T12:00:00.000Z'),
    });

    const service = buildService(deps);

    const result = await service.create('doctor-1', 'patient-1', {
      descricao: 'Paciente apresentou melhora clínica após observação.',
      prescricao: 'Manter repouso por 48 horas.',
    });

    expect(deps.medicalRecordRepo.create).toHaveBeenCalledWith({
      doctorId: 'doctor-1',
      patientId: 'patient-1',
      descricao: 'Paciente apresentou melhora clínica após observação.',
      prescricao: 'Manter repouso por 48 horas.',
    });
    expect(result.id).toBe('record-1');
  });

  it('lista prontuários do paciente quando o vínculo é válido', async () => {
    const deps = createDependencies();
    deps.userRepo.findById.mockResolvedValueOnce({ id: 'doctor-1' });
    deps.patientRepo.findById.mockResolvedValueOnce({ id: 'patient-1' });
    deps.appointmentRepo.doctorHasLinkWithPatient.mockResolvedValueOnce(true);
    deps.medicalRecordRepo.findByPatientId.mockResolvedValueOnce([
      {
        id: 'record-2',
        doctorId: 'doctor-1',
        patientId: 'patient-1',
        descricao: 'Consulta de retorno sem intercorrências.',
        prescricao: null,
        createdAt: new Date('2026-10-18T14:00:00.000Z'),
      },
    ]);

    const service = buildService(deps);

    const result = await service.listByPatient('doctor-1', UserRole.DOCTOR, 'patient-1');

    expect(deps.medicalRecordRepo.findByPatientId).toHaveBeenCalledWith('patient-1');
    expect(result).toHaveLength(1);
    expect(result[0]?.descricao).toContain('retorno');
  });

  it('retorna erro quando o paciente não existe', async () => {
    const deps = createDependencies();
    deps.userRepo.findById.mockResolvedValueOnce({ id: 'doctor-1' });
    deps.patientRepo.findById.mockResolvedValueOnce(null);

    const service = buildService(deps);

    await expect(
      service.listByPatient('doctor-1', UserRole.DOCTOR, 'patient-inexistente'),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

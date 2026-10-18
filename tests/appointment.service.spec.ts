import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppointmentService } from '../src/services/Appointment.service';
import { AppointmentStatus } from '../src/entities/AppointmentStatus.enum';
import { BadRequestError, ConflictError, NotFoundError } from '../src/utils/errors/AppError';

interface AppointmentRepositoryMock {
  findById: ReturnType<typeof vi.fn>;
  save: ReturnType<typeof vi.fn>;
  scheduleWithLock: ReturnType<typeof vi.fn>;
}

interface PatientRepositoryMock {
  findById: ReturnType<typeof vi.fn>;
}

interface DoctorRepositoryMock {
  findByUserId: ReturnType<typeof vi.fn>;
}

interface WorkScheduleRepositoryMock {
  findByDoctorIdAndWeekday: ReturnType<typeof vi.fn>;
}

function createDependencies() {
  return {
    appointmentRepo: {
      findById: vi.fn(),
      save: vi.fn(),
      scheduleWithLock: vi.fn(),
    } satisfies AppointmentRepositoryMock,
    patientRepo: {
      findById: vi.fn(),
    } satisfies PatientRepositoryMock,
    doctorRepo: {
      findByUserId: vi.fn(),
    } satisfies DoctorRepositoryMock,
    workScheduleRepo: {
      findByDoctorIdAndWeekday: vi.fn(),
    } satisfies WorkScheduleRepositoryMock,
  };
}

function buildService(deps: ReturnType<typeof createDependencies>): AppointmentService {
  const service = new AppointmentService();
  Reflect.set(service, 'appointmentRepo', deps.appointmentRepo);
  Reflect.set(service, 'doctorRepo', deps.doctorRepo);
  Reflect.set(service, 'patientRepo', deps.patientRepo);
  Reflect.set(service, 'workScheduleRepo', deps.workScheduleRepo);
  return service;
}

describe('AppointmentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('bloqueia criação quando doctorId não pertence a um médico', async () => {
    const deps = createDependencies();
    deps.doctorRepo.findByUserId.mockResolvedValueOnce(null);

    const service = buildService(deps);

    await expect(
      service.create({
        doctorId: 'doctor-1',
        patientId: 'patient-1',
        startsAt: '2026-10-19T09:00:00.000Z',
      }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('retorna erro quando o paciente não existe', async () => {
    const deps = createDependencies();
    deps.doctorRepo.findByUserId.mockResolvedValueOnce({
      userId: 'doctor-1',
      user: { role: 'doctor' },
    });
    deps.patientRepo.findById.mockResolvedValueOnce(null);

    const service = buildService(deps);

    await expect(
      service.create({
        doctorId: 'doctor-1',
        patientId: 'patient-inexistente',
        startsAt: '2026-10-19T09:00:00.000Z',
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('cria consulta quando médico e paciente são válidos', async () => {
    const deps = createDependencies();
    deps.doctorRepo.findByUserId.mockResolvedValueOnce({
      userId: 'doctor-1',
      user: { role: 'doctor' },
    });
    deps.patientRepo.findById.mockResolvedValueOnce({ id: 'patient-1' });
    deps.workScheduleRepo.findByDoctorIdAndWeekday.mockResolvedValueOnce([
      {
        weekday: 'sunday',
        startTime: '08:00',
        endTime: '12:00',
        slotDurationMinutes: 60,
      },
    ]);
    deps.appointmentRepo.scheduleWithLock.mockResolvedValueOnce({
      conflict: null,
      appointment: {
        id: 'appointment-1',
        doctorId: 'doctor-1',
        patientId: 'patient-1',
        status: AppointmentStatus.SCHEDULED,
        startsAt: new Date('2026-10-19T09:00:00.000Z'),
        endsAt: new Date('2026-10-19T10:00:00.000Z'),
        createdAt: new Date('2026-10-18T16:00:00.000Z'),
      },
    });

    const service = buildService(deps);

    const result = await service.create({
      doctorId: 'doctor-1',
      patientId: 'patient-1',
      startsAt: '2026-10-19T09:00:00.000Z',
    });

    expect(deps.appointmentRepo.scheduleWithLock).toHaveBeenCalledWith({
      doctorId: 'doctor-1',
      patientId: 'patient-1',
      startsAt: new Date('2026-10-19T09:00:00.000Z'),
      endsAt: new Date('2026-10-19T10:00:00.000Z'),
      status: AppointmentStatus.SCHEDULED,
    });
    expect(result.id).toBe('appointment-1');
  });

  it('bloqueia criação quando o horário está fora da escala', async () => {
    const deps = createDependencies();
    deps.doctorRepo.findByUserId.mockResolvedValueOnce({
      userId: 'doctor-1',
      user: { role: 'doctor' },
    });
    deps.patientRepo.findById.mockResolvedValueOnce({ id: 'patient-1' });
    deps.workScheduleRepo.findByDoctorIdAndWeekday.mockResolvedValueOnce([]);

    const service = buildService(deps);

    await expect(
      service.create({
        doctorId: 'doctor-1',
        patientId: 'patient-1',
        startsAt: '2026-10-19T09:00:00.000Z',
      }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('bloqueia criação quando o médico já possui conflito', async () => {
    const deps = createDependencies();
    deps.doctorRepo.findByUserId.mockResolvedValueOnce({
      userId: 'doctor-1',
      user: { role: 'doctor' },
    });
    deps.patientRepo.findById.mockResolvedValueOnce({ id: 'patient-1' });
    deps.workScheduleRepo.findByDoctorIdAndWeekday.mockResolvedValueOnce([
      {
        weekday: 'sunday',
        startTime: '08:00',
        endTime: '12:00',
        slotDurationMinutes: 60,
      },
    ]);
    deps.appointmentRepo.scheduleWithLock.mockResolvedValueOnce({
      conflict: 'doctor',
    });

    const service = buildService(deps);

    await expect(
      service.create({
        doctorId: 'doctor-1',
        patientId: 'patient-1',
        startsAt: '2026-10-19T09:00:00.000Z',
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('bloqueia criação quando o paciente já possui conflito', async () => {
    const deps = createDependencies();
    deps.doctorRepo.findByUserId.mockResolvedValueOnce({
      userId: 'doctor-1',
      user: { role: 'doctor' },
    });
    deps.patientRepo.findById.mockResolvedValueOnce({ id: 'patient-1' });
    deps.workScheduleRepo.findByDoctorIdAndWeekday.mockResolvedValueOnce([
      {
        weekday: 'sunday',
        startTime: '08:00',
        endTime: '12:00',
        slotDurationMinutes: 60,
      },
    ]);
    deps.appointmentRepo.scheduleWithLock.mockResolvedValueOnce({
      conflict: 'patient',
    });

    const service = buildService(deps);

    await expect(
      service.create({
        doctorId: 'doctor-1',
        patientId: 'patient-1',
        startsAt: '2026-10-19T09:00:00.000Z',
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('atualiza o status da consulta existente', async () => {
    const deps = createDependencies();
    deps.appointmentRepo.findById.mockResolvedValueOnce({
      id: 'appointment-1',
      doctorId: 'doctor-1',
      patientId: 'patient-1',
      status: AppointmentStatus.IN_PROGRESS,
      startsAt: new Date('2026-10-19T09:00:00.000Z'),
      endsAt: new Date('2026-10-19T10:00:00.000Z'),
      createdAt: new Date('2026-10-18T16:00:00.000Z'),
    });
    deps.appointmentRepo.save.mockResolvedValueOnce({
      id: 'appointment-1',
      doctorId: 'doctor-1',
      patientId: 'patient-1',
      status: AppointmentStatus.DONE,
      startsAt: new Date('2026-10-19T09:00:00.000Z'),
      endsAt: new Date('2026-10-19T10:00:00.000Z'),
      createdAt: new Date('2026-10-18T16:00:00.000Z'),
    });

    const service = buildService(deps);

    const result = await service.updateStatus('appointment-1', {
      status: AppointmentStatus.DONE,
    });

    expect(deps.appointmentRepo.save).toHaveBeenCalled();
    expect(result.status).toBe(AppointmentStatus.DONE);
  });

  it('retorna erro ao atualizar consulta inexistente', async () => {
    const deps = createDependencies();
    deps.appointmentRepo.findById.mockResolvedValueOnce(null);

    const service = buildService(deps);

    await expect(
      service.updateStatus('appointment-inexistente', { status: AppointmentStatus.DONE }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

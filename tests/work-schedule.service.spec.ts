import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkScheduleService } from '../src/services/WorkSchedule.service';
import { UserRole } from '../src/entities/UserRole.enum';
import { WorkScheduleWeekday } from '../src/entities/WorkScheduleWeekday.enum';
import { BadRequestError, NotFoundError } from '../src/utils/errors/AppError';

function createDependencies() {
  return {
    doctorRepo: {
      findByUserId: vi.fn(),
    },
    workScheduleRepo: {
      replaceForDoctor: vi.fn(),
      findByDoctorId: vi.fn(),
    },
  };
}

function buildService(deps: ReturnType<typeof createDependencies>): WorkScheduleService {
  const service = new WorkScheduleService();
  Reflect.set(service, 'doctorRepo', deps.doctorRepo);
  Reflect.set(service, 'workScheduleRepo', deps.workScheduleRepo);
  return service;
}

describe('WorkScheduleService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna erro quando o médico não existe', async () => {
    const deps = createDependencies();
    deps.doctorRepo.findByUserId.mockResolvedValueOnce(null);

    const service = buildService(deps);

    await expect(service.listByDoctor('doctor-user-1')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('bloqueia escala com sobreposição no mesmo dia', async () => {
    const deps = createDependencies();
    deps.doctorRepo.findByUserId.mockResolvedValueOnce({
      user: { role: UserRole.DOCTOR },
    });

    const service = buildService(deps);

    await expect(
      service.replaceForDoctor('doctor-user-1', {
        items: [
          {
            weekday: WorkScheduleWeekday.MONDAY,
            startTime: '08:00',
            endTime: '10:00',
            slotDurationMinutes: 60,
          },
          {
            weekday: WorkScheduleWeekday.MONDAY,
            startTime: '09:00',
            endTime: '11:00',
            slotDurationMinutes: 60,
          },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it('substitui a escala do médico quando os horários são válidos', async () => {
    const deps = createDependencies();
    deps.doctorRepo.findByUserId.mockResolvedValueOnce({
      user: { role: UserRole.DOCTOR },
    });
    deps.workScheduleRepo.replaceForDoctor.mockResolvedValueOnce([
      {
        id: 'schedule-1',
        doctorId: 'doctor-user-1',
        weekday: WorkScheduleWeekday.MONDAY,
        startTime: '08:00',
        endTime: '12:00',
        slotDurationMinutes: 60,
        createdAt: new Date('2026-10-18T12:00:00.000Z'),
      },
    ]);

    const service = buildService(deps);

    const result = await service.replaceForDoctor('doctor-user-1', {
      items: [
        {
          weekday: WorkScheduleWeekday.MONDAY,
          startTime: '08:00',
          endTime: '12:00',
          slotDurationMinutes: 60,
        },
      ],
    });

    expect(result).toHaveLength(1);
    expect(deps.workScheduleRepo.replaceForDoctor).toHaveBeenCalledWith('doctor-user-1', [
      {
        weekday: WorkScheduleWeekday.MONDAY,
        startTime: '08:00',
        endTime: '12:00',
        slotDurationMinutes: 60,
      },
    ]);
  });
});

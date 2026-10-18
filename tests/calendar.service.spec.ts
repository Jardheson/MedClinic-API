import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CalendarService } from '../src/services/Calendar.service';
import { UserRole } from '../src/entities/UserRole.enum';
import { WorkScheduleWeekday } from '../src/entities/WorkScheduleWeekday.enum';
import { NotFoundError } from '../src/utils/errors/AppError';

function createDependencies() {
  return {
    doctorRepo: {
      findByUserId: vi.fn(),
    },
    workScheduleRepo: {
      findByDoctorIdAndWeekday: vi.fn(),
    },
    appointmentRepo: {
      findByDoctorAndDate: vi.fn(),
    },
  };
}

function buildService(deps: ReturnType<typeof createDependencies>): CalendarService {
  const service = new CalendarService();
  Reflect.set(service, 'doctorRepo', deps.doctorRepo);
  Reflect.set(service, 'workScheduleRepo', deps.workScheduleRepo);
  Reflect.set(service, 'appointmentRepo', deps.appointmentRepo);
  return service;
}

describe('CalendarService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna erro quando o médico não existe', async () => {
    const deps = createDependencies();
    deps.doctorRepo.findByUserId.mockResolvedValueOnce(null);

    const service = buildService(deps);

    await expect(service.getDoctorCalendar('doctor-1', '2026-10-19')).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('gera slots livres e ocupados a partir da escala e das consultas', async () => {
    const deps = createDependencies();
    deps.doctorRepo.findByUserId.mockResolvedValueOnce({
      userId: 'doctor-1',
      user: { role: UserRole.DOCTOR },
    });
    deps.workScheduleRepo.findByDoctorIdAndWeekday.mockResolvedValueOnce([
      {
        doctorId: 'doctor-1',
        weekday: WorkScheduleWeekday.SUNDAY,
        startTime: '08:00',
        endTime: '10:00',
        slotDurationMinutes: 60,
      },
    ]);
    deps.appointmentRepo.findByDoctorAndDate.mockResolvedValueOnce([
      {
        startsAt: new Date('2026-10-19T08:00:00.000Z'),
        endsAt: new Date('2026-10-19T09:00:00.000Z'),
      },
    ]);

    const service = buildService(deps);
    const result = await service.getDoctorCalendar('doctor-1', '2026-10-19');

    expect(result).toMatchObject({
      doctorId: 'doctor-1',
      date: '2026-10-19',
    });
    expect(result.slots).toHaveLength(2);
    expect(result.slots[0]).toMatchObject({
      startsAt: '2026-10-19T08:00:00.000Z',
      endsAt: '2026-10-19T09:00:00.000Z',
      available: false,
    });
    expect(result.slots[1]).toMatchObject({
      startsAt: '2026-10-19T09:00:00.000Z',
      endsAt: '2026-10-19T10:00:00.000Z',
      available: true,
    });
  });
});

import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserRole } from '../src/entities/UserRole.enum';
import { WorkScheduleWeekday } from '../src/entities/WorkScheduleWeekday.enum';

const { replaceMock, listMock } = vi.hoisted(() => ({
  replaceMock: vi.fn(),
  listMock: vi.fn(),
}));

vi.mock('../src/services/WorkSchedule.service', () => ({
  workScheduleService: {
    replaceForDoctor: replaceMock,
    listByDoctor: listMock,
  },
}));

vi.mock('../src/middlewares/authenticate.middleware', () => ({
  authenticate: (req: any, _res: any, next: any) => {
    req.user = { userId: 'admin-1', role: UserRole.ADMIN };
    next();
  },
}));

vi.mock('../src/middlewares/authorize.middleware', () => ({
  authorize:
    (..._allowedRoles: UserRole[]) =>
    (_req: any, _res: any, next: any) => {
      next();
    },
}));

describe('Work schedule routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna 200 ao substituir a escala do médico', async () => {
    replaceMock.mockResolvedValueOnce([
      {
        id: 'schedule-1',
        doctorId: '550e8400-e29b-41d4-a716-446655440001',
        weekday: WorkScheduleWeekday.MONDAY,
        startTime: '08:00',
        endTime: '12:00',
        slotDurationMinutes: 60,
      },
    ]);

    const { app } = await import('../src/app');
    const response = await request(app)
      .put('/api/v1/doctors/550e8400-e29b-41d4-a716-446655440001/work-schedule')
      .send({
        items: [
          {
            weekday: WorkScheduleWeekday.MONDAY,
            startTime: '08:00',
            endTime: '12:00',
            slotDurationMinutes: 60,
          },
        ],
      });

    expect(response.status).toBe(200);
    expect(replaceMock).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440001', {
      items: [
        {
          weekday: WorkScheduleWeekday.MONDAY,
          startTime: '08:00',
          endTime: '12:00',
          slotDurationMinutes: 60,
        },
      ],
    });
  });

  it('retorna 200 ao listar a escala do médico', async () => {
    listMock.mockResolvedValueOnce([]);

    const { app } = await import('../src/app');
    const response = await request(app).get(
      '/api/v1/doctors/550e8400-e29b-41d4-a716-446655440001/work-schedule',
    );

    expect(response.status).toBe(200);
    expect(listMock).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440001');
  });
});

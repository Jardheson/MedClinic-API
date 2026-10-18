import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserRole } from '../src/entities/UserRole.enum';

const { getDoctorCalendarMock } = vi.hoisted(() => ({
  getDoctorCalendarMock: vi.fn(),
}));

vi.mock('../src/services/Calendar.service', () => ({
  calendarService: {
    getDoctorCalendar: getDoctorCalendarMock,
  },
}));

vi.mock('../src/middlewares/authenticate.middleware', () => ({
  authenticate: (req: any, _res: any, next: any) => {
    req.user = { userId: 'secretary-1', role: UserRole.ATTENDANT };
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

describe('Calendar routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna 200 ao consultar calendário do médico', async () => {
    getDoctorCalendarMock.mockResolvedValueOnce({
      doctorId: '550e8400-e29b-41d4-a716-446655440001',
      date: '2026-10-19',
      slots: [
        {
          startsAt: '2026-10-19T08:00:00.000Z',
          endsAt: '2026-10-19T09:00:00.000Z',
          available: true,
        },
      ],
    });

    const { app } = await import('../src/app');
    const response = await request(app).get(
      '/api/v1/doctors/550e8400-e29b-41d4-a716-446655440001/calendar?date=2026-10-19',
    );

    expect(response.status).toBe(200);
    expect(getDoctorCalendarMock).toHaveBeenCalledWith(
      '550e8400-e29b-41d4-a716-446655440001',
      '2026-10-19',
    );
  });

  it('retorna 400 quando a data do calendário é inválida', async () => {
    const { app } = await import('../src/app');
    const response = await request(app).get(
      '/api/v1/doctors/550e8400-e29b-41d4-a716-446655440001/calendar?date=19-10-2026',
    );

    expect(response.status).toBe(400);
    expect(getDoctorCalendarMock).not.toHaveBeenCalled();
  });
});

import { Request, Response } from 'express';
import { calendarService } from '../services/Calendar.service';

export class CalendarController {
  private readonly service = calendarService;

  public async show(
    req: Request<{ doctorId: string }, unknown, unknown, { date: string }>,
    res: Response,
  ): Promise<Response> {
    return res.status(200).json(await this.service.getDoctorCalendar(req.params.doctorId, req.query.date));
  }
}

export const calendarController = new CalendarController();

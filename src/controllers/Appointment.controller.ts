import { Request, Response } from 'express';
import { CreateAppointmentDto } from '../dtos/CreateAppointment.dto';
import { UpdateAppointmentStatusDto } from '../dtos/UpdateAppointmentStatus.dto';
import { appointmentService } from '../services/Appointment.service';

export class AppointmentController {
  private readonly service = appointmentService;

  public async create(req: Request<unknown, unknown, CreateAppointmentDto>, res: Response): Promise<Response> {
    return res.status(201).json(await this.service.create(req.body));
  }

  public async updateStatus(
    req: Request<{ id: string }, unknown, UpdateAppointmentStatusDto>,
    res: Response,
  ): Promise<Response> {
    return res.status(200).json(await this.service.updateStatus(req.params.id, req.body));
  }
}

export const appointmentController = new AppointmentController();

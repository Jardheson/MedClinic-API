import { Request, Response } from 'express';
import { ReplaceWorkScheduleDto } from '../dtos/ReplaceWorkSchedule.dto';
import { workScheduleService } from '../services/WorkSchedule.service';

export class WorkScheduleController {
  private readonly service = workScheduleService;

  public async replace(
    req: Request<{ doctorId: string }, unknown, ReplaceWorkScheduleDto>,
    res: Response,
  ): Promise<Response> {
    return res.status(200).json(await this.service.replaceForDoctor(req.params.doctorId, req.body));
  }

  public async list(req: Request<{ doctorId: string }>, res: Response): Promise<Response> {
    return res.status(200).json(await this.service.listByDoctor(req.params.doctorId));
  }
}

export const workScheduleController = new WorkScheduleController();

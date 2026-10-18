import { Request, Response } from 'express';
import { CreateMedicalRecordDto } from '../dtos/CreateMedicalRecord.dto';
import { medicalRecordService } from '../services/MedicalRecord.service';

export class MedicalRecordController {
  private readonly service = medicalRecordService;

  public async create(
    req: Request<{ patientId: string }, unknown, CreateMedicalRecordDto>,
    res: Response,
  ): Promise<Response> {
    return res.status(201).json(await this.service.create(req.user!.userId, req.params.patientId, req.body));
  }

  public async listByPatient(req: Request<{ patientId: string }>, res: Response): Promise<Response> {
    return res.status(200).json(await this.service.listByPatient(req.user!.userId, req.user!.role, req.params.patientId));
  }
}

export const medicalRecordController = new MedicalRecordController();

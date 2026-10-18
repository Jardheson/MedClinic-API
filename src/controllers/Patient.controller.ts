import { Request, Response } from 'express';
import { CreatePatientDto } from '../dtos/CreatePatient.dto';
import { patientService } from '../services/Patient.service';

export class PatientController {
  private readonly service = patientService;

  public async create(req: Request<unknown, unknown, CreatePatientDto>, res: Response): Promise<Response> {
    return res.status(201).json(await this.service.create(req.body));
  }

  public async list(
    req: Request<unknown, unknown, unknown, { page?: string; pageSize?: string; name?: string }>,
    res: Response,
  ): Promise<Response> {
    return res.status(200).json(await this.service.list({ page: Number(req.query.page ?? 1), pageSize: Number(req.query.pageSize ?? 10), name: req.query.name }));
  }

  public async show(req: Request<{ id: string }>, res: Response): Promise<Response> {
    return res.status(200).json(await this.service.findById(req.params.id));
  }

  public async update(req: Request<{ id: string }, unknown, Partial<CreatePatientDto>>, res: Response): Promise<Response> {
    return res.status(200).json(await this.service.update(req.params.id, req.body));
  }

  public async delete(req: Request<{ id: string }>, res: Response): Promise<Response> {
    await this.service.delete(req.params.id);
    return res.status(204).send();
  }
}

export const patientController = new PatientController();

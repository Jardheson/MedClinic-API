import { Request, Response } from 'express';
import { CreateDoctorDto } from '../dtos/CreateDoctor.dto';
import { doctorService } from '../services/Doctor.service';

export class DoctorController {
  private readonly service = doctorService;

  public async create(req: Request<unknown, unknown, CreateDoctorDto>, res: Response): Promise<Response> {
    return res.status(201).json(await this.service.create(req.body));
  }

  public async list(
    req: Request<unknown, unknown, unknown, { page?: string; pageSize?: string; name?: string; crm?: string }>,
    res: Response,
  ): Promise<Response> {
    return res.status(200).json(
      await this.service.list({
        page: Number(req.query.page ?? 1),
        pageSize: Number(req.query.pageSize ?? 10),
        name: req.query.name,
        crm: req.query.crm,
      }),
    );
  }

  public async show(req: Request<{ id: string }>, res: Response): Promise<Response> {
    return res.status(200).json(await this.service.findById(req.params.id));
  }
}

export const doctorController = new DoctorController();

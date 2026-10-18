import { DataSource, In, Repository } from 'typeorm';
import { AppDataSource } from '../database/data-source';
import { Appointment } from '../entities/Appointment.entity';
import { AppointmentStatus } from '../entities/AppointmentStatus.enum';
import { Patient } from '../entities/Patient.entity';
import { User } from '../entities/User.entity';

export interface CreateAppointmentRepositoryDto {
  doctorId: string;
  patientId: string;
  startsAt: Date;
  endsAt: Date;
  status?: AppointmentStatus;
}

export interface ScheduleAppointmentWithLockResult {
  conflict: 'doctor' | 'patient' | null;
  appointment?: Appointment;
}

export class AppointmentRepository {
  private readonly dataSource: DataSource;
  private readonly ormRepository: Repository<Appointment>;

  constructor(dataSource: DataSource = AppDataSource) {
    this.dataSource = dataSource;
    this.ormRepository = dataSource.getRepository(Appointment);
  }

  public async create(dto: CreateAppointmentRepositoryDto): Promise<Appointment> {
    const appointment = this.ormRepository.create({
      doctorId: dto.doctorId,
      patientId: dto.patientId,
      startsAt: dto.startsAt,
      endsAt: dto.endsAt,
      status: dto.status ?? AppointmentStatus.SCHEDULED,
    });

    return this.ormRepository.save(appointment);
  }

  public async findById(id: string): Promise<Appointment | null> {
    return this.ormRepository.findOne({ where: { id } });
  }

  public async save(appointment: Appointment): Promise<Appointment> {
    return this.ormRepository.save(appointment);
  }

  public async doctorHasLinkWithPatient(
    doctorId: string,
    patientId: string,
    statuses: AppointmentStatus[],
  ): Promise<boolean> {
    return this.ormRepository.exist({
      where: {
        doctorId,
        patientId,
        status: In(statuses),
      },
    });
  }

  public async doctorHasConflict(
    doctorId: string,
    startsAt: Date,
    endsAt: Date,
  ): Promise<boolean> {
    return this.ormRepository
      .createQueryBuilder('appointment')
      .where('appointment.doctorId = :doctorId', { doctorId })
      .andWhere('appointment.status IN (:...statuses)', {
        statuses: [AppointmentStatus.SCHEDULED, AppointmentStatus.IN_PROGRESS],
      })
      .andWhere('appointment.startsAt < :endsAt', { endsAt })
      .andWhere('appointment.endsAt > :startsAt', { startsAt })
      .getExists();
  }

  public async patientHasConflict(
    patientId: string,
    startsAt: Date,
    endsAt: Date,
  ): Promise<boolean> {
    return this.ormRepository
      .createQueryBuilder('appointment')
      .where('appointment.patientId = :patientId', { patientId })
      .andWhere('appointment.status IN (:...statuses)', {
        statuses: [AppointmentStatus.SCHEDULED, AppointmentStatus.IN_PROGRESS],
      })
      .andWhere('appointment.startsAt < :endsAt', { endsAt })
      .andWhere('appointment.endsAt > :startsAt', { startsAt })
      .getExists();
  }

  public async findByDoctorAndDate(doctorId: string, date: string): Promise<Appointment[]> {
    const dayStart = new Date(`${date}T00:00:00.000Z`);
    const dayEnd = new Date(`${date}T23:59:59.999Z`);

    return this.ormRepository
      .createQueryBuilder('appointment')
      .where('appointment.doctorId = :doctorId', { doctorId })
      .andWhere('appointment.status IN (:...statuses)', {
        statuses: [AppointmentStatus.SCHEDULED, AppointmentStatus.IN_PROGRESS, AppointmentStatus.DONE],
      })
      .andWhere('appointment.startsAt >= :dayStart', { dayStart })
      .andWhere('appointment.startsAt <= :dayEnd', { dayEnd })
      .orderBy('appointment.startsAt', 'ASC')
      .getMany();
  }

  public async scheduleWithLock(
    dto: CreateAppointmentRepositoryDto,
  ): Promise<ScheduleAppointmentWithLockResult> {
    return this.dataSource.transaction(async (manager) => {
      await manager
        .getRepository(User)
        .createQueryBuilder('user')
        .setLock('pessimistic_write')
        .where('user.id = :doctorId', { doctorId: dto.doctorId })
        .getOne();

      await manager
        .getRepository(Patient)
        .createQueryBuilder('patient')
        .setLock('pessimistic_write')
        .where('patient.id = :patientId', { patientId: dto.patientId })
        .getOne();

      const doctorConflict = await manager
        .getRepository(Appointment)
        .createQueryBuilder('appointment')
        .setLock('pessimistic_write')
        .where('appointment.doctorId = :doctorId', { doctorId: dto.doctorId })
        .andWhere('appointment.status IN (:...statuses)', {
          statuses: [AppointmentStatus.SCHEDULED, AppointmentStatus.IN_PROGRESS],
        })
        .andWhere('appointment.startsAt < :endsAt', { endsAt: dto.endsAt })
        .andWhere('appointment.endsAt > :startsAt', { startsAt: dto.startsAt })
        .getOne();

      if (doctorConflict) {
        return { conflict: 'doctor' };
      }

      const patientConflict = await manager
        .getRepository(Appointment)
        .createQueryBuilder('appointment')
        .setLock('pessimistic_write')
        .where('appointment.patientId = :patientId', { patientId: dto.patientId })
        .andWhere('appointment.status IN (:...statuses)', {
          statuses: [AppointmentStatus.SCHEDULED, AppointmentStatus.IN_PROGRESS],
        })
        .andWhere('appointment.startsAt < :endsAt', { endsAt: dto.endsAt })
        .andWhere('appointment.endsAt > :startsAt', { startsAt: dto.startsAt })
        .getOne();

      if (patientConflict) {
        return { conflict: 'patient' };
      }

      const appointment = manager.getRepository(Appointment).create({
        doctorId: dto.doctorId,
        patientId: dto.patientId,
        startsAt: dto.startsAt,
        endsAt: dto.endsAt,
        status: dto.status ?? AppointmentStatus.SCHEDULED,
      });

      return {
        conflict: null,
        appointment: await manager.getRepository(Appointment).save(appointment),
      };
    });
  }
}

export const appointmentRepository = new AppointmentRepository();

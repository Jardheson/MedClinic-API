import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { DataSource } from 'typeorm';
import { AppointmentRepository } from '../../src/repositories/Appointment.repository';
import { DoctorRepository } from '../../src/repositories/Doctor.repository';
import { MedicalRecordRepository } from '../../src/repositories/MedicalRecord.repository';
import { PatientRepository } from '../../src/repositories/Patient.repository';
import { UserRepository } from '../../src/repositories/User.repository';
import { WorkScheduleRepository } from '../../src/repositories/WorkSchedule.repository';
import { AppointmentStatus } from '../../src/entities/AppointmentStatus.enum';
import { UserRole } from '../../src/entities/UserRole.enum';
import { WorkScheduleWeekday } from '../../src/entities/WorkScheduleWeekday.enum';
import {
  createIntegrationDataSource,
  isIntegrationDatabaseConfigured,
  resetIntegrationDatabase,
} from './helpers/test-data-source';

const describeIfIntegrationDb = isIntegrationDatabaseConfigured() ? describe : describe.skip;

describeIfIntegrationDb('Repository integration with PostgreSQL', () => {
  let dataSource: DataSource;
  let userRepository: UserRepository;
  let doctorRepository: DoctorRepository;
  let workScheduleRepository: WorkScheduleRepository;
  let patientRepository: PatientRepository;
  let appointmentRepository: AppointmentRepository;
  let medicalRecordRepository: MedicalRecordRepository;

  beforeAll(async () => {
    dataSource = createIntegrationDataSource();
    await dataSource.initialize();
    await dataSource.runMigrations();

    userRepository = new UserRepository(dataSource);
    doctorRepository = new DoctorRepository(dataSource);
    workScheduleRepository = new WorkScheduleRepository(dataSource);
    patientRepository = new PatientRepository(dataSource);
    appointmentRepository = new AppointmentRepository(dataSource);
    medicalRecordRepository = new MedicalRecordRepository(dataSource);
  });

  beforeEach(async () => {
    await resetIntegrationDatabase(dataSource);
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
  });

  it('persiste e consulta usuários por e-mail, id e role', async () => {
    const createdUser = await userRepository.create({
      name: 'Dra. Alice',
      email: 'alice@medclinic.com',
      passwordHash: 'senha-hash',
      role: UserRole.DOCTOR,
    });

    const foundWithoutPassword = await userRepository.findByEmail('alice@medclinic.com');
    const foundWithPassword = await userRepository.findByEmail('alice@medclinic.com', true);
    const foundById = await userRepository.findById(createdUser.id);
    const existsByRole = await userRepository.existsByRole(UserRole.DOCTOR);

    expect(foundWithoutPassword?.id).toBe(createdUser.id);
    expect(foundWithoutPassword?.senha).toBeUndefined();
    expect(foundWithPassword?.senha).toBe('senha-hash');
    expect(foundById?.email).toBe('alice@medclinic.com');
    expect(existsByRole).toBe(true);
  });

  it('persiste e consulta pacientes por id e cpf', async () => {
    const createdPatient = await patientRepository.create({
      name: 'Maria Souza',
      cpf: '12345678901',
    });

    const foundById = await patientRepository.findById(createdPatient.id);
    const foundByCpf = await patientRepository.findByCpf('12345678901');

    expect(foundById?.id).toBe(createdPatient.id);
    expect(foundByCpf?.cpf).toBe('12345678901');
  });

  it('persiste médicos e escalas por userId público', async () => {
    const createdUser = await userRepository.create({
      name: 'Dra. Alice',
      email: 'alice@medclinic.com',
      passwordHash: 'senha-hash',
      role: UserRole.DOCTOR,
    });

    const createdDoctor = await doctorRepository.create({
      userId: createdUser.id,
      crm: 'CRM1234',
    });

    await workScheduleRepository.replaceForDoctor(createdUser.id, [
      {
        weekday: WorkScheduleWeekday.MONDAY,
        startTime: '08:00',
        endTime: '12:00',
        slotDurationMinutes: 60,
      },
    ]);

    const foundDoctor = await doctorRepository.findByUserId(createdUser.id);
    const schedules = await workScheduleRepository.findByDoctorId(createdUser.id);
    const mondaySchedules = await workScheduleRepository.findByDoctorIdAndWeekday(
      createdUser.id,
      WorkScheduleWeekday.MONDAY,
    );

    expect(createdDoctor.userId).toBe(createdUser.id);
    expect(foundDoctor?.crm).toBe('CRM1234');
    expect(schedules).toHaveLength(1);
    expect(mondaySchedules).toHaveLength(1);
  });

  it('persiste consultas e identifica vínculo médico-paciente pelos status permitidos', async () => {
    const doctor = await userRepository.create({
      name: 'Dra. Alice',
      email: 'alice@medclinic.com',
      passwordHash: 'senha-hash',
      role: UserRole.DOCTOR,
    });
    const patient = await patientRepository.create({
      name: 'Maria Souza',
      cpf: '12345678901',
    });

    const createdAppointment = await appointmentRepository.create({
      doctorId: doctor.id,
      patientId: patient.id,
      startsAt: new Date('2026-10-19T09:00:00.000Z'),
      endsAt: new Date('2026-10-19T10:00:00.000Z'),
      status: AppointmentStatus.SCHEDULED,
    });

    const noLinkYet = await appointmentRepository.doctorHasLinkWithPatient(
      doctor.id,
      patient.id,
      [AppointmentStatus.IN_PROGRESS, AppointmentStatus.DONE],
    );

    createdAppointment.status = AppointmentStatus.DONE;
    await appointmentRepository.save(createdAppointment);

    const foundById = await appointmentRepository.findById(createdAppointment.id);
    const hasLink = await appointmentRepository.doctorHasLinkWithPatient(
      doctor.id,
      patient.id,
      [AppointmentStatus.IN_PROGRESS, AppointmentStatus.DONE],
    );
    const appointmentsByDate = await appointmentRepository.findByDoctorAndDate(
      doctor.id,
      '2026-10-19',
    );

    expect(noLinkYet).toBe(false);
    expect(foundById?.status).toBe(AppointmentStatus.DONE);
    expect(hasLink).toBe(true);
    expect(appointmentsByDate).toHaveLength(1);
  });

  it('persiste prontuários e retorna a lista em ordem decrescente de criação', async () => {
    const doctor = await userRepository.create({
      name: 'Dra. Alice',
      email: 'alice@medclinic.com',
      passwordHash: 'senha-hash',
      role: UserRole.DOCTOR,
    });
    const patient = await patientRepository.create({
      name: 'Maria Souza',
      cpf: '12345678901',
    });

    await medicalRecordRepository.create({
      doctorId: doctor.id,
      patientId: patient.id,
      descricao: 'Primeiro registro clínico.',
      prescricao: 'Repouso.',
    });

    await new Promise((resolve) => setTimeout(resolve, 5));

    await medicalRecordRepository.create({
      doctorId: doctor.id,
      patientId: patient.id,
      descricao: 'Segundo registro clínico.',
      prescricao: 'Reavaliação em 7 dias.',
    });

    const medicalRecords = await medicalRecordRepository.findByPatientId(patient.id);

    expect(medicalRecords).toHaveLength(2);
    expect(medicalRecords[0]?.descricao).toBe('Segundo registro clínico.');
    expect(medicalRecords[1]?.descricao).toBe('Primeiro registro clínico.');
  });

  it('permite apenas uma consulta quando duas requisições disputam o mesmo horário', async () => {
    const doctor = await userRepository.create({
      name: 'Dra. Alice',
      email: 'alice@medclinic.com',
      passwordHash: 'senha-hash',
      role: UserRole.DOCTOR,
    });
    const firstPatient = await patientRepository.create({
      name: 'Maria Souza',
      cpf: '12345678901',
    });
    const secondPatient = await patientRepository.create({
      name: 'João Lima',
      cpf: '98765432100',
    });

    const startsAt = new Date('2026-10-19T09:00:00.000Z');
    const endsAt = new Date('2026-10-19T10:00:00.000Z');

    const results = await Promise.all([
      appointmentRepository.scheduleWithLock({
        doctorId: doctor.id,
        patientId: firstPatient.id,
        startsAt,
        endsAt,
        status: AppointmentStatus.SCHEDULED,
      }),
      appointmentRepository.scheduleWithLock({
        doctorId: doctor.id,
        patientId: secondPatient.id,
        startsAt,
        endsAt,
        status: AppointmentStatus.SCHEDULED,
      }),
    ]);

    const created = results.filter((result) => result.appointment);
    const blocked = results.filter((result) => result.conflict !== null);

    expect(created).toHaveLength(1);
    expect(blocked).toHaveLength(1);
    expect(blocked[0]?.conflict).toBe('doctor');

    const persisted = await appointmentRepository.findByDoctorAndDate(doctor.id, '2026-10-19');
    expect(persisted).toHaveLength(1);
  });
});

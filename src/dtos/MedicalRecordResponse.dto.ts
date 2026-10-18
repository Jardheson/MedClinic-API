export interface MedicalRecordResponseDto {
  id: string;
  doctorId: string;
  patientId: string;
  descricao: string;
  prescricao: string | null;
  createdAt: Date;
}

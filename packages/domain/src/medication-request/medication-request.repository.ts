import type { MedicationRequest } from "./medication-request.js";

export interface MedicationRequestRepository {
  findByPatientId(patientId: string): Promise<MedicationRequest[]>;
  findById(id: string): Promise<MedicationRequest | undefined>;
  save(medicationRequest: MedicationRequest): Promise<void>;
}

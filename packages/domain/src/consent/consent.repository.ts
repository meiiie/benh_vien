import type { Consent } from "./consent.js";

export interface ConsentRepository {
  findByPatientId(patientId: string): Promise<Consent[]>;
  findById(id: string): Promise<Consent | undefined>;
  save(consent: Consent): Promise<void>;
}

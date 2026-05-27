import type { ServiceRequest } from "./service-request.js";

export interface ServiceRequestRepository {
  findByPatientId(patientId: string): Promise<ServiceRequest[]>;
  findById(id: string): Promise<ServiceRequest | undefined>;
  save(serviceRequest: ServiceRequest): Promise<void>;
}

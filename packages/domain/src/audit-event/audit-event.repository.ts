import type { AuditEvent } from "./audit-event.js";

export interface AuditEventRepository {
  findByPatientId(patientId: string, limit?: number): Promise<AuditEvent[]>;
  save(event: AuditEvent): Promise<AuditEvent>;
}

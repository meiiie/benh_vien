import type { AuditEvent, AuditIntegrityReport } from "./audit-event.js";

export interface AuditEventRepository {
  findRecent(limit?: number): Promise<AuditEvent[]>;
  findByPatientId(patientId: string, limit?: number): Promise<AuditEvent[]>;
  verifyPatientIntegrity(patientId: string): Promise<AuditIntegrityReport>;
  save(event: AuditEvent): Promise<AuditEvent>;
}

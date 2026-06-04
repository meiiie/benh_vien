import { AuditEvent, sealAuditEvent } from "./audit-event.js";
import type { RecordAuditEventInput } from "./audit-event.types.js";

export function createSealedAuditEvent(input: RecordAuditEventInput): AuditEvent {
  return sealAuditEvent(AuditEvent.record(input));
}

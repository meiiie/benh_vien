import { RecordTransfer } from "@benh-vien-so/domain";
import type { AuditEvent } from "@benh-vien-so/domain";
import { InMemoryAuditEventRepository } from "../audit-events/in-memory-audit-event.repository.js";

export function createFailedRecordTransfer(input: {
  readonly id: string;
  readonly nextRetryAt: string;
  readonly retryCount?: number;
}): RecordTransfer {
  return RecordTransfer.create({
    id: input.id,
    patientId: "patient-worker-001",
    status: "failed",
    priority: "urgent",
    bundleType: "document",
    bundleId: "patient-document-patient-worker-001",
    sourceOrganizationId: "hospital-hai-phong-demo",
    recipientOrganizationId: "hospital-hai-phong-referral",
    consentReference: "consent-worker-001",
    requestedByActorId: "practitioner-worker-001",
    reason: "Chuyển hồ sơ để tiếp tục điều trị.",
    requestedAt: "2026-05-28T04:50:00.000Z",
    sentAt: "2026-05-28T05:00:00.000Z",
    failedAt: "2026-05-28T05:05:00.000Z",
    failureReason: "Recipient gateway unavailable.",
    nextRetryAt: input.nextRetryAt,
    retryCount: input.retryCount ?? 0
  });
}

export class FailingAuditEventRepository extends InMemoryAuditEventRepository {
  override async save(_event: AuditEvent): Promise<AuditEvent> {
    throw new Error("Audit repository is unavailable.");
  }
}

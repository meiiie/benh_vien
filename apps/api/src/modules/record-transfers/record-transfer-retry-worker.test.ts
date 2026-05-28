import { describe, expect, it } from "vitest";
import { RecordTransfer } from "@benh-vien-so/domain";
import { InMemoryAuditEventRepository } from "../audit-events/in-memory-audit-event.repository.js";
import { InMemoryRecordTransferRepository } from "./in-memory-record-transfer.repository.js";
import { processDueRecordTransferRetries } from "./record-transfer-retry-worker.js";

describe("record transfer retry worker", () => {
  it("returns due failed transfers to the ready queue and writes an operations audit event", async () => {
    const dueTransfer = createFailedRecordTransfer({
      id: "record-transfer-worker-due-001",
      nextRetryAt: "2026-05-28T05:10:00.000Z"
    });
    const futureTransfer = createFailedRecordTransfer({
      id: "record-transfer-worker-future-001",
      nextRetryAt: "2026-05-28T06:10:00.000Z"
    });
    const recordTransferRepository = new InMemoryRecordTransferRepository([
      dueTransfer,
      futureTransfer
    ]);
    const auditRepository = new InMemoryAuditEventRepository();

    const result = await processDueRecordTransferRetries(
      {
        recordTransferRepository,
        auditRepository
      },
      {
        dueAt: new Date("2026-05-28T05:15:00.000Z"),
        actorId: "system:test-worker"
      }
    );

    expect(result).toMatchObject({
      status: "ok",
      dueCount: 1,
      retriedCount: 1,
      skippedCount: 0,
      retriedTransferIds: ["record-transfer-worker-due-001"]
    });

    const retriedTransfer = await recordTransferRepository.findById(
      "record-transfer-worker-due-001"
    );
    expect(retriedTransfer?.toSnapshot()).toMatchObject({
      status: "ready",
      retryCount: 1,
      note: "Retry worker đưa lại gói hồ sơ vào hàng đợi gửi."
    });
    expect(retriedTransfer?.toSnapshot().sentAt).toBeUndefined();
    expect(retriedTransfer?.toSnapshot().failedAt).toBeUndefined();
    expect(retriedTransfer?.toSnapshot().failureReason).toBeUndefined();
    expect(retriedTransfer?.toSnapshot().nextRetryAt).toBeUndefined();

    const notDueTransfer = await recordTransferRepository.findById(
      "record-transfer-worker-future-001"
    );
    expect(notDueTransfer?.toSnapshot()).toMatchObject({
      status: "failed",
      retryCount: 0,
      nextRetryAt: "2026-05-28T06:10:00.000Z"
    });

    const auditEvents = await auditRepository.findByPatientId("patient-worker-001");
    expect(auditEvents).toHaveLength(1);
    expect(auditEvents[0]?.toSnapshot()).toMatchObject({
      actorId: "system:test-worker",
      action: "record-transfer.retry",
      resourceType: "RecordTransfer",
      resourceId: "record-transfer-worker-due-001",
      patientId: "patient-worker-001",
      purposeOfUse: "OPERATIONS",
      metadata: {
        actorRole: "system",
        worker: "record-transfer-retry-worker",
        mode: "scheduled",
        retryCount: 1,
        scheduledRetryAt: "2026-05-28T05:10:00.000Z",
        previousFailureReason: "Recipient gateway unavailable."
      }
    });
  });

  it("does not retry failed transfers that reached the configured retry ceiling", async () => {
    const cappedTransfer = createFailedRecordTransfer({
      id: "record-transfer-worker-capped-001",
      nextRetryAt: "2026-05-28T05:10:00.000Z",
      retryCount: 3
    });
    const recordTransferRepository = new InMemoryRecordTransferRepository([
      cappedTransfer
    ]);
    const auditRepository = new InMemoryAuditEventRepository();

    const result = await processDueRecordTransferRetries(
      {
        recordTransferRepository,
        auditRepository
      },
      {
        dueAt: new Date("2026-05-28T05:15:00.000Z"),
        maxRetryCount: 3
      }
    );

    expect(result).toMatchObject({
      dueCount: 0,
      retriedCount: 0,
      skippedCount: 0
    });
    expect(
      (await recordTransferRepository.findById("record-transfer-worker-capped-001"))?.toSnapshot()
    ).toMatchObject({
      status: "failed",
      retryCount: 3,
      nextRetryAt: "2026-05-28T05:10:00.000Z"
    });
    expect(await auditRepository.findByPatientId("patient-worker-001")).toHaveLength(0);
  });
});

function createFailedRecordTransfer(input: {
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

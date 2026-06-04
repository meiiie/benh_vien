import { describe, expect, it } from "vitest";
import { InMemoryRecordTransferRepository } from "./in-memory-record-transfer.repository.js";
import { processDueRecordTransferRetries } from "./record-transfer-retry-worker.js";
import {
  createFailedRecordTransfer,
  FailingAuditEventRepository
} from "./record-transfer-retry-worker.test-support.js";

describe("record transfer retry worker audit boundary", () => {
  it("does not mark persisted retry lifecycle changes as skipped when audit persistence fails", async () => {
    const dueTransfer = createFailedRecordTransfer({
      id: "record-transfer-worker-audit-failed-retry-001",
      nextRetryAt: "2026-05-28T05:10:00.000Z"
    });
    const cappedTransfer = createFailedRecordTransfer({
      id: "record-transfer-worker-audit-failed-dead-letter-001",
      nextRetryAt: "2026-05-28T05:10:00.000Z",
      retryCount: 3
    });
    const recordTransferRepository = new InMemoryRecordTransferRepository([
      dueTransfer,
      cappedTransfer
    ]);

    const result = await processDueRecordTransferRetries(
      {
        recordTransferRepository,
        auditRepository: new FailingAuditEventRepository()
      },
      {
        dueAt: new Date("2026-05-28T05:15:00.000Z"),
        maxRetryCount: 3
      }
    );

    expect(result).toMatchObject({
      retriedCount: 1,
      deadLetteredCount: 1,
      skippedCount: 0,
      retriedTransferIds: ["record-transfer-worker-audit-failed-retry-001"],
      deadLetteredTransferIds: [
        "record-transfer-worker-audit-failed-dead-letter-001"
      ],
      skippedTransferIds: []
    });
    expect(
      (
        await recordTransferRepository.findById(
          "record-transfer-worker-audit-failed-retry-001"
        )
      )?.toSnapshot()
    ).toMatchObject({
      status: "ready",
      retryCount: 1
    });
    expect(
      (
        await recordTransferRepository.findById(
          "record-transfer-worker-audit-failed-dead-letter-001"
        )
      )?.toSnapshot()
    ).toMatchObject({
      status: "dead-lettered",
      deadLetteredAt: "2026-05-28T05:15:00.000Z"
    });
  });
});

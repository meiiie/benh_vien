import { describe, expect, it } from "vitest";
import { DomainError } from "../shared/domain-error.js";
import { RecordTransfer } from "./record-transfer.js";
import {
  createFailedRecordTransfer,
  createRecordTransfer
} from "./record-transfer.test-support.js";

describe("RecordTransfer rehydration invariants", () => {
  it("rejects rehydrated acknowledgement metadata before a transfer has been received", () => {
    const transfer = createRecordTransfer({
      id: "record-transfer-test-010"
    });

    expect(() =>
      RecordTransfer.rehydrate({
        ...transfer.toSnapshot(),
        receivedByActorId: "practitioner-recipient-001"
      })
    ).toThrow(DomainError);
  });

  it("rejects invalid rehydrated transfer lifecycle metadata", () => {
    const snapshot = createRecordTransfer({
      id: "record-transfer-test-012"
    }).toSnapshot();

    expect(() =>
      RecordTransfer.rehydrate({
        ...snapshot,
        status: "unknown" as never
      })
    ).toThrow(DomainError);

    expect(() =>
      RecordTransfer.rehydrate({
        ...snapshot,
        priority: "low" as never
      })
    ).toThrow(DomainError);

    expect(() =>
      RecordTransfer.rehydrate({
        ...snapshot,
        bundleType: "binary" as never
      })
    ).toThrow(DomainError);

    expect(() =>
      RecordTransfer.rehydrate({
        ...snapshot,
        status: "requested",
        sentAt: "2026-05-28T02:30:00.000Z"
      })
    ).toThrow(DomainError);

    expect(() =>
      RecordTransfer.rehydrate({
        ...snapshot,
        status: "completed",
        sentAt: "2026-05-28T02:30:00.000Z"
      })
    ).toThrow(DomainError);

    expect(() =>
      RecordTransfer.rehydrate({
        ...snapshot,
        updatedAt: "2026-05-27T02:00:00.000Z"
      })
    ).toThrow(DomainError);
  });

  it("rejects rehydrated dead-lettered transfers that still have a retry schedule", () => {
    const transfer = createFailedRecordTransfer({
      id: "record-transfer-test-011"
    });
    transfer.markDeadLettered({
      deadLetteredAt: "2026-05-28T03:10:00.000Z"
    });

    expect(() =>
      RecordTransfer.rehydrate({
        ...transfer.toSnapshot(),
        nextRetryAt: "2026-05-28T03:30:00.000Z"
      })
    ).toThrow(DomainError);
  });
});

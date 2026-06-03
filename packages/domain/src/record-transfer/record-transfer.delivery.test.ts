import { describe, expect, it } from "vitest";
import { DomainError } from "../shared/domain-error.js";
import { createFailedRecordTransfer, createRecordTransfer } from "./record-transfer.test-support.js";

describe("RecordTransfer delivery retries", () => {
  it("records a failed delivery and prepares a retry", () => {
    const transfer = createRecordTransfer({
      id: "record-transfer-test-006"
    });

    transfer.markSent({
      sentAt: "2026-05-28T02:30:00.000Z"
    });
    transfer.markFailed({
      failedAt: "2026-05-28T02:35:00.000Z",
      failureReason: "Gateway bệnh viện nhận tạm thời không phản hồi.",
      nextRetryAt: "2026-05-28T02:50:00.000Z"
    });

    expect(transfer.toSnapshot()).toMatchObject({
      status: "failed",
      failedAt: "2026-05-28T02:35:00.000Z",
      failureReason: "Gateway bệnh viện nhận tạm thời không phản hồi.",
      nextRetryAt: "2026-05-28T02:50:00.000Z",
      retryCount: 0
    });

    transfer.retry({
      retryAt: "2026-05-28T02:50:00.000Z",
      note: "Đưa lại vào hàng đợi gửi sau khi gateway sẵn sàng."
    });

    expect(transfer.toSnapshot()).toMatchObject({
      status: "ready",
      retryCount: 1,
      note: "Đưa lại vào hàng đợi gửi sau khi gateway sẵn sàng.",
      updatedAt: "2026-05-28T02:50:00.000Z"
    });
    expect(transfer.toSnapshot().sentAt).toBeUndefined();
    expect(transfer.toSnapshot().failedAt).toBeUndefined();
    expect(transfer.toSnapshot().failureReason).toBeUndefined();
    expect(transfer.toSnapshot().nextRetryAt).toBeUndefined();

    transfer.markSent({
      sentAt: "2026-05-28T03:00:00.000Z"
    });

    expect(transfer.toSnapshot()).toMatchObject({
      status: "in-progress",
      sentAt: "2026-05-28T03:00:00.000Z",
      retryCount: 1
    });
  });

  it("moves an exhausted failed transfer to the dead-letter state", () => {
    const transfer = createFailedRecordTransfer({
      id: "record-transfer-test-008"
    });

    transfer.markDeadLettered({
      deadLetteredAt: "2026-05-28T03:10:00.000Z",
      note: "Đã vượt quá số lần thử gửi tự động, cần nhân sự vận hành kiểm tra."
    });

    expect(transfer.toSnapshot()).toMatchObject({
      status: "dead-lettered",
      failedAt: "2026-05-28T02:35:00.000Z",
      failureReason: "Gateway bệnh viện nhận tạm thời không phản hồi.",
      deadLetteredAt: "2026-05-28T03:10:00.000Z",
      note: "Đã vượt quá số lần thử gửi tự động, cần nhân sự vận hành kiểm tra.",
      updatedAt: "2026-05-28T03:10:00.000Z"
    });
    expect(transfer.toSnapshot().nextRetryAt).toBeUndefined();
  });

  it("rejects retrying a transfer before it has failed", () => {
    const transfer = createRecordTransfer({
      id: "record-transfer-test-007"
    });

    expect(() =>
      transfer.retry({
        retryAt: "2026-05-28T02:45:00.000Z"
      })
    ).toThrow(DomainError);
  });
});

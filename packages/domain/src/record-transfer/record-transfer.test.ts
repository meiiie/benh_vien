import { describe, expect, it } from "vitest";
import { DomainError } from "../shared/domain-error.js";
import { RecordTransfer } from "./record-transfer.js";
import {
  createRecordTransfer,
  createRecordTransferInput
} from "./record-transfer.test-support.js";

describe("RecordTransfer lifecycle", () => {
  it("creates an inter-facility transfer package with safe defaults", () => {
    const transfer = createRecordTransfer({
      id: "record-transfer-test-001",
      reason: "Chuyển tuyến để tiếp tục điều trị chuyên khoa tim mạch."
    });

    expect(transfer.toSnapshot()).toMatchObject({
      status: "requested",
      priority: "routine",
      bundleType: "document",
      bundleId: "patient-document-patient-test-001",
      consentReference: "consent-test-001"
    });
  });

  it("rejects transfers without a distinct receiving organization", () => {
    expect(() =>
      RecordTransfer.create(
        createRecordTransferInput({
          id: "record-transfer-test-002",
          bundleType: "collection",
          bundleId: "patient-record-patient-test-001",
          sourceOrganizationId: "hospital-a",
          recipientOrganizationId: "hospital-a",
          reason: "Chuyển hồ sơ nội bộ sai ngữ cảnh."
        })
      )
    ).toThrow(DomainError);
  });

  it("requires the sent time before the received time", () => {
    expect(() =>
      RecordTransfer.create(
        createRecordTransferInput({
          id: "record-transfer-test-003",
          reason: "Chuyển tuyến.",
          receivedAt: "2026-05-28T03:00:00.000Z"
        })
      )
    ).toThrow(DomainError);
  });

  it("moves a transfer through sent and received lifecycle milestones", () => {
    const transfer = createRecordTransfer({
      id: "record-transfer-test-004",
      reason: "Chuyển hồ sơ để hội chẩn chuyên khoa."
    });

    transfer.markSent({
      sentAt: "2026-05-28T02:30:00.000Z",
      note: "Đã gửi qua kênh liên thông."
    });
    transfer.markReceived({
      receivedAt: "2026-05-28T02:45:00.000Z",
      receivedByActorId: "practitioner-recipient-001",
      acknowledgementReference: "ack-record-transfer-test-004",
      note: "Bệnh viện nhận đã xác nhận."
    });

    expect(transfer.toSnapshot()).toMatchObject({
      status: "completed",
      sentAt: "2026-05-28T02:30:00.000Z",
      receivedAt: "2026-05-28T02:45:00.000Z",
      receivedByActorId: "practitioner-recipient-001",
      acknowledgementReference: "ack-record-transfer-test-004",
      note: "Bệnh viện nhận đã xác nhận.",
      updatedAt: "2026-05-28T02:45:00.000Z"
    });
  });

  it("rejects acknowledgement metadata before a transfer has been received", () => {
    expect(() =>
      RecordTransfer.create(
        createRecordTransferInput({
          id: "record-transfer-test-009",
          sentAt: "2026-05-28T02:30:00.000Z",
          receivedByActorId: "practitioner-recipient-001"
        })
      )
    ).toThrow(DomainError);
  });

  it("rejects receiving a transfer before it has been sent", () => {
    const transfer = createRecordTransfer({
      id: "record-transfer-test-005"
    });

    expect(() =>
      transfer.markReceived({
        receivedAt: "2026-05-28T02:45:00.000Z"
      })
    ).toThrow(DomainError);
  });
});

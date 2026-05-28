import { describe, expect, it } from "vitest";
import { DomainError } from "../shared/domain-error.js";
import { RecordTransfer } from "./record-transfer.js";

describe("RecordTransfer", () => {
  it("creates an inter-facility transfer package with safe defaults", () => {
    const transfer = RecordTransfer.create({
      id: "record-transfer-test-001",
      patientId: "patient-test-001",
      bundleType: "document",
      bundleId: "patient-document-patient-test-001",
      sourceOrganizationId: "hospital-source",
      recipientOrganizationId: "hospital-recipient",
      consentReference: "consent-test-001",
      requestedByActorId: "practitioner-test-001",
      reason: "Chuyển tuyến để tiếp tục điều trị chuyên khoa tim mạch.",
      requestedAt: "2026-05-28T02:00:00.000Z"
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
      RecordTransfer.create({
        id: "record-transfer-test-002",
        patientId: "patient-test-001",
        bundleType: "collection",
        bundleId: "patient-record-patient-test-001",
        sourceOrganizationId: "hospital-a",
        recipientOrganizationId: "hospital-a",
        consentReference: "consent-test-001",
        requestedByActorId: "practitioner-test-001",
        reason: "Chuyển hồ sơ nội bộ sai ngữ cảnh."
      })
    ).toThrow(DomainError);
  });

  it("requires the sent time before the received time", () => {
    expect(() =>
      RecordTransfer.create({
        id: "record-transfer-test-003",
        patientId: "patient-test-001",
        bundleType: "document",
        bundleId: "patient-document-patient-test-001",
        sourceOrganizationId: "hospital-source",
        recipientOrganizationId: "hospital-recipient",
        consentReference: "consent-test-001",
        requestedByActorId: "practitioner-test-001",
        reason: "Chuyển tuyến.",
        requestedAt: "2026-05-28T02:00:00.000Z",
        receivedAt: "2026-05-28T03:00:00.000Z"
      })
    ).toThrow(DomainError);
  });

  it("moves a transfer through sent and received lifecycle milestones", () => {
    const transfer = RecordTransfer.create({
      id: "record-transfer-test-004",
      patientId: "patient-test-001",
      bundleType: "document",
      bundleId: "patient-document-patient-test-001",
      sourceOrganizationId: "hospital-source",
      recipientOrganizationId: "hospital-recipient",
      consentReference: "consent-test-001",
      requestedByActorId: "practitioner-test-001",
      reason: "Chuyển hồ sơ để hội chẩn chuyên khoa.",
      requestedAt: "2026-05-28T02:00:00.000Z"
    });

    transfer.markSent({
      sentAt: "2026-05-28T02:30:00.000Z",
      note: "Đã gửi qua kênh liên thông."
    });
    transfer.markReceived({
      receivedAt: "2026-05-28T02:45:00.000Z",
      note: "Bệnh viện nhận đã xác nhận."
    });

    expect(transfer.toSnapshot()).toMatchObject({
      status: "completed",
      sentAt: "2026-05-28T02:30:00.000Z",
      receivedAt: "2026-05-28T02:45:00.000Z",
      note: "Bệnh viện nhận đã xác nhận.",
      updatedAt: "2026-05-28T02:45:00.000Z"
    });
  });

  it("records a failed delivery and prepares a retry", () => {
    const transfer = RecordTransfer.create({
      id: "record-transfer-test-006",
      patientId: "patient-test-001",
      bundleType: "document",
      bundleId: "patient-document-patient-test-001",
      sourceOrganizationId: "hospital-source",
      recipientOrganizationId: "hospital-recipient",
      consentReference: "consent-test-001",
      requestedByActorId: "practitioner-test-001",
      reason: "Chuyển hồ sơ để hội chẩn chuyên khoa.",
      requestedAt: "2026-05-28T02:00:00.000Z"
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

  it("rejects receiving a transfer before it has been sent", () => {
    const transfer = RecordTransfer.create({
      id: "record-transfer-test-005",
      patientId: "patient-test-001",
      bundleType: "document",
      bundleId: "patient-document-patient-test-001",
      sourceOrganizationId: "hospital-source",
      recipientOrganizationId: "hospital-recipient",
      consentReference: "consent-test-001",
      requestedByActorId: "practitioner-test-001",
      reason: "Chuyển hồ sơ để hội chẩn chuyên khoa.",
      requestedAt: "2026-05-28T02:00:00.000Z"
    });

    expect(() =>
      transfer.markReceived({
        receivedAt: "2026-05-28T02:45:00.000Z"
      })
    ).toThrow(DomainError);
  });

  it("rejects retrying a transfer before it has failed", () => {
    const transfer = RecordTransfer.create({
      id: "record-transfer-test-007",
      patientId: "patient-test-001",
      bundleType: "document",
      bundleId: "patient-document-patient-test-001",
      sourceOrganizationId: "hospital-source",
      recipientOrganizationId: "hospital-recipient",
      consentReference: "consent-test-001",
      requestedByActorId: "practitioner-test-001",
      reason: "Chuyển hồ sơ để hội chẩn chuyên khoa.",
      requestedAt: "2026-05-28T02:00:00.000Z"
    });

    expect(() =>
      transfer.retry({
        retryAt: "2026-05-28T02:45:00.000Z"
      })
    ).toThrow(DomainError);
  });
});

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
});

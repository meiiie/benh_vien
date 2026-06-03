import type { RecordTransferAcknowledgementCallbackRequest } from "@benh-vien-so/contracts";
import type { RecordTransferSnapshot } from "@benh-vien-so/domain";
import { describe, expect, it } from "vitest";
import {
  toAcknowledgementCallbackAuditMetadata,
  toCallbackSignatureAuditMetadata
} from "./record-transfer-acknowledgement-audit-metadata.js";

const completedTransferSnapshot: RecordTransferSnapshot = {
  id: "record-transfer-demo-001",
  patientId: "patient-demo-001",
  status: "completed",
  priority: "urgent",
  bundleType: "document",
  bundleId: "patient-document-patient-demo-001",
  sourceOrganizationId: "hospital-hai-phong-demo",
  recipientOrganizationId: "hospital-hai-phong-referral",
  consentReference: "consent-demo-transfer-001",
  requestedByActorId: "practitioner-demo-001",
  reason: "Referral continuity package",
  requestedAt: "2026-05-28T04:00:00.000Z",
  sentAt: "2026-05-28T04:30:00.000Z",
  receivedAt: "2026-05-28T04:45:00.000Z",
  receivedByActorId: "system-hai-phong-referral-gateway",
  acknowledgementReference: "ack-record-transfer-callback-001",
  retryCount: 0,
  createdAt: "2026-05-28T04:00:00.000Z",
  updatedAt: "2026-05-28T04:45:00.000Z"
};

const acknowledgementCallback: RecordTransferAcknowledgementCallbackRequest = {
  recipientOrganizationId: "hospital-hai-phong-referral",
  acknowledgementReference: "ack-record-transfer-callback-001",
  receivedAt: "2026-05-28T04:45:00.000Z",
  receivedByActorId: "system-hai-phong-referral-gateway",
  targetEndpointId: "endpoint-fhir-hai-phong-referral",
  deliveryIdempotencyKey: "wiiicare-record-transfer-callback-test-001"
};

describe("record transfer acknowledgement audit metadata", () => {
  it("keeps callback delivery context in the shared acknowledgement metadata", () => {
    expect(
      toAcknowledgementCallbackAuditMetadata(
        completedTransferSnapshot,
        acknowledgementCallback
      )
    ).toEqual({
      status: "completed",
      receivedAt: "2026-05-28T04:45:00.000Z",
      receivedByActorId: "system-hai-phong-referral-gateway",
      acknowledgementReference: "ack-record-transfer-callback-001",
      recipientOrganizationId: "hospital-hai-phong-referral",
      targetEndpointId: "endpoint-fhir-hai-phong-referral",
      deliveryIdempotencyKey: "wiiicare-record-transfer-callback-test-001"
    });
  });

  it("keeps callback signature evidence in audit metadata", () => {
    expect(
      toCallbackSignatureAuditMetadata({
        required: true,
        verified: true,
        algorithm: "HMAC-SHA256",
        timestamp: "2026-05-28T04:44:30.000Z",
        keyId: "gateway-hai-phong-referral"
      })
    ).toEqual({
      callbackSignatureRequired: true,
      callbackSignatureVerified: true,
      callbackSignatureTimestamp: "2026-05-28T04:44:30.000Z",
      callbackSignatureAlgorithm: "HMAC-SHA256",
      callbackSignatureKeyId: "gateway-hai-phong-referral"
    });
  });
});

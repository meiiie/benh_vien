import { describe, expect, it } from "vitest";
import { DomainError } from "../shared/domain-error.js";
import { RecordTransferDeliveryAttempt } from "./record-transfer-delivery-attempt.js";

describe("RecordTransferDeliveryAttempt", () => {
  it("queues a delivery attempt with stable transfer metadata", () => {
    const attempt = RecordTransferDeliveryAttempt.queue({
      id: "record-transfer-delivery-test-001",
      recordTransferId: "record-transfer-test-001",
      patientId: "patient-test-001",
      targetEndpointId: "endpoint-fhir-recipient",
      targetEndpointAddress: "https://fhir.recipient.example/fhir",
      bundleId: "patient-document-patient-test-001",
      bundleType: "document",
      idempotencyKey: "wiiicare-record-transfer-test-key",
      attemptNumber: 1,
      queuedAt: "2026-05-28T06:00:00.000Z"
    });

    expect(attempt.toSnapshot()).toMatchObject({
      id: "record-transfer-delivery-test-001",
      recordTransferId: "record-transfer-test-001",
      status: "queued",
      attemptNumber: 1,
      queuedAt: "2026-05-28T06:00:00.000Z",
      createdAt: "2026-05-28T06:00:00.000Z",
      updatedAt: "2026-05-28T06:00:00.000Z",
      targetEndpointAddress: "https://fhir.recipient.example/fhir"
    });
  });

  it("marks a queued delivery attempt as succeeded", () => {
    const attempt = RecordTransferDeliveryAttempt.queue({
      id: "record-transfer-delivery-test-002",
      recordTransferId: "record-transfer-test-001",
      patientId: "patient-test-001",
      targetEndpointId: "endpoint-fhir-recipient",
      targetEndpointAddress: "https://fhir.recipient.example/fhir",
      bundleId: "patient-document-patient-test-001",
      bundleType: "document",
      idempotencyKey: "wiiicare-record-transfer-test-key",
      attemptNumber: 1,
      queuedAt: "2026-05-28T06:00:00.000Z"
    });

    attempt.markSucceeded({
      completedAt: "2026-05-28T06:00:03.000Z",
      httpStatus: 201,
      responseBodyPreview: '{"resourceType":"Bundle"}'
    });

    expect(attempt.toSnapshot()).toMatchObject({
      status: "succeeded",
      completedAt: "2026-05-28T06:00:03.000Z",
      httpStatus: 201,
      responseBodyPreview: '{"resourceType":"Bundle"}'
    });
  });

  it("marks a queued delivery attempt as failed", () => {
    const attempt = RecordTransferDeliveryAttempt.queue({
      id: "record-transfer-delivery-test-003",
      recordTransferId: "record-transfer-test-001",
      patientId: "patient-test-001",
      targetEndpointId: "endpoint-fhir-recipient",
      targetEndpointAddress: "https://fhir.recipient.example/fhir",
      bundleId: "patient-document-patient-test-001",
      bundleType: "document",
      idempotencyKey: "wiiicare-record-transfer-test-key",
      attemptNumber: 1,
      queuedAt: "2026-05-28T06:00:00.000Z"
    });

    attempt.markFailed({
      completedAt: "2026-05-28T06:00:03.000Z",
      httpStatus: 503,
      responseBodyPreview: "Service unavailable",
      errorMessage: "FHIR endpoint returned HTTP 503."
    });

    expect(attempt.toSnapshot()).toMatchObject({
      status: "failed",
      completedAt: "2026-05-28T06:00:03.000Z",
      httpStatus: 503,
      responseBodyPreview: "Service unavailable",
      errorMessage: "FHIR endpoint returned HTTP 503."
    });
  });

  it("keeps response body previews bounded at the domain boundary", () => {
    const attempt = RecordTransferDeliveryAttempt.queue({
      id: "record-transfer-delivery-test-preview-limit",
      recordTransferId: "record-transfer-test-001",
      patientId: "patient-test-001",
      targetEndpointId: "endpoint-fhir-recipient",
      targetEndpointAddress: "https://fhir.recipient.example/fhir",
      bundleId: "patient-document-patient-test-001",
      bundleType: "document",
      idempotencyKey: "wiiicare-record-transfer-test-preview-limit",
      attemptNumber: 1,
      queuedAt: "2026-05-28T06:00:00.000Z"
    });

    attempt.markFailed({
      completedAt: "2026-05-28T06:00:03.000Z",
      httpStatus: 503,
      responseBodyPreview: "x".repeat(2_100),
      errorMessage: "FHIR endpoint returned HTTP 503."
    });

    expect(attempt.toSnapshot().responseBodyPreview).toHaveLength(2_000);
    expect(
      RecordTransferDeliveryAttempt.rehydrate({
        ...attempt.toSnapshot(),
        responseBodyPreview: "y".repeat(2_100)
      }).toSnapshot().responseBodyPreview
    ).toHaveLength(2_000);
  });

  it("rejects terminal timestamps before the queued timestamp", () => {
    const attempt = RecordTransferDeliveryAttempt.queue({
      id: "record-transfer-delivery-test-004",
      recordTransferId: "record-transfer-test-001",
      patientId: "patient-test-001",
      targetEndpointId: "endpoint-fhir-recipient",
      targetEndpointAddress: "https://fhir.recipient.example/fhir",
      bundleId: "patient-document-patient-test-001",
      bundleType: "document",
      idempotencyKey: "wiiicare-record-transfer-test-key",
      attemptNumber: 1,
      queuedAt: "2026-05-28T06:00:00.000Z"
    });

    expect(() =>
      attempt.markSucceeded({
        completedAt: "2026-05-28T05:59:59.000Z",
        httpStatus: 201
      })
    ).toThrow(DomainError);
  });

  it("rejects invalid rehydrated terminal delivery metadata", () => {
    const snapshot = RecordTransferDeliveryAttempt.queue({
      id: "record-transfer-delivery-test-005",
      recordTransferId: "record-transfer-test-001",
      patientId: "patient-test-001",
      targetEndpointId: "endpoint-fhir-recipient",
      targetEndpointAddress: "https://fhir.recipient.example/fhir",
      bundleId: "patient-document-patient-test-001",
      bundleType: "document",
      idempotencyKey: "wiiicare-record-transfer-test-key",
      attemptNumber: 1,
      queuedAt: "2026-05-28T06:00:00.000Z"
    }).toSnapshot();

    expect(() =>
      RecordTransferDeliveryAttempt.rehydrate({
        ...snapshot,
        status: "queued",
        httpStatus: 102
      })
    ).toThrow(DomainError);

    expect(() =>
      RecordTransferDeliveryAttempt.rehydrate({
        ...snapshot,
        status: "succeeded",
        completedAt: "2026-05-28T06:00:03.000Z",
        httpStatus: 503
      })
    ).toThrow(DomainError);

    expect(() =>
      RecordTransferDeliveryAttempt.rehydrate({
        ...snapshot,
        status: "succeeded",
        completedAt: "2026-05-28T06:00:03.000Z",
        httpStatus: 201,
        errorMessage: "Unexpected error"
      })
    ).toThrow(DomainError);

    expect(() =>
      RecordTransferDeliveryAttempt.rehydrate({
        ...snapshot,
        status: "failed",
        completedAt: "2026-05-28T06:00:03.000Z",
        httpStatus: 200,
        errorMessage: "FHIR endpoint returned an unexpected payload."
      })
    ).toThrow(DomainError);

    expect(() =>
      RecordTransferDeliveryAttempt.rehydrate({
        ...snapshot,
        status: "failed",
        completedAt: "2026-05-28T05:59:59.000Z",
        errorMessage: "FHIR endpoint timed out."
      })
    ).toThrow(DomainError);

    expect(() =>
      RecordTransferDeliveryAttempt.rehydrate({
        ...snapshot,
        bundleType: "binary" as never
      })
    ).toThrow(DomainError);

    expect(() =>
      RecordTransferDeliveryAttempt.rehydrate({
        ...snapshot,
        updatedAt: "1999-01-01T00:00:00.000Z"
      })
    ).toThrow(DomainError);
  });

  it("rejects invalid endpoint addresses and attempt numbers", () => {
    expect(() =>
      RecordTransferDeliveryAttempt.queue({
        id: "record-transfer-delivery-test-006",
        recordTransferId: "record-transfer-test-001",
        patientId: "patient-test-001",
        targetEndpointId: "endpoint-fhir-recipient",
        targetEndpointAddress: "mllp://recipient.example:2575",
        bundleId: "patient-document-patient-test-001",
        bundleType: "document",
        idempotencyKey: "wiiicare-record-transfer-test-key",
        attemptNumber: 0
      })
    ).toThrow(DomainError);
  });
});

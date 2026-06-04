import { afterEach, describe, expect, it } from "vitest";
import { createDeliveryWorkerDependencies } from "./record-transfer-delivery-worker.test-support.js";
import { processQueuedRecordTransferDeliveries } from "./record-transfer-delivery-worker.js";
import type { RecordTransferFhirBundleSendInput } from "./record-transfer-delivery-worker.js";

const originalNodeEnv = process.env.NODE_ENV;

describe("record transfer delivery worker", () => {
  afterEach(() => {
    restoreEnv("NODE_ENV", originalNodeEnv);
  });

  it("posts a queued FHIR Bundle and marks the delivery attempt as succeeded", async () => {
    const sentBundles: RecordTransferFhirBundleSendInput[] = [];
    const dependencies = await createDeliveryWorkerDependencies({
      sender: {
        async send(input) {
          sentBundles.push(input);
          return {
            httpStatus: 201,
            responseBodyPreview: '{"resourceType":"OperationOutcome"}'
          };
        }
      }
    });

    const result = await processQueuedRecordTransferDeliveries(dependencies, {
      checkedAt: new Date("2026-05-28T07:00:05.000Z"),
      actorId: "system:test-delivery-worker"
    });

    expect(result).toMatchObject({
      status: "ok",
      queuedCount: 1,
      deliveredCount: 1,
      failedCount: 0,
      deliveredAttemptIds: ["record-transfer-delivery-worker-001"]
    });
    expect(sentBundles).toHaveLength(1);
    expect(sentBundles[0]?.bundle).toMatchObject({
      resourceType: "Bundle",
      id: "patient-document-patient-worker-001",
      type: "document"
    });

    const attempts = await dependencies.deliveryAttemptRepository.findByRecordTransferId(
      "record-transfer-worker-001"
    );
    expect(attempts[0]?.toSnapshot()).toMatchObject({
      status: "succeeded",
      completedAt: "2026-05-28T07:00:05.000Z",
      httpStatus: 201,
      responseBodyPreview: '{"resourceType":"OperationOutcome"}'
    });

    const transfer = await dependencies.recordTransferRepository.findById(
      "record-transfer-worker-001"
    );
    expect(transfer?.toSnapshot()).toMatchObject({
      status: "in-progress",
      sentAt: "2026-05-28T07:00:00.000Z"
    });

    const auditEvents = await dependencies.auditRepository.findByPatientId(
      "patient-worker-001"
    );
    expect(auditEvents[0]?.toSnapshot()).toMatchObject({
      actorId: "system:test-delivery-worker",
      action: "record-transfer.send",
      purposeOfUse: "OPERATIONS",
      metadata: expect.objectContaining({
        worker: "record-transfer-delivery-worker",
        deliveryStatus: "succeeded",
        httpStatus: 201,
        idempotencyKey: "wiiicare-record-transfer-worker-key"
      })
    });
  });

  it("marks the attempt and record transfer as failed when the endpoint rejects the Bundle", async () => {
    const dependencies = await createDeliveryWorkerDependencies({
      sender: {
        async send() {
          return {
            httpStatus: 503,
            responseBodyPreview: "Service unavailable"
          };
        }
      }
    });

    const result = await processQueuedRecordTransferDeliveries(dependencies, {
      checkedAt: new Date("2026-05-28T07:00:05.000Z"),
      retryDelayMs: 120_000,
      actorId: "system:test-delivery-worker"
    });

    expect(result).toMatchObject({
      queuedCount: 1,
      deliveredCount: 0,
      failedCount: 1,
      failedAttemptIds: ["record-transfer-delivery-worker-001"]
    });

    const attempts = await dependencies.deliveryAttemptRepository.findByRecordTransferId(
      "record-transfer-worker-001"
    );
    expect(attempts[0]?.toSnapshot()).toMatchObject({
      status: "failed",
      completedAt: "2026-05-28T07:00:05.000Z",
      httpStatus: 503,
      responseBodyPreview: "Service unavailable",
      errorMessage: "FHIR endpoint returned HTTP 503."
    });

    const transfer = await dependencies.recordTransferRepository.findById(
      "record-transfer-worker-001"
    );
    expect(transfer?.toSnapshot()).toMatchObject({
      status: "failed",
      failedAt: "2026-05-28T07:00:05.000Z",
      failureReason: "FHIR endpoint returned HTTP 503.",
      nextRetryAt: "2026-05-28T07:02:05.000Z"
    });

    const auditEvents = await dependencies.auditRepository.findByPatientId(
      "patient-worker-001"
    );
    expect(auditEvents[0]?.toSnapshot()).toMatchObject({
      action: "record-transfer.fail",
      purposeOfUse: "OPERATIONS",
      metadata: expect.objectContaining({
        worker: "record-transfer-delivery-worker",
        deliveryStatus: "failed",
        httpStatus: 503,
        nextRetryAt: "2026-05-28T07:02:05.000Z"
      })
    });
  });

  it("does not call the sender when production endpoint policy rejects the target endpoint", async () => {
    process.env.NODE_ENV = "production";
    let senderCalled = false;
    const dependencies = await createDeliveryWorkerDependencies({
      targetEndpointAddress: "http://localhost:8090/fhir",
      sender: {
        async send() {
          senderCalled = true;
          return {
            httpStatus: 200
          };
        }
      }
    });

    const result = await processQueuedRecordTransferDeliveries(dependencies, {
      checkedAt: new Date("2026-05-28T07:00:05.000Z"),
      retryDelayMs: 120_000,
      actorId: "system:test-delivery-worker"
    });

    expect(senderCalled).toBe(false);
    expect(result).toMatchObject({
      queuedCount: 1,
      deliveredCount: 0,
      failedCount: 1,
      failedAttemptIds: ["record-transfer-delivery-worker-001"]
    });

    const attempts = await dependencies.deliveryAttemptRepository.findByRecordTransferId(
      "record-transfer-worker-001"
    );
    expect(attempts[0]?.toSnapshot()).toMatchObject({
      status: "failed",
      completedAt: "2026-05-28T07:00:05.000Z",
      errorMessage:
        "Trong production, endpoint FHIR nhận hồ sơ bệnh án phải dùng HTTPS."
    });

    const transfer = await dependencies.recordTransferRepository.findById(
      "record-transfer-worker-001"
    );
    expect(transfer?.toSnapshot()).toMatchObject({
      status: "failed",
      failedAt: "2026-05-28T07:00:05.000Z",
      failureReason:
        "Trong production, endpoint FHIR nhận hồ sơ bệnh án phải dùng HTTPS.",
      nextRetryAt: "2026-05-28T07:02:05.000Z"
    });

    const auditEvents = await dependencies.auditRepository.findByPatientId(
      "patient-worker-001"
    );
    expect(auditEvents[0]?.toSnapshot()).toMatchObject({
      action: "record-transfer.fail",
      purposeOfUse: "OPERATIONS",
      metadata: expect.objectContaining({
        worker: "record-transfer-delivery-worker",
        deliveryStatus: "failed",
        errorMessage:
          "Trong production, endpoint FHIR nhận hồ sơ bệnh án phải dùng HTTPS."
      })
    });
  });
});

function restoreEnv(name: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[name];
    return;
  }

  process.env[name] = value;
}

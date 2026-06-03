import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  applyDefaultAuthBoundaryEnv,
  captureAuthBoundaryEnv,
  restoreAuthBoundaryEnv
} from "./server.auth.test-support.js";
import {
  getRecordTransferDeliveryAttempts,
  getRecordTransferFhirTask,
  readyRecordTransferDeliverySession,
  receiveRecordTransfer,
  sendRecordTransfer
} from "./server.record-transfer-delivery.test-support.js";

describe("API record-transfer delivery boundary", () => {
  let app: FastifyInstance;
  const originalEnv = captureAuthBoundaryEnv();

  beforeEach(() => {
    applyDefaultAuthBoundaryEnv();
  });

  afterEach(async () => {
    await app.close();
    restoreAuthBoundaryEnv(originalEnv);
  });

  it("moves a record transfer through sent and received milestones", async () => {
    const session = await readyRecordTransferDeliverySession();
    app = session.app;

    const sendResponse = await sendRecordTransfer(app, session.accessToken, {
      sentAt: "2026-05-28T04:00:00.000Z",
      note: "Xếp gói hồ sơ vào hàng chờ gửi qua gateway liên thông."
    });

    expect(sendResponse.statusCode).toBe(200);
    expect(sendResponse.json()).toMatchObject({
      id: "record-transfer-demo-001",
      status: "in-progress",
      sentAt: "2026-05-28T04:00:00.000Z"
    });

    const attemptsResponse = await getRecordTransferDeliveryAttempts(
      app,
      session.accessToken
    );

    expect(attemptsResponse.statusCode).toBe(200);
    expect(attemptsResponse.json()).toMatchObject({
      items: [
        {
          recordTransferId: "record-transfer-demo-001",
          patientId: "patient-demo-001",
          targetEndpointId: "endpoint-fhir-hai-phong-referral",
          targetEndpointAddress: "https://fhir.referral.demo.wiiicare.vn/fhir",
          bundleId: "patient-document-patient-demo-001",
          bundleType: "document",
          attemptNumber: 1,
          status: "queued",
          queuedAt: "2026-05-28T04:00:00.000Z",
          idempotencyKey: expect.stringMatching(/^wiiicare-record-transfer-[a-f0-9]{64}$/)
        }
      ]
    });

    const receiveResponse = await receiveRecordTransfer(app, session.accessToken, {
      receivedAt: "2026-05-28T04:15:00.000Z",
      note: "Bệnh viện nhận đã xác nhận tiếp nhận."
    });

    expect(receiveResponse.statusCode).toBe(200);
    expect(receiveResponse.json()).toMatchObject({
      id: "record-transfer-demo-001",
      status: "completed",
      sentAt: "2026-05-28T04:00:00.000Z",
      receivedAt: "2026-05-28T04:15:00.000Z",
      receivedByActorId: "practitioner-demo-001",
      acknowledgementReference: expect.stringMatching(
        /^wiiicare-record-transfer-ack-[a-f0-9]{32}$/
      )
    });

    const fhirResponse = await getRecordTransferFhirTask(
      app,
      session.accessToken
    );

    expect(fhirResponse.statusCode).toBe(200);
    expect(fhirResponse.json()).toMatchObject({
      resourceType: "Task",
      status: "completed",
      executionPeriod: {
        start: "2026-05-28T04:00:00.000Z",
        end: "2026-05-28T04:15:00.000Z"
      },
      note: expect.arrayContaining([
        {
          text: "Người xác nhận nhận hồ sơ: practitioner-demo-001"
        }
      ])
    });
  });
});

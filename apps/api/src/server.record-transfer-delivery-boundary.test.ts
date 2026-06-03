import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  applyDefaultAuthBoundaryEnv,
  captureAuthBoundaryEnv,
  FailingRecordTransferDeliveryAttemptRepository,
  jsonRequestHeaders,
  loginForToken,
  readyServer,
  restoreAuthBoundaryEnv,
  treatmentHeaders
} from "./server.auth.test-support.js";

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

  async function readyClinicianSession(
    options?: Parameters<typeof readyServer>[0]
  ): Promise<string> {
    app = await readyServer(options);
    return loginForToken(app, "practitioner-demo-001", "clinician");
  }

  it("moves a record transfer through sent and received milestones", async () => {
    const accessToken = await readyClinicianSession();

    const sendResponse = await app.inject({
      method: "POST",
      url: "/api/v1/record-transfers/record-transfer-demo-001/send",
      headers: jsonRequestHeaders(treatmentHeaders(accessToken)),
      payload: {
        sentAt: "2026-05-28T04:00:00.000Z",
        note: "Xếp gói hồ sơ vào hàng chờ gửi qua gateway liên thông."
      }
    });

    expect(sendResponse.statusCode).toBe(200);
    expect(sendResponse.json()).toMatchObject({
      id: "record-transfer-demo-001",
      status: "in-progress",
      sentAt: "2026-05-28T04:00:00.000Z"
    });

    const attemptsResponse = await app.inject({
      method: "GET",
      url: "/api/v1/record-transfers/record-transfer-demo-001/delivery-attempts",
      headers: treatmentHeaders(accessToken)
    });

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

    const receiveResponse = await app.inject({
      method: "POST",
      url: "/api/v1/record-transfers/record-transfer-demo-001/receive",
      headers: jsonRequestHeaders(treatmentHeaders(accessToken)),
      payload: {
        receivedAt: "2026-05-28T04:15:00.000Z",
        note: "Bệnh viện nhận đã xác nhận tiếp nhận."
      }
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

    const fhirResponse = await app.inject({
      method: "GET",
      url: "/api/v1/record-transfers/record-transfer-demo-001/fhir-task",
      headers: treatmentHeaders(accessToken)
    });

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

  it("rolls back a record transfer when queuing the delivery attempt fails", async () => {
    const accessToken = await readyClinicianSession({
      recordTransferDeliveryAttemptRepository:
        new FailingRecordTransferDeliveryAttemptRepository()
    });

    const sendResponse = await app.inject({
      method: "POST",
      url: "/api/v1/record-transfers/record-transfer-demo-001/send",
      headers: jsonRequestHeaders(treatmentHeaders(accessToken)),
      payload: {
        sentAt: "2026-05-28T04:00:00.000Z",
        note: "Giả lập lỗi kho lịch sử gửi để kiểm tra rollback."
      }
    });

    expect(sendResponse.statusCode).toBe(500);

    const transferListResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/record-transfers",
      headers: treatmentHeaders(accessToken)
    });
    const transferListBody = transferListResponse.json();

    expect(transferListResponse.statusCode).toBe(200);
    expect(transferListBody.items[0]).toMatchObject({
      id: "record-transfer-demo-001",
      status: "ready"
    });
    expect(transferListBody.items[0]).not.toHaveProperty("sentAt");
  });

  it("records failed record transfer delivery and prepares a retry", async () => {
    const accessToken = await readyClinicianSession();

    const sendResponse = await app.inject({
      method: "POST",
      url: "/api/v1/record-transfers/record-transfer-demo-001/send",
      headers: jsonRequestHeaders(treatmentHeaders(accessToken)),
      payload: {
        sentAt: "2026-05-28T05:00:00.000Z",
        note: "Xếp gói hồ sơ vào hàng chờ gửi qua gateway liên thông."
      }
    });

    expect(sendResponse.statusCode).toBe(200);

    const failResponse = await app.inject({
      method: "POST",
      url: "/api/v1/record-transfers/record-transfer-demo-001/fail",
      headers: jsonRequestHeaders(treatmentHeaders(accessToken)),
      payload: {
        failedAt: "2026-05-28T05:05:00.000Z",
        failureReason: "Recipient gateway unavailable.",
        nextRetryAt: "2026-05-28T05:20:00.000Z"
      }
    });

    expect(failResponse.statusCode, failResponse.body).toBe(200);
    expect(failResponse.json()).toMatchObject({
      id: "record-transfer-demo-001",
      status: "failed",
      failedAt: "2026-05-28T05:05:00.000Z",
      failureReason: "Recipient gateway unavailable.",
      nextRetryAt: "2026-05-28T05:20:00.000Z",
      retryCount: 0
    });

    const failedFhirResponse = await app.inject({
      method: "GET",
      url: "/api/v1/record-transfers/record-transfer-demo-001/fhir-task",
      headers: treatmentHeaders(accessToken)
    });

    expect(failedFhirResponse.statusCode).toBe(200);
    expect(failedFhirResponse.json()).toMatchObject({
      resourceType: "Task",
      status: "failed",
      note: expect.arrayContaining([
        expect.objectContaining({
          text: "Lý do lỗi chuyển hồ sơ: Recipient gateway unavailable."
        }),
        expect.objectContaining({
          text: "Hẹn thử gửi lại: 2026-05-28T05:20:00.000Z"
        })
      ])
    });

    const retryResponse = await app.inject({
      method: "POST",
      url: "/api/v1/record-transfers/record-transfer-demo-001/retry",
      headers: jsonRequestHeaders(treatmentHeaders(accessToken)),
      payload: {
        retryAt: "2026-05-28T05:20:00.000Z",
        note: "Đưa lại vào hàng đợi gửi khi gateway sẵn sàng."
      }
    });

    expect(retryResponse.statusCode).toBe(200);
    expect(retryResponse.json()).toMatchObject({
      id: "record-transfer-demo-001",
      status: "ready",
      retryCount: 1,
      note: "Đưa lại vào hàng đợi gửi khi gateway sẵn sàng."
    });
    expect(retryResponse.json()).not.toHaveProperty("sentAt");
    expect(retryResponse.json()).not.toHaveProperty("failedAt");
    expect(retryResponse.json()).not.toHaveProperty("failureReason");
    expect(retryResponse.json()).not.toHaveProperty("nextRetryAt");

    const resendResponse = await app.inject({
      method: "POST",
      url: "/api/v1/record-transfers/record-transfer-demo-001/send",
      headers: jsonRequestHeaders(treatmentHeaders(accessToken)),
      payload: {
        sentAt: "2026-05-28T05:25:00.000Z"
      }
    });

    expect(resendResponse.statusCode).toBe(200);
    expect(resendResponse.json()).toMatchObject({
      status: "in-progress",
      sentAt: "2026-05-28T05:25:00.000Z",
      retryCount: 1
    });

    const attemptsResponse = await app.inject({
      method: "GET",
      url: "/api/v1/record-transfers/record-transfer-demo-001/delivery-attempts",
      headers: treatmentHeaders(accessToken)
    });

    expect(attemptsResponse.statusCode).toBe(200);
    expect(attemptsResponse.json()).toMatchObject({
      items: [
        {
          attemptNumber: 1,
          queuedAt: "2026-05-28T05:00:00.000Z",
          status: "queued"
        },
        {
          attemptNumber: 2,
          queuedAt: "2026-05-28T05:25:00.000Z",
          status: "queued"
        }
      ]
    });
  });
});

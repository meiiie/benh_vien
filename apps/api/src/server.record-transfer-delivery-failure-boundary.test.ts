import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  applyDefaultAuthBoundaryEnv,
  captureAuthBoundaryEnv,
  restoreAuthBoundaryEnv
} from "./server.auth.test-support.js";
import {
  FailingRecordTransferDeliveryAttemptRepository,
  failRecordTransfer,
  getRecordTransferDeliveryAttempts,
  getRecordTransferFhirTask,
  listPatientRecordTransfers,
  readyRecordTransferDeliverySession,
  retryRecordTransfer,
  sendRecordTransfer
} from "./server.record-transfer-delivery.test-support.js";

describe("API record-transfer delivery failure boundary", () => {
  let app: FastifyInstance;
  const originalEnv = captureAuthBoundaryEnv();

  beforeEach(() => {
    applyDefaultAuthBoundaryEnv();
  });

  afterEach(async () => {
    await app.close();
    restoreAuthBoundaryEnv(originalEnv);
  });

  it("rolls back a record transfer when queuing the delivery attempt fails", async () => {
    const session = await readyRecordTransferDeliverySession({
      recordTransferDeliveryAttemptRepository:
        new FailingRecordTransferDeliveryAttemptRepository()
    });
    app = session.app;

    const sendResponse = await sendRecordTransfer(app, session.accessToken, {
      sentAt: "2026-05-28T04:00:00.000Z",
      note: "Giả lập lỗi kho lịch sử gửi để kiểm tra rollback."
    });

    expect(sendResponse.statusCode).toBe(500);

    const transferListResponse = await listPatientRecordTransfers(
      app,
      session.accessToken
    );
    const transferListBody = transferListResponse.json();

    expect(transferListResponse.statusCode).toBe(200);
    expect(transferListBody.items[0]).toMatchObject({
      id: "record-transfer-demo-001",
      status: "ready"
    });
    expect(transferListBody.items[0]).not.toHaveProperty("sentAt");
  });

  it("records failed record transfer delivery and prepares a retry", async () => {
    const session = await readyRecordTransferDeliverySession();
    app = session.app;

    const sendResponse = await sendRecordTransfer(app, session.accessToken, {
      sentAt: "2026-05-28T05:00:00.000Z",
      note: "Xếp gói hồ sơ vào hàng chờ gửi qua gateway liên thông."
    });

    expect(sendResponse.statusCode).toBe(200);

    const failResponse = await failRecordTransfer(app, session.accessToken, {
      failedAt: "2026-05-28T05:05:00.000Z",
      failureReason: "Recipient gateway unavailable.",
      nextRetryAt: "2026-05-28T05:20:00.000Z"
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

    const failedFhirResponse = await getRecordTransferFhirTask(
      app,
      session.accessToken
    );

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

    const retryResponse = await retryRecordTransfer(app, session.accessToken, {
      retryAt: "2026-05-28T05:20:00.000Z",
      note: "Đưa lại vào hàng đợi gửi khi gateway sẵn sàng."
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

    const resendResponse = await sendRecordTransfer(app, session.accessToken, {
      sentAt: "2026-05-28T05:25:00.000Z"
    });

    expect(resendResponse.statusCode).toBe(200);
    expect(resendResponse.json()).toMatchObject({
      status: "in-progress",
      sentAt: "2026-05-28T05:25:00.000Z",
      retryCount: 1
    });

    const attemptsResponse = await getRecordTransferDeliveryAttempts(
      app,
      session.accessToken
    );

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

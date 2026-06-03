import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  applyDefaultAuthBoundaryEnv,
  captureAuthBoundaryEnv,
  loginForToken,
  readyServer,
  recordTransferCallbackKeyIdHeader,
  recordTransferCallbackSignatureHeader,
  recordTransferCallbackTestKeyId,
  recordTransferCallbackTimestampHeader,
  restoreAuthBoundaryEnv,
  signedRecordTransferCallbackHeaders
} from "./server.auth.test-support.js";
import {
  buildRecordTransferAcknowledgementPayload,
  configureRecordTransferCallbackSecret,
  postRecordTransferAcknowledgementCallback,
  sendRecordTransferForCallback
} from "./server.record-transfer-callback.test-support.js";

describe("API record-transfer callback security boundary", () => {
  let app: FastifyInstance;
  const originalEnv = captureAuthBoundaryEnv();

  beforeEach(() => {
    applyDefaultAuthBoundaryEnv();
    configureRecordTransferCallbackSecret();
  });

  afterEach(async () => {
    await app.close();
    restoreAuthBoundaryEnv(originalEnv);
  });

  async function readySignedCallbackSession(): Promise<{
    readonly clinicianToken: string;
    readonly gatewayToken: string;
  }> {
    app = await readyServer();

    const clinicianToken = await loginForToken(
      app,
      "practitioner-demo-001",
      "clinician"
    );
    const gatewayToken = await loginForToken(
      app,
      "gateway-hai-phong-referral",
      "integration"
    );

    return { clinicianToken, gatewayToken };
  }

  it("requires a valid HMAC signature for acknowledgement callbacks when configured", async () => {
    const { clinicianToken, gatewayToken } = await readySignedCallbackSession();

    const sendResponse = await sendRecordTransferForCallback({
      app,
      clinicianToken,
      sentAt: "2026-05-28T06:00:00.000Z",
      note: "Queue the document package for the signed callback test."
    });

    expect(sendResponse.statusCode).toBe(200);

    const callbackPayload = buildRecordTransferAcknowledgementPayload({
      acknowledgementReference: "ack-record-transfer-callback-signed-001",
      receivedAt: new Date().toISOString(),
      deliveryIdempotencyKey: "wiiicare-record-transfer-callback-signed-test-001",
      note: "Recipient gateway acknowledged the signed callback."
    });

    const unsignedCallbackResponse = await postRecordTransferAcknowledgementCallback({
      app,
      token: gatewayToken,
      payload: callbackPayload,
      extraHeaders: {
        [recordTransferCallbackKeyIdHeader]: recordTransferCallbackTestKeyId
      }
    });

    expect(unsignedCallbackResponse.statusCode).toBe(403);
    expect(unsignedCallbackResponse.json()).toMatchObject({
      error: "RECORD_TRANSFER_CALLBACK_SIGNATURE_REQUIRED",
      permission: "record-transfer:acknowledge",
      requestId: expect.any(String)
    });

    const invalidSignatureResponse = await postRecordTransferAcknowledgementCallback({
      app,
      token: gatewayToken,
      payload: callbackPayload,
      extraHeaders: {
        [recordTransferCallbackKeyIdHeader]: recordTransferCallbackTestKeyId,
        [recordTransferCallbackTimestampHeader]: new Date().toISOString(),
        [recordTransferCallbackSignatureHeader]: "invalid-signature"
      }
    });

    expect(invalidSignatureResponse.statusCode).toBe(403);
    expect(invalidSignatureResponse.json()).toMatchObject({
      error: "RECORD_TRANSFER_CALLBACK_SIGNATURE_INVALID",
      permission: "record-transfer:acknowledge",
      requestId: expect.any(String)
    });

    const signedCallbackResponse = await postRecordTransferAcknowledgementCallback({
      app,
      token: gatewayToken,
      payload: callbackPayload,
      extraHeaders: signedRecordTransferCallbackHeaders({
        recordTransferId: "record-transfer-demo-001",
        body: callbackPayload
      })
    });

    expect(signedCallbackResponse.statusCode).toBe(200);
    expect(signedCallbackResponse.json()).toMatchObject({
      status: "completed",
      receivedByActorId: "system-hai-phong-referral-gateway",
      acknowledgementReference: "ack-record-transfer-callback-signed-001"
    });
  });
});

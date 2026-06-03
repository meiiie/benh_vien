import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  applyDefaultAuthBoundaryEnv,
  captureAuthBoundaryEnv,
  jsonRequestHeaders,
  loginForToken,
  operationsHeaders,
  readyServer,
  recordTransferCallbackKeyIdHeader,
  recordTransferCallbackSignatureHeader,
  recordTransferCallbackTestKeyId,
  recordTransferCallbackTestSecret,
  recordTransferCallbackTimestampHeader,
  restoreAuthBoundaryEnv,
  signedRecordTransferCallbackHeaders,
  treatmentHeaders
} from "./server.auth.test-support.js";

const recordTransferAcknowledgementCallbackUrl =
  "/api/v1/record-transfers/record-transfer-demo-001/acknowledgement-callback";

describe("API record-transfer callback boundary", () => {
  let app: FastifyInstance;
  const originalEnv = captureAuthBoundaryEnv();

  beforeEach(() => {
    applyDefaultAuthBoundaryEnv();
  });

  afterEach(async () => {
    await app.close();
    restoreAuthBoundaryEnv(originalEnv);
  });

  async function readyClinicianSession(): Promise<string> {
    app = await readyServer();
    return loginForToken(app, "practitioner-demo-001", "clinician");
  }

  it("accepts an operations acknowledgement callback for a sent record transfer", async () => {
    const clinicianToken = await readyClinicianSession();
    const gatewayToken = await loginForToken(
      app,
      "gateway-hai-phong-referral",
      "integration"
    );

    const gatewayPatientListResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients",
      headers: operationsHeaders(gatewayToken)
    });

    expect(gatewayPatientListResponse.statusCode).toBe(403);
    expect(gatewayPatientListResponse.json()).toMatchObject({
      error: "FORBIDDEN",
      permission: "patient:list"
    });

    const sendResponse = await app.inject({
      method: "POST",
      url: "/api/v1/record-transfers/record-transfer-demo-001/send",
      headers: jsonRequestHeaders(treatmentHeaders(clinicianToken)),
      payload: {
        sentAt: "2026-05-28T04:30:00.000Z",
        note: "Queue the document package for the interoperability gateway."
      }
    });

    expect(sendResponse.statusCode).toBe(200);

    const deniedCallbackResponse = await app.inject({
      method: "POST",
      url: recordTransferAcknowledgementCallbackUrl,
      headers: jsonRequestHeaders(operationsHeaders(clinicianToken)),
      payload: {
        recipientOrganizationId: "hospital-hai-phong-referral",
        acknowledgementReference: "ack-denied-from-source-organization",
        receivedAt: "2026-05-28T04:45:00.000Z"
      }
    });

    expect(deniedCallbackResponse.statusCode).toBe(403);
    expect(deniedCallbackResponse.json()).toMatchObject({
      error: "FORBIDDEN",
      permission: "record-transfer:acknowledge",
      requestId: expect.any(String)
    });

    const callbackPayload = {
      recipientOrganizationId: "hospital-hai-phong-referral",
      acknowledgementReference: "ack-record-transfer-callback-001",
      receivedAt: "2026-05-28T04:45:00.000Z",
      receivedByActorId: "system-hai-phong-referral-gateway",
      targetEndpointId: "endpoint-fhir-hai-phong-referral",
      deliveryIdempotencyKey: "wiiicare-record-transfer-callback-test-001",
      note: "Recipient gateway acknowledged the transferred document package."
    };

    const callbackResponse = await app.inject({
      method: "POST",
      url: recordTransferAcknowledgementCallbackUrl,
      headers: jsonRequestHeaders(operationsHeaders(gatewayToken)),
      payload: callbackPayload
    });

    expect(callbackResponse.statusCode).toBe(200);
    expect(callbackResponse.json()).toMatchObject({
      id: "record-transfer-demo-001",
      status: "completed",
      sentAt: "2026-05-28T04:30:00.000Z",
      receivedAt: "2026-05-28T04:45:00.000Z",
      receivedByActorId: "system-hai-phong-referral-gateway",
      acknowledgementReference: "ack-record-transfer-callback-001"
    });

    const duplicateCallbackResponse = await app.inject({
      method: "POST",
      url: recordTransferAcknowledgementCallbackUrl,
      headers: jsonRequestHeaders(operationsHeaders(gatewayToken)),
      payload: callbackPayload
    });

    expect(duplicateCallbackResponse.statusCode).toBe(200);
    expect(duplicateCallbackResponse.json()).toMatchObject({
      status: "completed",
      acknowledgementReference: "ack-record-transfer-callback-001"
    });

    const fhirResponse = await app.inject({
      method: "GET",
      url: "/api/v1/record-transfers/record-transfer-demo-001/fhir-task",
      headers: treatmentHeaders(clinicianToken)
    });

    expect(fhirResponse.statusCode).toBe(200);
    expect(fhirResponse.json()).toMatchObject({
      resourceType: "Task",
      status: "completed",
      note: expect.arrayContaining([
        {
          text: "Bi\u00ean nh\u1eadn ti\u1ebfp nh\u1eadn: ack-record-transfer-callback-001"
        }
      ])
    });
  });

  it("requires a valid HMAC signature for acknowledgement callbacks when configured", async () => {
    process.env.BVS_RECORD_TRANSFER_CALLBACK_SECRETS_JSON = JSON.stringify({
      [recordTransferCallbackTestKeyId]: recordTransferCallbackTestSecret
    });
    const clinicianToken = await readyClinicianSession();
    const gatewayToken = await loginForToken(
      app,
      "gateway-hai-phong-referral",
      "integration"
    );

    const sendResponse = await app.inject({
      method: "POST",
      url: "/api/v1/record-transfers/record-transfer-demo-001/send",
      headers: jsonRequestHeaders(treatmentHeaders(clinicianToken)),
      payload: {
        sentAt: "2026-05-28T06:00:00.000Z",
        note: "Queue the document package for the signed callback test."
      }
    });

    expect(sendResponse.statusCode).toBe(200);

    const callbackPayload = {
      recipientOrganizationId: "hospital-hai-phong-referral",
      acknowledgementReference: "ack-record-transfer-callback-signed-001",
      receivedAt: new Date().toISOString(),
      receivedByActorId: "system-hai-phong-referral-gateway",
      targetEndpointId: "endpoint-fhir-hai-phong-referral",
      deliveryIdempotencyKey: "wiiicare-record-transfer-callback-signed-test-001",
      note: "Recipient gateway acknowledged the signed callback."
    };

    const unsignedCallbackResponse = await app.inject({
      method: "POST",
      url: recordTransferAcknowledgementCallbackUrl,
      headers: {
        ...jsonRequestHeaders(operationsHeaders(gatewayToken)),
        [recordTransferCallbackKeyIdHeader]: recordTransferCallbackTestKeyId
      },
      payload: callbackPayload
    });

    expect(unsignedCallbackResponse.statusCode).toBe(403);
    expect(unsignedCallbackResponse.json()).toMatchObject({
      error: "RECORD_TRANSFER_CALLBACK_SIGNATURE_REQUIRED",
      permission: "record-transfer:acknowledge",
      requestId: expect.any(String)
    });

    const invalidTimestamp = new Date().toISOString();
    const invalidSignatureResponse = await app.inject({
      method: "POST",
      url: recordTransferAcknowledgementCallbackUrl,
      headers: {
        ...jsonRequestHeaders(operationsHeaders(gatewayToken)),
        [recordTransferCallbackKeyIdHeader]: recordTransferCallbackTestKeyId,
        [recordTransferCallbackTimestampHeader]: invalidTimestamp,
        [recordTransferCallbackSignatureHeader]: "invalid-signature"
      },
      payload: callbackPayload
    });

    expect(invalidSignatureResponse.statusCode).toBe(403);
    expect(invalidSignatureResponse.json()).toMatchObject({
      error: "RECORD_TRANSFER_CALLBACK_SIGNATURE_INVALID",
      permission: "record-transfer:acknowledge",
      requestId: expect.any(String)
    });

    const signedCallbackResponse = await app.inject({
      method: "POST",
      url: recordTransferAcknowledgementCallbackUrl,
      headers: {
        ...jsonRequestHeaders(operationsHeaders(gatewayToken)),
        ...signedRecordTransferCallbackHeaders({
          recordTransferId: "record-transfer-demo-001",
          body: callbackPayload
        })
      },
      payload: callbackPayload
    });

    expect(signedCallbackResponse.statusCode).toBe(200);
    expect(signedCallbackResponse.json()).toMatchObject({
      status: "completed",
      receivedByActorId: "system-hai-phong-referral-gateway",
      acknowledgementReference: "ack-record-transfer-callback-signed-001"
    });
  });
});

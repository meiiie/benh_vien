import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  applyDefaultAuthBoundaryEnv,
  captureAuthBoundaryEnv,
  loginForToken,
  operationsHeaders,
  readyServer,
  restoreAuthBoundaryEnv,
  treatmentHeaders
} from "./server.auth.test-support.js";
import {
  buildRecordTransferAcknowledgementPayload,
  postRecordTransferAcknowledgementCallback,
  sendRecordTransferForCallback
} from "./server.record-transfer-callback.test-support.js";

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

    const sendResponse = await sendRecordTransferForCallback({
      app,
      clinicianToken,
      sentAt: "2026-05-28T04:30:00.000Z",
      note: "Queue the document package for the interoperability gateway."
    });

    expect(sendResponse.statusCode).toBe(200);

    const deniedCallbackResponse = await postRecordTransferAcknowledgementCallback({
      app,
      token: clinicianToken,
      payload: buildRecordTransferAcknowledgementPayload({
        acknowledgementReference: "ack-denied-from-source-organization"
      })
    });

    expect(deniedCallbackResponse.statusCode).toBe(403);
    expect(deniedCallbackResponse.json()).toMatchObject({
      error: "FORBIDDEN",
      permission: "record-transfer:acknowledge",
      requestId: expect.any(String)
    });

    const callbackPayload = buildRecordTransferAcknowledgementPayload();

    const callbackResponse = await postRecordTransferAcknowledgementCallback({
      app,
      token: gatewayToken,
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

    const duplicateCallbackResponse = await postRecordTransferAcknowledgementCallback({
      app,
      token: gatewayToken,
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
});

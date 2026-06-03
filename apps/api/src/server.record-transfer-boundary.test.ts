import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  applyDefaultAuthBoundaryEnv,
  captureAuthBoundaryEnv,
  expectOperationOutcome,
  FailingRecordTransferDeliveryAttemptRepository,
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

describe("API record-transfer boundary", () => {
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

  it("lists record transfer packages for a patient", async () => {
    const accessToken = await readyClinicianSession();

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/record-transfers",
      headers: treatmentHeaders(accessToken)
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.items).toHaveLength(1);
    expect(body.items[0]).toMatchObject({
      id: "record-transfer-demo-001",
      patientId: "patient-demo-001",
      status: "ready",
      bundleType: "document",
      bundleId: "patient-document-patient-demo-001",
      recipientOrganizationId: "hospital-hai-phong-referral",
      consentReference: "consent-demo-transfer-001"
    });
  });

  it("creates a record transfer package and exports it as FHIR Task", async () => {
    const accessToken = await readyClinicianSession();

    const createResponse = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/record-transfers",
      headers: jsonRequestHeaders(treatmentHeaders(accessToken)),
      payload: {
        priority: "urgent",
        bundleType: "document",
        sourceOrganizationId: "hospital-hai-phong-demo",
        recipientOrganizationId: "hospital-hai-phong-referral",
        consentReference: "consent-demo-transfer-001",
        reason: "Chuyển tuyến theo dõi chuyên khoa tim mạch.",
        requestedAt: "2026-05-28T03:00:00.000Z"
      }
    });
    const createdTransfer = createResponse.json();

    expect(createResponse.statusCode).toBe(201);
    expect(createdTransfer.id).toEqual(expect.stringMatching(/^record-transfer-/));
    expect(createdTransfer).toMatchObject({
      bundleId: "patient-document-patient-demo-001",
      requestedByActorId: "practitioner-demo-001"
    });

    const fhirResponse = await app.inject({
      method: "GET",
      url: `/api/v1/record-transfers/${createdTransfer.id}/fhir-task`,
      headers: treatmentHeaders(accessToken)
    });

    expect(fhirResponse.statusCode).toBe(200);
    expect(fhirResponse.json()).toMatchObject({
      resourceType: "Task",
      status: "requested",
      focus: {
        reference: "Bundle/patient-document-patient-demo-001"
      },
      for: {
        reference: "Patient/patient-demo-001"
      },
      owner: {
        reference: "Organization/hospital-hai-phong-referral"
      }
    });
  });

  it("rejects creating a record transfer directly in the dead-lettered state", async () => {
    const accessToken = await readyClinicianSession();

    const response = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/record-transfers",
      headers: jsonRequestHeaders(treatmentHeaders(accessToken)),
      payload: {
        status: "dead-lettered",
        priority: "urgent",
        bundleType: "document",
        sourceOrganizationId: "hospital-hai-phong-demo",
        recipientOrganizationId: "hospital-hai-phong-referral",
        consentReference: "consent-demo-transfer-001",
        reason: "Không cho client tạo trực tiếp trạng thái lỗi cuối.",
        requestedAt: "2026-05-28T03:00:00.000Z",
        sentAt: "2026-05-28T03:05:00.000Z",
        failedAt: "2026-05-28T03:10:00.000Z"
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: "VALIDATION_ERROR"
    });
  });

  it("keeps JSON and FHIR not-found errors separate for record transfers", async () => {
    const accessToken = await readyClinicianSession();

    const jsonResponse = await app.inject({
      method: "GET",
      url: "/api/v1/record-transfers/record-transfer-missing",
      headers: {
        ...treatmentHeaders(accessToken),
        "x-request-id": "record-transfer-json-not-found-001"
      }
    });

    expect(jsonResponse.statusCode).toBe(404);
    expect(String(jsonResponse.headers["content-type"])).toContain("application/json");
    expect(jsonResponse.json()).toMatchObject({
      error: "RECORD_TRANSFER_NOT_FOUND",
      message: "Không tìm thấy yêu cầu chuyển hồ sơ.",
      requestId: "record-transfer-json-not-found-001"
    });

    const fhirResponse = await app.inject({
      method: "GET",
      url: "/api/v1/record-transfers/record-transfer-missing/fhir-task",
      headers: treatmentHeaders(accessToken)
    });

    expectOperationOutcome(fhirResponse, {
      statusCode: 404,
      code: "not-found",
      detailsCode: "RECORD_TRANSFER_NOT_FOUND"
    });
  });

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
        note: "Xếp gói hồ sơ vào hàng chờ gửi qua gateway liên thông."
      }
    });

    expect(sendResponse.statusCode).toBe(200);

    const deniedCallbackResponse = await app.inject({
      method: "POST",
      url: "/api/v1/record-transfers/record-transfer-demo-001/acknowledgement-callback",
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
      note: "Bệnh viện nhận xác nhận tiếp nhận qua callback liên thông."
    };

    const callbackResponse = await app.inject({
      method: "POST",
      url: "/api/v1/record-transfers/record-transfer-demo-001/acknowledgement-callback",
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
      url: "/api/v1/record-transfers/record-transfer-demo-001/acknowledgement-callback",
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
          text: "Biên nhận tiếp nhận: ack-record-transfer-callback-001"
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
        note: "Xếp gói hồ sơ vào hàng chờ gửi qua gateway liên thông."
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
      note: "Bệnh viện nhận xác nhận tiếp nhận qua callback đã ký."
    };

    const unsignedCallbackResponse = await app.inject({
      method: "POST",
      url: "/api/v1/record-transfers/record-transfer-demo-001/acknowledgement-callback",
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
      url: "/api/v1/record-transfers/record-transfer-demo-001/acknowledgement-callback",
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
      url: "/api/v1/record-transfers/record-transfer-demo-001/acknowledgement-callback",
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

  it("denies record transfer creation when consent does not cover the recipient", async () => {
    const accessToken = await readyClinicianSession();

    const response = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/record-transfers",
      headers: jsonRequestHeaders(treatmentHeaders(accessToken)),
      payload: {
        bundleType: "document",
        sourceOrganizationId: "hospital-hai-phong-demo",
        recipientOrganizationId: "hospital-not-covered",
        consentReference: "consent-demo-transfer-001",
        reason: "Thử gửi sai đơn vị nhận."
      }
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({
      error: "CONSENT_DOES_NOT_ALLOW_RECORD_TRANSFER",
      requestId: expect.any(String)
    });
  });

  it("requires a recipient FHIR Bundle endpoint before creating a record transfer", async () => {
    const accessToken = await readyClinicianSession();

    const consentResponse = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/consents",
      headers: jsonRequestHeaders(treatmentHeaders(accessToken)),
      payload: {
        category: "record-sharing",
        granteeOrganizationId: "department-laboratory",
        validFrom: "2026-05-28T00:00:00.000Z",
        validUntil: "2026-12-31T23:59:59.000Z"
      }
    });
    expect(consentResponse.statusCode).toBe(201);

    const response = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/record-transfers",
      headers: jsonRequestHeaders(treatmentHeaders(accessToken)),
      payload: {
        bundleType: "document",
        sourceOrganizationId: "hospital-hai-phong-demo",
        recipientOrganizationId: "department-laboratory",
        consentReference: consentResponse.json().id,
        reason: "Thử chuyển hồ sơ tới đơn vị chưa có FHIR Bundle endpoint."
      }
    });

    expect(response.statusCode).toBe(422);
    expect(response.json()).toMatchObject({
      error: "RECORD_TRANSFER_ENDPOINT_NOT_FOUND",
      requestId: expect.any(String)
    });
  });

  it("requires transfer context before exporting a patient-record FHIR Bundle", async () => {
    const accessToken = await readyClinicianSession();

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/fhir-bundle",
      headers: treatmentHeaders(accessToken)
    });

    expectOperationOutcome(response, {
      statusCode: 400,
      code: "required",
      detailsCode: "MISSING_BUNDLE_TRANSFER_CONTEXT"
    });
  });

  it("denies Bundle export when consent does not match the recipient", async () => {
    const accessToken = await readyClinicianSession();

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/fhir-bundle",
      headers: {
        ...treatmentHeaders(accessToken),
        "x-consent-reference": "consent-demo-transfer-001",
        "x-recipient-organization-id": "hospital-not-covered"
      }
    });

    expectOperationOutcome(response, {
      statusCode: 403,
      code: "suppressed",
      detailsCode: "CONSENT_NOT_VALID_FOR_TRANSFER"
    });
  });
});

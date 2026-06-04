import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  applyDefaultAuthBoundaryEnv,
  captureAuthBoundaryEnv,
  expectOperationOutcome,
  jsonRequestHeaders,
  loginForToken,
  readyServer,
  restoreAuthBoundaryEnv,
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

});

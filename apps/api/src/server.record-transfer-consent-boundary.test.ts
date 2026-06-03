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

describe("API record-transfer consent boundary", () => {
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

import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  applyDefaultAuthBoundaryEnv,
  auditHeaders,
  captureAuthBoundaryEnv,
  expectOperationOutcome,
  loginForToken,
  readyServer,
  restoreAuthBoundaryEnv
} from "./server.auth.test-support.js";

describe("API auth purpose-of-use boundary", () => {
  let app: FastifyInstance;
  const originalEnv = captureAuthBoundaryEnv();

  beforeEach(() => {
    applyDefaultAuthBoundaryEnv();
  });

  afterEach(async () => {
    await app.close();
    restoreAuthBoundaryEnv(originalEnv);
  });

  it("rejects invalid purpose-of-use headers instead of silently defaulting to treatment", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const jsonResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients",
      headers: {
        authorization: `Bearer ${accessToken}`,
        "x-purpose-of-use": "BREAK_GLASS",
        "x-request-id": "invalid-purpose-json-001"
      }
    });
    const fhirResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/fhir",
      headers: {
        authorization: `Bearer ${accessToken}`,
        accept: "application/fhir+json",
        "x-purpose-of-use": "BREAK_GLASS",
        "x-request-id": "invalid-purpose-fhir-001"
      }
    });

    expect(jsonResponse.statusCode).toBe(400);
    expect(jsonResponse.json()).toMatchObject({
      error: "INVALID_PURPOSE_OF_USE",
      requestId: "invalid-purpose-json-001",
      allowedPurposeOfUse: ["TREATMENT", "AUDIT", "OPERATIONS"]
    });
    expectOperationOutcome(fhirResponse, {
      statusCode: 400,
      code: "invalid",
      detailsCode: "INVALID_PURPOSE_OF_USE"
    });

    const auditorToken = await loginForToken(app, "security-officer-demo", "auditor");
    const auditResponse = await app.inject({
      method: "GET",
      url: "/api/v1/audit-events?limit=25",
      headers: auditHeaders(auditorToken)
    });
    const auditBody = auditResponse.json();
    const jsonDeniedAuditEvent = auditBody.items.find(
      (event: { readonly metadata?: { readonly requestId?: string } }) =>
        event.metadata?.requestId === "invalid-purpose-json-001"
    );
    const fhirDeniedAuditEvent = auditBody.items.find(
      (event: { readonly metadata?: { readonly requestId?: string } }) =>
        event.metadata?.requestId === "invalid-purpose-fhir-001"
    );

    expect(auditResponse.statusCode).toBe(200);
    expect(jsonDeniedAuditEvent).toMatchObject({
      action: "access.denied",
      resourceType: "AuditEvent",
      resourceId: "x-purpose-of-use",
      purposeOfUse: "OPERATIONS",
      metadata: expect.objectContaining({
        denialCode: "INVALID_PURPOSE_OF_USE",
        deniedActorId: "practitioner-demo-001",
        deniedActorRole: "clinician",
        deniedActorPurposeOfUse: "INVALID",
        rejectedHeader: "x-purpose-of-use",
        route: "GET /api/v1/patients",
        statusCode: 400
      })
    });
    expect(fhirDeniedAuditEvent).toMatchObject({
      action: "access.denied",
      resourceType: "AuditEvent",
      resourceId: "x-purpose-of-use",
      purposeOfUse: "OPERATIONS",
      metadata: expect.objectContaining({
        denialCode: "INVALID_PURPOSE_OF_USE",
        deniedActorId: "practitioner-demo-001",
        deniedActorRole: "clinician",
        deniedActorPurposeOfUse: "INVALID",
        rejectedHeader: "x-purpose-of-use",
        route: "GET /api/v1/patients/patient-demo-001/fhir",
        statusCode: 400
      })
    });
  });
});

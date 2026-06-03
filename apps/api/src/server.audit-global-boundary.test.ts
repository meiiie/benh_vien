import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  captureAuthBoundaryEnv,
  restoreAuthBoundaryEnv
} from "./server.auth.test-support.js";
import {
  type AuditTestContext,
  auditPurposeHeaders,
  findAuditEventByRequestId,
  loginAuditTestToken,
  readyAuditTestContext,
  tokenTreatmentRequestIdHeaders
} from "./server.audit.test-support.js";

describe("API global audit boundary", () => {
  let context: AuditTestContext | undefined;
  const originalEnv = captureAuthBoundaryEnv();

  beforeEach(async () => {
    context = await readyAuditTestContext();
  });

  afterEach(async () => {
    if (context) {
      await context.app.close();
      context = undefined;
    }

    restoreAuthBoundaryEnv(originalEnv);
  });

  it("allows auditor audit-purpose review of global security audit events", async () => {
    const clinicianToken = await loginAuditTestToken(
      context!,
      "practitioner-demo-001",
      "clinician"
    );

    const forbiddenAuditListResponse = await context!.app.inject({
      method: "GET",
      url: "/api/v1/audit-events",
      headers: tokenTreatmentRequestIdHeaders(
        clinicianToken,
        "global-audit-clinician-denied-001"
      )
    });

    expect(forbiddenAuditListResponse.statusCode).toBe(403);
    expect(forbiddenAuditListResponse.json()).toMatchObject({
      error: "FORBIDDEN",
      permission: "audit-event:list",
      requestId: "global-audit-clinician-denied-001"
    });

    const deniedResponse = await context!.app.inject({
      method: "GET",
      url: "/api/v1/patients",
      headers: tokenTreatmentRequestIdHeaders(
        context!.accessToken,
        "global-audit-denied-001"
      )
    });

    expect(deniedResponse.statusCode).toBe(403);
    expect(deniedResponse.json()).toMatchObject({
      error: "FORBIDDEN",
      permission: "patient:list",
      requestId: "global-audit-denied-001"
    });

    const auditResponse = await context!.app.inject({
      method: "GET",
      url: "/api/v1/audit-events?limit=25",
      headers: auditPurposeHeaders(context!)
    });
    const deniedAuditEvent = findAuditEventByRequestId(
      auditResponse.json().items,
      "global-audit-denied-001"
    );

    expect(auditResponse.statusCode).toBe(200);
    expect(deniedAuditEvent).toMatchObject({
      action: "access.denied",
      resourceType: "Patient",
      resourceId: "patient:list",
      metadata: expect.objectContaining({
        denialCode: "FORBIDDEN",
        deniedPermission: "patient:list",
        deniedActorId: "security-officer-demo",
        deniedActorRole: "auditor",
        deniedActorPurposeOfUse: "TREATMENT",
        route: "GET /api/v1/patients",
        statusCode: 403
      })
    });
    expect(deniedAuditEvent?.patientId).toBeUndefined();
  });
});

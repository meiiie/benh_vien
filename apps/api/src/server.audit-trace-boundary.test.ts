import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  captureAuthBoundaryEnv,
  restoreAuthBoundaryEnv
} from "./server.auth.test-support.js";
import {
  type AuditTestContext,
  auditPurposeHeaders,
  loginAuditTestToken,
  readyAuditTestContext,
  tokenTreatmentRequestIdHeaders
} from "./server.audit.test-support.js";

describe("API audit trace boundary", () => {
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

  it("stores request id in audit metadata for clinical access", async () => {
    const clinicianToken = await loginAuditTestToken(
      context!,
      "practitioner-demo-001",
      "clinician"
    );

    const readResponse = await context!.app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001",
      headers: tokenTreatmentRequestIdHeaders(
        clinicianToken,
        "audit-trace-demo-001"
      )
    });
    expect(readResponse.statusCode).toBe(200);

    const auditResponse = await context!.app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/audit-events",
      headers: auditPurposeHeaders(context!)
    });
    const body = auditResponse.json();

    expect(auditResponse.statusCode).toBe(200);
    expect(body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          action: "patient.read",
          metadata: expect.objectContaining({
            requestId: "audit-trace-demo-001"
          })
        })
      ])
    );
  });
});

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  captureAuthBoundaryEnv,
  restoreAuthBoundaryEnv
} from "./server.auth.test-support.js";
import {
  type AuditTestContext,
  auditJsonHeaders,
  auditPurposeHeaders,
  readyAuditTestContext,
  treatmentRequestIdHeaders
} from "./server.audit.test-support.js";

describe("API audit boundary", () => {
  let context: AuditTestContext | undefined;
  const originalEnv = captureAuthBoundaryEnv();

  beforeEach(async () => {
    context = await readyAuditTestContext("security-officer-demo", "auditor");
  });

  afterEach(async () => {
    if (context) {
      await context.app.close();
      context = undefined;
    }

    restoreAuthBoundaryEnv(originalEnv);
  });

  it("allows auditor audit-purpose patient registry context", async () => {
    const response = await context!.app.inject({
      method: "GET",
      url: "/api/v1/patients",
      headers: auditPurposeHeaders(context!)
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.items).toHaveLength(1);
    expect(body.items[0]).toMatchObject({
      id: "patient-demo-001"
    });
  });

  it("denies auditor treatment-purpose patient registry context", async () => {
    const response = await context!.app.inject({
      method: "GET",
      url: "/api/v1/patients",
      headers: treatmentRequestIdHeaders(
        context!,
        "access-forbidden-auditor-treatment-001"
      )
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({
      error: "FORBIDDEN",
      permission: "patient:list",
      requestId: "access-forbidden-auditor-treatment-001"
    });
  });

  it("denies auditor attempts to create clinical data", async () => {
    const response = await context!.app.inject({
      method: "POST",
      url: "/api/v1/patients",
      headers: auditJsonHeaders(context!),
      payload: {
        identifiers: [
          {
            system: "urn:benh-vien-so:mrn",
            value: "MRN-DENIED-TEST",
            type: "hospital-mrn"
          }
        ],
        fullName: "RBAC Denied",
        managingOrganizationId: "hospital-hai-phong-demo"
      }
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({
      error: "FORBIDDEN",
      permission: "patient:create"
    });
  });

  it("allows auditor audit-purpose access to patient audit events", async () => {
    const response = await context!.app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/audit-events",
      headers: auditPurposeHeaders(context!)
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      items: expect.any(Array)
    });
  });
});

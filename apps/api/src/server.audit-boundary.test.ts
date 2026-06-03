import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  applyDefaultAuthBoundaryEnv,
  auditHeaders,
  captureAuthBoundaryEnv,
  jsonRequestHeaders,
  loginForToken,
  readyServer,
  requestIdHeaders,
  restoreAuthBoundaryEnv,
  treatmentHeaders
} from "./server.auth.test-support.js";

describe("API audit boundary", () => {
  let app: FastifyInstance | undefined;
  const originalEnv = captureAuthBoundaryEnv();

  beforeEach(() => {
    applyDefaultAuthBoundaryEnv();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
      app = undefined;
    }

    restoreAuthBoundaryEnv(originalEnv);
  });

  it("allows auditor audit-purpose patient registry context", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "security-officer-demo", "auditor");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients",
      headers: auditHeaders(accessToken)
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.items).toHaveLength(1);
    expect(body.items[0]).toMatchObject({
      id: "patient-demo-001"
    });
  });

  it("denies auditor treatment-purpose patient registry context", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "security-officer-demo", "auditor");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients",
      headers: requestIdHeaders(
        treatmentHeaders(accessToken),
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
    app = await readyServer();
    const accessToken = await loginForToken(app, "security-officer-demo", "auditor");

    const response = await app.inject({
      method: "POST",
      url: "/api/v1/patients",
      headers: jsonRequestHeaders(auditHeaders(accessToken)),
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
    app = await readyServer();
    const accessToken = await loginForToken(app, "security-officer-demo", "auditor");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/audit-events",
      headers: auditHeaders(accessToken)
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      items: expect.any(Array)
    });
  });

  it("allows auditor audit-purpose review of global security audit events", async () => {
    app = await readyServer();
    const clinicianToken = await loginForToken(app, "practitioner-demo-001", "clinician");
    const auditorToken = await loginForToken(app, "security-officer-demo", "auditor");

    const forbiddenAuditListResponse = await app.inject({
      method: "GET",
      url: "/api/v1/audit-events",
      headers: requestIdHeaders(
        treatmentHeaders(clinicianToken),
        "global-audit-clinician-denied-001"
      )
    });

    expect(forbiddenAuditListResponse.statusCode).toBe(403);
    expect(forbiddenAuditListResponse.json()).toMatchObject({
      error: "FORBIDDEN",
      permission: "audit-event:list",
      requestId: "global-audit-clinician-denied-001"
    });

    const deniedResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients",
      headers: requestIdHeaders(
        treatmentHeaders(auditorToken),
        "global-audit-denied-001"
      )
    });

    expect(deniedResponse.statusCode).toBe(403);
    expect(deniedResponse.json()).toMatchObject({
      error: "FORBIDDEN",
      permission: "patient:list",
      requestId: "global-audit-denied-001"
    });

    const auditResponse = await app.inject({
      method: "GET",
      url: "/api/v1/audit-events?limit=25",
      headers: auditHeaders(auditorToken)
    });
    const auditBody = auditResponse.json();
    const deniedAuditEvent = auditBody.items.find(
      (event: { readonly metadata?: { readonly requestId?: string } }) =>
        event.metadata?.requestId === "global-audit-denied-001"
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
    expect(deniedAuditEvent.patientId).toBeUndefined();
  });

  it("stores request id in audit metadata for clinical access", async () => {
    app = await readyServer();
    const clinicianToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const readResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001",
      headers: requestIdHeaders(
        treatmentHeaders(clinicianToken),
        "audit-trace-demo-001"
      )
    });
    expect(readResponse.statusCode).toBe(200);

    const auditorToken = await loginForToken(app, "security-officer-demo", "auditor");
    const auditResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/audit-events",
      headers: auditHeaders(auditorToken)
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

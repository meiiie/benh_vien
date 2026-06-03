import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  applyDefaultAuthBoundaryEnv,
  auditHeaders,
  captureAuthBoundaryEnv,
  expectOperationOutcome,
  jsonRequestHeaders,
  loginForToken,
  readyServer,
  restoreAuthBoundaryEnv,
  treatmentHeaders
} from "./server.auth.test-support.js";
import {
  fhirRequestHeaders,
  findAuditEventByRequestId
} from "./server.fhir.test-support.js";

describe("API FHIR access boundary", () => {
  let app: FastifyInstance;
  const originalEnv = captureAuthBoundaryEnv();

  beforeEach(() => {
    applyDefaultAuthBoundaryEnv();
  });

  afterEach(async () => {
    await app.close();
    restoreAuthBoundaryEnv(originalEnv);
  });

  async function readySessionToken(
    username = "practitioner-demo-001",
    role = "clinician"
  ): Promise<string> {
    app = await readyServer();
    return loginForToken(app, username, role);
  }

  it("denies nurse FHIR export even with treatment purpose", async () => {
    const accessToken = await readySessionToken("nurse-demo-001", "nurse");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/fhir",
      headers: treatmentHeaders(accessToken)
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({
      error: "FORBIDDEN",
      permission: "patient:fhir-export"
    });
  });

  it("negotiates auth and RBAC denials on FHIR endpoints as OperationOutcome", async () => {
    app = await readyServer();
    const nurseToken = await loginForToken(app, "nurse-demo-001", "nurse");
    const auditorToken = await loginForToken(app, "security-officer-demo", "auditor");

    const unauthenticatedResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/fhir",
      headers: fhirRequestHeaders({
        "x-request-id": "fhir-unauthenticated-001"
      })
    });

    expectOperationOutcome(unauthenticatedResponse, {
      statusCode: 401,
      code: "login",
      detailsCode: "UNAUTHENTICATED"
    });
    expect(String(unauthenticatedResponse.headers["www-authenticate"])).toBe("Bearer");

    const forbiddenResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/fhir",
      headers: fhirRequestHeaders({
        ...treatmentHeaders(nurseToken),
        "x-request-id": "fhir-forbidden-nurse-export-001"
      })
    });

    expectOperationOutcome(forbiddenResponse, {
      statusCode: 403,
      code: "forbidden",
      detailsCode: "FORBIDDEN"
    });

    const auditResponse = await app.inject({
      method: "GET",
      url: "/api/v1/audit-events?limit=25",
      headers: auditHeaders(auditorToken)
    });
    const auditBody = auditResponse.json();
    const deniedAuditEvent = findAuditEventByRequestId(
      auditBody,
      "fhir-forbidden-nurse-export-001"
    );

    expect(auditResponse.statusCode).toBe(200);
    expect(deniedAuditEvent).toMatchObject({
      action: "access.denied",
      resourceType: "Patient",
      resourceId: "patient:fhir-export",
      metadata: expect.objectContaining({
        denialCode: "FORBIDDEN",
        deniedPermission: "patient:fhir-export",
        deniedActorId: "nurse-demo-001",
        deniedActorRole: "nurse",
        deniedActorPurposeOfUse: "TREATMENT",
        statusCode: 403
      })
    });
  });

  it("negotiates patient-scope ABAC denials on FHIR endpoints as OperationOutcome", async () => {
    app = await readyServer();
    const adminToken = await loginForToken(app, "admin-demo", "admin");
    const clinicianToken = await loginForToken(app, "practitioner-demo-001", "clinician");
    const auditorToken = await loginForToken(app, "security-officer-demo", "auditor");

    const outsidePatientResponse = await app.inject({
      method: "POST",
      url: "/api/v1/patients",
      headers: jsonRequestHeaders(treatmentHeaders(adminToken)),
      payload: {
        identifiers: [
          {
            system: "urn:benh-vien-so:mrn",
            value: "MRN-FHIR-ABAC-DENIED",
            type: "hospital-mrn"
          }
        ],
        fullName: "FHIR ABAC Denied Patient",
        gender: "unknown",
        managingOrganizationId: "hospital-outside-fhir-denied"
      }
    });
    const outsidePatient = outsidePatientResponse.json() as { readonly id: string };

    expect(outsidePatientResponse.statusCode).toBe(201);

    const deniedResponse = await app.inject({
      method: "GET",
      url: `/api/v1/patients/${outsidePatient.id}/fhir`,
      headers: fhirRequestHeaders({
        ...treatmentHeaders(clinicianToken),
        "x-request-id": "fhir-patient-abac-denied-001"
      })
    });

    expectOperationOutcome(deniedResponse, {
      statusCode: 403,
      code: "forbidden",
      detailsCode: "PATIENT_ACCESS_DENIED"
    });

    const auditResponse = await app.inject({
      method: "GET",
      url: `/api/v1/patients/${outsidePatient.id}/audit-events`,
      headers: auditHeaders(auditorToken)
    });
    const auditBody = auditResponse.json();
    const deniedAuditEvent = findAuditEventByRequestId(
      auditBody,
      "fhir-patient-abac-denied-001"
    );

    expect(auditResponse.statusCode).toBe(200);
    expect(deniedAuditEvent).toMatchObject({
      action: "access.denied",
      resourceType: "Patient",
      resourceId: outsidePatient.id,
      patientId: outsidePatient.id,
      metadata: expect.objectContaining({
        denialCode: "PATIENT_ACCESS_DENIED",
        deniedActorId: "practitioner-demo-001",
        deniedActorRole: "clinician",
        deniedActorPurposeOfUse: "TREATMENT",
        statusCode: 403
      })
    });
  });
});

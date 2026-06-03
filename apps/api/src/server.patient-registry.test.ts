import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  applyDefaultAuthBoundaryEnv,
  auditHeaders,
  captureAuthBoundaryEnv,
  jsonRequestHeaders,
  loginForToken,
  readyServer,
  restoreAuthBoundaryEnv,
  treatmentHeaders
} from "./server.auth.test-support.js";

describe("API patient registry boundary", () => {
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

  it("allows clinician treatment access to patient registry", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients",
      headers: treatmentHeaders(accessToken)
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.items).toHaveLength(1);
    expect(body.items[0]).toMatchObject({
      id: "patient-demo-001",
      fullName: "Nguyễn Văn An"
    });
  });

  it("blocks duplicate patient identifiers before creating a new record", async () => {
    app = await readyServer();
    const adminToken = await loginForToken(app, "admin-demo", "admin");

    const response = await app.inject({
      method: "POST",
      url: "/api/v1/patients",
      headers: jsonRequestHeaders({
        ...treatmentHeaders(adminToken),
        "x-request-id": "patient-identifier-conflict-001"
      }),
      payload: {
        identifiers: [
          {
            system: "urn:gov:vietnam:national-id",
            value: "000000000001",
            type: "national-id"
          }
        ],
        fullName: "Duplicate Identity Patient",
        gender: "unknown",
        managingOrganizationId: "hospital-hai-phong-demo"
      }
    });
    const body = response.json();

    expect(response.statusCode).toBe(409);
    expect(body).toMatchObject({
      error: "PATIENT_IDENTIFIER_CONFLICT",
      requestId: "patient-identifier-conflict-001",
      identifier: {
        system: "urn:gov:vietnam:national-id",
        type: "national-id"
      }
    });
    expect(JSON.stringify(body)).not.toContain("patient-demo-001");

    const patientsResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients",
      headers: treatmentHeaders(adminToken)
    });
    expect(patientsResponse.json().items).toHaveLength(1);

    const auditorToken = await loginForToken(app, "security-officer-demo", "auditor");
    const auditResponse = await app.inject({
      method: "GET",
      url: "/api/v1/audit-events?limit=10",
      headers: auditHeaders(auditorToken)
    });
    const conflictEvent = auditResponse
      .json()
      .items.find(
        (event: { readonly metadata?: { readonly requestId?: string } }) =>
          event.metadata?.requestId === "patient-identifier-conflict-001"
      );

    expect(conflictEvent).toMatchObject({
      action: "patient.identifier-conflict",
      resourceType: "Patient",
      resourceId: "patient-demo-001",
      patientId: "patient-demo-001",
      metadata: expect.objectContaining({
        identifierSystem: "urn:gov:vietnam:national-id",
        identifierType: "national-id"
      })
    });
  });

  it("merges a duplicate patient record into the canonical patient", async () => {
    app = await readyServer();
    const adminToken = await loginForToken(app, "admin-demo", "admin");
    const clinicianToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const createResponse = await app.inject({
      method: "POST",
      url: "/api/v1/patients",
      headers: jsonRequestHeaders(treatmentHeaders(adminToken)),
      payload: {
        identifiers: [
          {
            system: "urn:benh-vien-so:mrn",
            value: "MRN-MERGE-TEST",
            type: "hospital-mrn"
          }
        ],
        fullName: "Duplicate Patient For Merge",
        gender: "unknown",
        managingOrganizationId: "hospital-hai-phong-demo"
      }
    });
    const sourcePatientId = createResponse.json().id as string;

    expect(createResponse.statusCode).toBe(201);

    const clinicianMergeResponse = await app.inject({
      method: "POST",
      url: `/api/v1/patients/${sourcePatientId}/merge`,
      headers: jsonRequestHeaders({
        ...treatmentHeaders(clinicianToken),
        "x-request-id": "patient-merge-clinician-denied-001"
      }),
      payload: {
        targetPatientId: "patient-demo-001",
        reason: "Clinician should not merge patient registry records."
      }
    });

    expect(clinicianMergeResponse.statusCode).toBe(403);
    expect(clinicianMergeResponse.json()).toMatchObject({
      error: "FORBIDDEN",
      permission: "patient:merge",
      requestId: "patient-merge-clinician-denied-001"
    });

    const mergeResponse = await app.inject({
      method: "POST",
      url: `/api/v1/patients/${sourcePatientId}/merge`,
      headers: jsonRequestHeaders({
        ...treatmentHeaders(adminToken),
        "x-request-id": "patient-merge-001"
      }),
      payload: {
        targetPatientId: "patient-demo-001",
        reason: "Duplicate registration found during MPI review."
      }
    });
    const merged = mergeResponse.json();

    expect(mergeResponse.statusCode).toBe(200);
    expect(merged).toMatchObject({
      id: sourcePatientId,
      status: "merged",
      mergedIntoPatientId: "patient-demo-001",
      mergedByActorId: "admin-demo",
      mergeReason: "Duplicate registration found during MPI review."
    });
    expect(Date.parse(merged.mergedAt)).not.toBeNaN();

    const fhirResponse = await app.inject({
      method: "GET",
      url: `/api/v1/patients/${sourcePatientId}/fhir`,
      headers: treatmentHeaders(adminToken)
    });
    expect(fhirResponse.statusCode).toBe(200);
    expect(fhirResponse.json()).toMatchObject({
      resourceType: "Patient",
      id: sourcePatientId,
      active: false,
      link: [
        {
          other: {
            reference: "Patient/patient-demo-001"
          },
          type: "replaced-by"
        }
      ]
    });

    const writeAfterMergeResponse = await app.inject({
      method: "POST",
      url: `/api/v1/patients/${sourcePatientId}/encounters`,
      headers: jsonRequestHeaders({
        ...treatmentHeaders(adminToken),
        "x-request-id": "patient-merge-write-denied-001"
      }),
      payload: {
        class: "ambulatory",
        serviceType: "Should not write to merged patient",
        reasonText: "Merged source patient must stay read-only.",
        attendingPractitionerId: "practitioner-demo-001",
        startedAt: "2026-05-28T05:00:00.000Z"
      }
    });

    expect(writeAfterMergeResponse.statusCode).toBe(409);
    expect(writeAfterMergeResponse.json()).toMatchObject({
      error: "PATIENT_RECORD_MERGED",
      requestId: "patient-merge-write-denied-001",
      patientId: sourcePatientId,
      mergedIntoPatientId: "patient-demo-001"
    });

    const auditorToken = await loginForToken(app, "security-officer-demo", "auditor");
    const auditResponse = await app.inject({
      method: "GET",
      url: "/api/v1/audit-events?limit=20",
      headers: auditHeaders(auditorToken)
    });
    const mergeAuditEvent = auditResponse
      .json()
      .items.find(
        (event: { readonly metadata?: { readonly requestId?: string } }) =>
          event.metadata?.requestId === "patient-merge-001"
      );

    expect(mergeAuditEvent).toMatchObject({
      action: "patient.merge",
      resourceType: "Patient",
      resourceId: sourcePatientId,
      patientId: sourcePatientId,
      metadata: expect.objectContaining({
        targetPatientId: "patient-demo-001"
      })
    });
  });
});

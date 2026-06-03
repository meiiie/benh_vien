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

type FhirAuditEventResource = {
  readonly subtype: readonly { readonly code: string }[];
};

describe("API audit FHIR boundary", () => {
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

  it("records denied patient access in the patient audit trail and FHIR export", async () => {
    app = await readyServer();
    const adminToken = await loginForToken(app, "admin-demo", "admin");
    const clinicianToken = await loginForToken(app, "practitioner-demo-001", "clinician");
    const auditorToken = await loginForToken(app, "security-officer-demo", "auditor");

    const createResponse = await app.inject({
      method: "POST",
      url: "/api/v1/patients",
      headers: jsonRequestHeaders(treatmentHeaders(adminToken)),
      payload: {
        identifiers: [
          {
            system: "urn:benh-vien-so:mrn",
            value: "MRN-DENIED-AUDIT-TEST",
            type: "hospital-mrn"
          }
        ],
        fullName: "Denied Audit Patient",
        gender: "unknown",
        managingOrganizationId: "hospital-outside-demo"
      }
    });
    const outsidePatientId = createResponse.json().id as string;

    expect(createResponse.statusCode).toBe(201);

    const deniedResponse = await app.inject({
      method: "GET",
      url: `/api/v1/patients/${outsidePatientId}`,
      headers: requestIdHeaders(
        treatmentHeaders(clinicianToken),
        "patient-denied-audit-001"
      )
    });

    expect(deniedResponse.statusCode).toBe(403);
    expect(deniedResponse.json()).toMatchObject({
      error: "PATIENT_ACCESS_DENIED",
      patientId: outsidePatientId,
      requestId: "patient-denied-audit-001"
    });

    const auditResponse = await app.inject({
      method: "GET",
      url: `/api/v1/patients/${outsidePatientId}/audit-events`,
      headers: auditHeaders(auditorToken)
    });
    const auditBody = auditResponse.json();

    expect(auditResponse.statusCode).toBe(200);
    expect(auditBody.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          action: "access.denied",
          resourceType: "Patient",
          resourceId: outsidePatientId,
          patientId: outsidePatientId,
          metadata: expect.objectContaining({
            denialCode: "PATIENT_ACCESS_DENIED",
            deniedActorId: "practitioner-demo-001",
            deniedActorRole: "clinician",
            deniedActorPurposeOfUse: "TREATMENT",
            requestId: "patient-denied-audit-001",
            route: `GET /api/v1/patients/${outsidePatientId}`,
            statusCode: 403
          })
        })
      ])
    );

    const fhirResponse = await app.inject({
      method: "GET",
      url: `/api/v1/patients/${outsidePatientId}/audit-events/fhir-bundle`,
      headers: auditHeaders(auditorToken)
    });
    const fhirBody = fhirResponse.json();
    const deniedAuditResource = fhirBody.entry
      .map((entry: { readonly resource: FhirAuditEventResource }) => entry.resource)
      .find((resource: FhirAuditEventResource) =>
        resource.subtype.some((subtype) => subtype.code === "access.denied")
      );

    expect(fhirResponse.statusCode).toBe(200);
    expect(deniedAuditResource).toMatchObject({
      resourceType: "AuditEvent",
      action: "E",
      outcome: "4",
      outcomeDesc: "Access denied",
      entity: [
        {
          what: expect.objectContaining({
            display: `Patient/${outsidePatientId}`
          }),
          name: "access.denied"
        }
      ]
    });
  });

  it("exports patient audit trail as a FHIR AuditEvent Bundle for auditor review", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "security-officer-demo", "auditor");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/audit-events/fhir-bundle",
      headers: auditHeaders(accessToken)
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body).toMatchObject({
      resourceType: "Bundle",
      type: "collection",
      entry: [
        {
          resource: {
            resourceType: "AuditEvent",
            type: {
              code: "rest"
            },
            subtype: [
              {
                code: "audit-event.fhir-export"
              }
            ],
            agent: [
              {
                requestor: true,
                purposeOfUse: [
                  {
                    code: "AUDIT"
                  }
                ]
              }
            ]
          }
        }
      ]
    });
    expect(body.entry[0].resource.entity[0].detail).toContainEqual(
      expect.objectContaining({
        type: "integrityHash",
        valueString: expect.stringMatching(/^[a-f0-9]{64}$/)
      })
    );
  });

  it("denies clinician treatment-purpose export of the audit FHIR Bundle", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/audit-events/fhir-bundle",
      headers: treatmentHeaders(accessToken)
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({
      error: "FORBIDDEN",
      permission: "audit-event:fhir-export"
    });
  });
});

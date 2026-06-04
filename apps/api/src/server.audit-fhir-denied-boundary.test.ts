import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  captureAuthBoundaryEnv,
  jsonRequestHeaders,
  restoreAuthBoundaryEnv,
  treatmentHeaders
} from "./server.auth.test-support.js";
import {
  type AuditTestContext,
  auditPurposeHeaders,
  loginAuditTestToken,
  readyAuditTestContext,
  tokenTreatmentRequestIdHeaders
} from "./server.audit.test-support.js";

type FhirAuditEventResource = {
  readonly subtype: readonly { readonly code: string }[];
};

describe("API audit FHIR denied boundary", () => {
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

  it("records denied patient access in the patient audit trail and FHIR export", async () => {
    const adminToken = await loginAuditTestToken(context!, "admin-demo", "admin");
    const clinicianToken = await loginAuditTestToken(
      context!,
      "practitioner-demo-001",
      "clinician"
    );

    const createResponse = await context!.app.inject({
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

    const deniedResponse = await context!.app.inject({
      method: "GET",
      url: `/api/v1/patients/${outsidePatientId}`,
      headers: tokenTreatmentRequestIdHeaders(
        clinicianToken,
        "patient-denied-audit-001"
      )
    });

    expect(deniedResponse.statusCode).toBe(403);
    expect(deniedResponse.json()).toMatchObject({
      error: "PATIENT_ACCESS_DENIED",
      patientId: outsidePatientId,
      requestId: "patient-denied-audit-001"
    });

    const auditResponse = await context!.app.inject({
      method: "GET",
      url: `/api/v1/patients/${outsidePatientId}/audit-events`,
      headers: auditPurposeHeaders(context!)
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

    const fhirResponse = await context!.app.inject({
      method: "GET",
      url: `/api/v1/patients/${outsidePatientId}/audit-events/fhir-bundle`,
      headers: auditPurposeHeaders(context!)
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
});

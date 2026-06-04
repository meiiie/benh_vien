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

describe("API audit FHIR boundary", () => {
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

  it("exports patient audit trail as a FHIR AuditEvent Bundle for auditor review", async () => {
    const response = await context!.app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/audit-events/fhir-bundle",
      headers: auditPurposeHeaders(context!)
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
    const clinicianToken = await loginAuditTestToken(
      context!,
      "practitioner-demo-001",
      "clinician"
    );

    const response = await context!.app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/audit-events/fhir-bundle",
      headers: tokenTreatmentRequestIdHeaders(
        clinicianToken,
        "audit-fhir-clinician-denied-001"
      )
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({
      error: "FORBIDDEN",
      permission: "audit-event:fhir-export"
    });
  });
});

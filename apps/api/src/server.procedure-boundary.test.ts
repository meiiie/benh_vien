import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  type CareWorkflowTestContext,
  getClinicalResourceList,
  getTreatmentJson,
  readyCareWorkflowTestContext,
  treatmentJsonHeaders
} from "./server.care-workflow.test-support.js";
import {
  captureAuthBoundaryEnv,
  restoreAuthBoundaryEnv
} from "./server.auth.test-support.js";

describe("API procedure boundary", () => {
  let context: CareWorkflowTestContext;
  const originalEnv = captureAuthBoundaryEnv();

  beforeEach(async () => {
    context = await readyCareWorkflowTestContext();
  });

  afterEach(async () => {
    await context.app.close();
    restoreAuthBoundaryEnv(originalEnv);
  });

  it("lists procedures and exports them as FHIR Procedure", async () => {
    const listBody = await getClinicalResourceList(
      context,
      "/api/v1/patients/patient-demo-001/procedures"
    );

    expect(listBody.items).toHaveLength(2);
    expect(listBody.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "procedure-demo-001",
          status: "completed",
          basedOnServiceRequestId: "service-request-demo-002"
        })
      ])
    );

    const fhirBody = await getTreatmentJson(
      context,
      "/api/v1/procedures/procedure-demo-001/fhir"
    );

    expect(fhirBody).toMatchObject({
      resourceType: "Procedure",
      id: "procedure-demo-001",
      status: "completed",
      basedOn: [
        {
          reference: "ServiceRequest/service-request-demo-002"
        }
      ],
      subject: {
        reference: "Patient/patient-demo-001"
      },
      report: [
        {
          reference: "DiagnosticReport/diagnostic-report-demo-002"
        }
      ]
    });
  });

  it("creates a procedure linked to a service request and diagnostic report", async () => {
    const response = await context.app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/procedures",
      headers: treatmentJsonHeaders(context),
      payload: {
        encounterId: "encounter-demo-002",
        basedOnServiceRequestId: "service-request-demo-002",
        reasonConditionId: "condition-demo-002",
        status: "completed",
        category: "diagnostic",
        code: {
          system: "http://snomed.info/sct",
          code: "168537006",
          display: "Chest X-ray"
        },
        performedPeriod: {
          start: "2026-05-27T07:10:00.000Z",
          end: "2026-05-27T07:20:00.000Z"
        },
        performers: [
          {
            actorType: "Practitioner",
            actorId: "practitioner-demo-001",
            onBehalfOfOrganizationId: "department-diagnostic-imaging"
          }
        ],
        reportReferences: [
          {
            resourceType: "DiagnosticReport",
            id: "diagnostic-report-demo-002"
          }
        ],
        note: "Procedure thử nghiệm trong API test."
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      patientId: "patient-demo-001",
      encounterId: "encounter-demo-002",
      basedOnServiceRequestId: "service-request-demo-002",
      category: "diagnostic",
      reportReferences: [
        {
          resourceType: "DiagnosticReport",
          id: "diagnostic-report-demo-002"
        }
      ]
    });
  });
});

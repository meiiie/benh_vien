import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  applyDefaultAuthBoundaryEnv,
  captureAuthBoundaryEnv,
  jsonRequestHeaders,
  loginForToken,
  readyServer,
  restoreAuthBoundaryEnv,
  treatmentHeaders
} from "./server.auth.test-support.js";

type ClinicalResourceListBody = {
  readonly items: readonly { readonly id: string }[];
};

describe("API care workflow boundary", () => {
  let app: FastifyInstance;
  let accessToken: string;
  const originalEnv = captureAuthBoundaryEnv();

  beforeEach(async () => {
    applyDefaultAuthBoundaryEnv();
    app = await readyServer();
    accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");
  });

  afterEach(async () => {
    await app.close();
    restoreAuthBoundaryEnv(originalEnv);
  });

  async function getTreatmentJson(url: string): Promise<Record<string, unknown>> {
    const response = await app.inject({
      method: "GET",
      url,
      headers: treatmentHeaders(accessToken)
    });

    expect(response.statusCode).toBe(200);
    return response.json() as Record<string, unknown>;
  }

  async function getClinicalResourceList(
    url: string
  ): Promise<ClinicalResourceListBody> {
    return (await getTreatmentJson(url)) as ClinicalResourceListBody;
  }

  it("lists workflow tasks and exports them as FHIR Task", async () => {
    const listBody = await getClinicalResourceList(
      "/api/v1/patients/patient-demo-001/workflow-tasks"
    );

    expect(listBody.items).toHaveLength(2);
    expect(listBody.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "workflow-task-demo-002",
          status: "completed",
          basedOnServiceRequestId: "service-request-demo-002"
        })
      ])
    );

    const fhirBody = await getTreatmentJson(
      "/api/v1/workflow-tasks/workflow-task-demo-002/fhir"
    );

    expect(fhirBody).toMatchObject({
      resourceType: "Task",
      id: "workflow-task-demo-002",
      status: "completed",
      focus: {
        reference: "ServiceRequest/service-request-demo-002"
      },
      output: expect.arrayContaining([
        expect.objectContaining({
          valueReference: {
            reference: "ImagingStudy/imaging-study-demo-001",
            display: "Metadata DICOM X-quang ngực"
          }
        })
      ])
    });
  });

  it("lists procedures and exports them as FHIR Procedure", async () => {
    const listBody = await getClinicalResourceList(
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
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/procedures",
      headers: jsonRequestHeaders(treatmentHeaders(accessToken)),
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

  it("lists service requests and exports them as FHIR ServiceRequest", async () => {
    const listBody = await getClinicalResourceList(
      "/api/v1/patients/patient-demo-001/service-requests"
    );

    expect(listBody.items).toHaveLength(2);

    const fhirBody = await getTreatmentJson(
      `/api/v1/service-requests/${listBody.items[0].id}/fhir`
    );

    expect(fhirBody).toMatchObject({
      resourceType: "ServiceRequest",
      status: "active",
      intent: "order",
      subject: {
        reference: "Patient/patient-demo-001"
      }
    });
  });

  it("creates a service request linked to a patient condition", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/service-requests",
      headers: jsonRequestHeaders(treatmentHeaders(accessToken)),
      payload: {
        encounterId: "encounter-demo-002",
        reasonConditionId: "condition-demo-002",
        category: "laboratory",
        priority: "urgent",
        code: {
          system: "http://loinc.org",
          code: "24323-8",
          display: "Comprehensive metabolic panel"
        },
        authoredOn: "2026-05-27T04:30:00.000Z",
        occurrenceAt: "2026-05-27T05:00:00.000Z",
        requesterPractitionerId: "practitioner-demo-001",
        performerOrganizationId: "department-laboratory",
        patientInstruction: "Nhịn ăn nếu khoa xét nghiệm yêu cầu."
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      patientId: "patient-demo-001",
      encounterId: "encounter-demo-002",
      reasonConditionId: "condition-demo-002",
      category: "laboratory"
    });
  });
});

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

describe("API service request boundary", () => {
  let context: CareWorkflowTestContext;
  const originalEnv = captureAuthBoundaryEnv();

  beforeEach(async () => {
    context = await readyCareWorkflowTestContext();
  });

  afterEach(async () => {
    await context.app.close();
    restoreAuthBoundaryEnv(originalEnv);
  });

  it("lists service requests and exports them as FHIR ServiceRequest", async () => {
    const listBody = await getClinicalResourceList(
      context,
      "/api/v1/patients/patient-demo-001/service-requests"
    );

    expect(listBody.items).toHaveLength(2);

    const fhirBody = await getTreatmentJson(
      context,
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
    const response = await context.app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/service-requests",
      headers: treatmentJsonHeaders(context),
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

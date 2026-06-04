import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  type CareWorkflowTestContext,
  getClinicalResourceList,
  getTreatmentJson,
  readyCareWorkflowTestContext
} from "./server.care-workflow.test-support.js";
import {
  captureAuthBoundaryEnv,
  restoreAuthBoundaryEnv
} from "./server.auth.test-support.js";

describe("API workflow task boundary", () => {
  let context: CareWorkflowTestContext;
  const originalEnv = captureAuthBoundaryEnv();

  beforeEach(async () => {
    context = await readyCareWorkflowTestContext();
  });

  afterEach(async () => {
    await context.app.close();
    restoreAuthBoundaryEnv(originalEnv);
  });

  it("lists workflow tasks and exports them as FHIR Task", async () => {
    const listBody = await getClinicalResourceList(
      context,
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
      context,
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
});

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  captureAuthBoundaryEnv,
  restoreAuthBoundaryEnv
} from "./server.auth.test-support.js";
import {
  type ClinicalResourceTestContext,
  clinicalJsonHeaders,
  getClinicalResourceList,
  getTreatmentJson,
  readyClinicalResourceTestContext
} from "./server.clinical-resource.test-support.js";

describe("API condition boundary", () => {
  let context: ClinicalResourceTestContext | undefined;
  const originalEnv = captureAuthBoundaryEnv();

  beforeEach(async () => {
    context = await readyClinicalResourceTestContext();
  });

  afterEach(async () => {
    if (context) {
      await context.app.close();
      context = undefined;
    }

    restoreAuthBoundaryEnv(originalEnv);
  });

  it("lists conditions and exports them as FHIR Condition", async () => {
    const listBody = await getClinicalResourceList(
      context!,
      "/api/v1/patients/patient-demo-001/conditions"
    );

    expect(listBody.items).toHaveLength(2);

    const fhirBody = await getTreatmentJson(
      context!,
      `/api/v1/conditions/${listBody.items[0].id}/fhir`
    );

    expect(fhirBody).toMatchObject({
      resourceType: "Condition",
      subject: {
        reference: "Patient/patient-demo-001"
      }
    });
  });

  it("creates a condition attached to the selected patient encounter", async () => {
    const response = await context!.app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/conditions",
      headers: clinicalJsonHeaders(context!),
      payload: {
        encounterId: "encounter-demo-002",
        category: "encounter-diagnosis",
        code: {
          system: "http://hl7.org/fhir/sid/icd-10",
          code: "R50.9",
          display: "Sốt chưa rõ nguyên nhân"
        },
        severity: "mild",
        onsetAt: "2026-05-27T00:00:00.000Z",
        recorderPractitionerId: "practitioner-demo-001",
        note: "Chẩn đoán thử nghiệm trong API test."
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      patientId: "patient-demo-001",
      encounterId: "encounter-demo-002",
      category: "encounter-diagnosis"
    });
  });
});

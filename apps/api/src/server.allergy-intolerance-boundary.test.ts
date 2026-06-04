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

describe("API allergy intolerance boundary", () => {
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

  it("lists allergy intolerances and exports them as FHIR AllergyIntolerance", async () => {
    const listBody = await getClinicalResourceList(
      context!,
      "/api/v1/patients/patient-demo-001/allergy-intolerances"
    );

    expect(listBody.items).toHaveLength(2);

    const fhirBody = await getTreatmentJson(
      context!,
      `/api/v1/allergy-intolerances/${listBody.items[0].id}/fhir`
    );

    expect(fhirBody).toMatchObject({
      resourceType: "AllergyIntolerance",
      patient: {
        reference: "Patient/patient-demo-001"
      }
    });
  });

  it("creates an allergy intolerance attached to the selected patient encounter", async () => {
    const response = await context!.app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/allergy-intolerances",
      headers: clinicalJsonHeaders(context!),
      payload: {
        encounterId: "encounter-demo-002",
        type: "allergy",
        category: "medication",
        criticality: "high",
        code: {
          system: "http://snomed.info/sct",
          code: "91936005",
          display: "Allergy to penicillin"
        },
        reaction: {
          manifestation: {
            system: "http://snomed.info/sct",
            code: "271807003",
            display: "Skin rash"
          },
          severity: "moderate"
        },
        recorderPractitionerId: "practitioner-demo-001",
        note: "Cảnh báo dị ứng thử nghiệm trong API test."
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      patientId: "patient-demo-001",
      encounterId: "encounter-demo-002",
      category: "medication",
      type: "allergy"
    });
  });
});

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

describe("API observation boundary", () => {
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

  it("lists observations and exports them as FHIR Observation", async () => {
    const listBody = await getClinicalResourceList(
      context!,
      "/api/v1/patients/patient-demo-001/observations"
    );

    expect(listBody.items).toHaveLength(2);

    const fhirBody = await getTreatmentJson(
      context!,
      `/api/v1/observations/${listBody.items[0].id}/fhir`
    );

    expect(fhirBody).toMatchObject({
      resourceType: "Observation",
      subject: {
        reference: "Patient/patient-demo-001"
      }
    });
  });

  it("creates an observation attached to the selected patient encounter", async () => {
    const response = await context!.app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/observations",
      headers: clinicalJsonHeaders(context!),
      payload: {
        encounterId: "encounter-demo-002",
        category: "vital-signs",
        code: {
          system: "http://loinc.org",
          code: "8867-4",
          display: "Heart rate"
        },
        effectiveAt: "2026-05-27T04:00:00.000Z",
        valueQuantity: {
          value: 78,
          unit: "/min",
          system: "http://unitsofmeasure.org",
          code: "/min"
        },
        performerPractitionerId: "nurse-demo-001"
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      patientId: "patient-demo-001",
      encounterId: "encounter-demo-002",
      category: "vital-signs"
    });
  });
});

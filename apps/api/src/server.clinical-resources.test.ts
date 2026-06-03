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

describe("API clinical resource boundary", () => {
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

  it("lists allergy intolerances and exports them as FHIR AllergyIntolerance", async () => {
    const listBody = await getClinicalResourceList(
      "/api/v1/patients/patient-demo-001/allergy-intolerances"
    );

    expect(listBody.items).toHaveLength(2);

    const fhirBody = await getTreatmentJson(
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
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/allergy-intolerances",
      headers: jsonRequestHeaders(treatmentHeaders(accessToken)),
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

  it("lists conditions and exports them as FHIR Condition", async () => {
    const listBody = await getClinicalResourceList(
      "/api/v1/patients/patient-demo-001/conditions"
    );

    expect(listBody.items).toHaveLength(2);

    const fhirBody = await getTreatmentJson(
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
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/conditions",
      headers: jsonRequestHeaders(treatmentHeaders(accessToken)),
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

  it("lists observations and exports them as FHIR Observation", async () => {
    const listBody = await getClinicalResourceList(
      "/api/v1/patients/patient-demo-001/observations"
    );

    expect(listBody.items).toHaveLength(2);

    const fhirBody = await getTreatmentJson(
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
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/observations",
      headers: jsonRequestHeaders(treatmentHeaders(accessToken)),
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

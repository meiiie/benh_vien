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

describe("API medication resource boundary", () => {
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

  it("lists medication requests and exports them as FHIR MedicationRequest", async () => {
    const listBody = await getClinicalResourceList(
      "/api/v1/patients/patient-demo-001/medication-requests"
    );

    expect(listBody.items).toHaveLength(2);

    const fhirBody = await getTreatmentJson(
      `/api/v1/medication-requests/${listBody.items[0].id}/fhir`
    );

    expect(fhirBody).toMatchObject({
      resourceType: "MedicationRequest",
      status: "active",
      intent: "order",
      subject: {
        reference: "Patient/patient-demo-001"
      }
    });
  });

  it("creates a medication request linked to a patient condition", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/medication-requests",
      headers: jsonRequestHeaders(treatmentHeaders(accessToken)),
      payload: {
        encounterId: "encounter-demo-002",
        reasonConditionId: "condition-demo-002",
        category: "outpatient",
        medicationCode: {
          system: "http://www.whocc.no/atc",
          code: "C08CA01",
          display: "Amlodipine"
        },
        dosageInstruction: {
          text: "Take 5 mg every evening",
          route: "Oral route",
          doseQuantity: {
            value: 5,
            unit: "mg",
            system: "http://unitsofmeasure.org",
            code: "mg"
          },
          frequency: 1,
          period: 1,
          periodUnit: "d"
        },
        requesterPractitionerId: "practitioner-demo-001",
        expectedSupplyDurationDays: 30
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      patientId: "patient-demo-001",
      encounterId: "encounter-demo-002",
      reasonConditionId: "condition-demo-002",
      category: "outpatient"
    });
  });
});

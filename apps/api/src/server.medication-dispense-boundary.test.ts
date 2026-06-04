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

describe("API medication dispense boundary", () => {
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

  it("lists medication dispenses and exports them as FHIR MedicationDispense", async () => {
    const listBody = await getClinicalResourceList(
      "/api/v1/patients/patient-demo-001/medication-dispenses"
    );

    expect(listBody.items).toHaveLength(2);
    expect(listBody.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "medication-dispense-demo-002",
          status: "completed",
          medicationRequestId: "medication-request-demo-002"
        })
      ])
    );

    const fhirBody = await getTreatmentJson(
      "/api/v1/medication-dispenses/medication-dispense-demo-002/fhir"
    );

    expect(fhirBody).toMatchObject({
      resourceType: "MedicationDispense",
      id: "medication-dispense-demo-002",
      status: "completed",
      authorizingPrescription: [
        {
          reference: "MedicationRequest/medication-request-demo-002"
        }
      ],
      subject: {
        reference: "Patient/patient-demo-001"
      }
    });
  });

  it("creates a medication dispense linked to the original medication request", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/medication-dispenses",
      headers: jsonRequestHeaders(treatmentHeaders(accessToken)),
      payload: {
        encounterId: "encounter-demo-002",
        medicationRequestId: "medication-request-demo-002",
        status: "completed",
        category: "outpatient",
        medicationCode: {
          system: "http://www.whocc.no/atc",
          code: "C09AA05",
          display: "Ramipril"
        },
        quantity: {
          value: 30,
          unit: "tablet",
          system: "http://unitsofmeasure.org",
          code: "{tablet}"
        },
        daysSupply: {
          value: 30,
          unit: "day",
          system: "http://unitsofmeasure.org",
          code: "d"
        },
        whenPrepared: "2026-05-27T05:30:00.000Z",
        whenHandedOver: "2026-05-27T05:45:00.000Z",
        dispenserPractitionerId: "nurse-demo-001",
        receiverPractitionerId: "nurse-demo-001",
        dosageInstruction: {
          text: "Take 5 mg every morning",
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
        }
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      patientId: "patient-demo-001",
      encounterId: "encounter-demo-002",
      medicationRequestId: "medication-request-demo-002",
      category: "outpatient",
      status: "completed"
    });
  });
});

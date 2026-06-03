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

describe("API diagnostic resource boundary", () => {
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

  it("lists diagnostic reports and exports them as FHIR DiagnosticReport", async () => {
    const listBody = await getClinicalResourceList(
      "/api/v1/patients/patient-demo-001/diagnostic-reports"
    );

    expect(listBody.items).toHaveLength(2);

    const fhirBody = await getTreatmentJson(
      `/api/v1/diagnostic-reports/${listBody.items[0].id}/fhir`
    );

    expect(fhirBody).toMatchObject({
      resourceType: "DiagnosticReport",
      subject: {
        reference: "Patient/patient-demo-001"
      },
      basedOn: [
        {
          reference: expect.stringMatching(/^ServiceRequest\//)
        }
      ]
    });
  });

  it("creates a diagnostic report linked to a service request and observation result", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/diagnostic-reports",
      headers: jsonRequestHeaders(treatmentHeaders(accessToken)),
      payload: {
        encounterId: "encounter-demo-001",
        basedOnServiceRequestId: "service-request-demo-001",
        category: "laboratory",
        code: {
          system: "http://loinc.org",
          code: "58410-2",
          display: "Complete blood count panel"
        },
        effectiveAt: "2026-05-27T06:00:00.000Z",
        issuedAt: "2026-05-27T06:30:00.000Z",
        performerOrganizationId: "department-laboratory",
        resultsInterpreterPractitionerId: "practitioner-demo-002",
        resultObservationIds: ["observation-demo-001"],
        conclusion: "API test diagnostic report."
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      patientId: "patient-demo-001",
      encounterId: "encounter-demo-001",
      basedOnServiceRequestId: "service-request-demo-001",
      category: "laboratory",
      resultObservationIds: ["observation-demo-001"]
    });
  });

  it("lists imaging studies and exports them as FHIR ImagingStudy", async () => {
    const listBody = await getClinicalResourceList(
      "/api/v1/patients/patient-demo-001/imaging-studies"
    );

    expect(listBody.items).toHaveLength(1);

    const fhirBody = await getTreatmentJson(
      `/api/v1/imaging-studies/${listBody.items[0].id}/fhir`
    );

    expect(fhirBody).toMatchObject({
      resourceType: "ImagingStudy",
      subject: {
        reference: "Patient/patient-demo-001"
      },
      basedOn: [
        {
          reference: "ServiceRequest/service-request-demo-002"
        }
      ],
      identifier: expect.arrayContaining([
        expect.objectContaining({
          system: "urn:dicom:uid",
          value: "urn:oid:1.2.826.0.1.3680043.10.543.202605270001"
        })
      ])
    });
  });

  it("creates an imaging study linked to a service request and diagnostic report", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/imaging-studies",
      headers: jsonRequestHeaders(treatmentHeaders(accessToken)),
      payload: {
        encounterId: "encounter-demo-002",
        basedOnServiceRequestId: "service-request-demo-002",
        diagnosticReportId: "diagnostic-report-demo-002",
        studyInstanceUid: "1.2.826.0.1.3680043.10.543.202605270099",
        accessionNumber: "HP-CXR-TEST-001",
        description: "Chest X-ray test study",
        startedAt: "2026-05-27T07:00:00.000Z",
        referrerPractitionerId: "practitioner-demo-001",
        interpreterPractitionerId: "practitioner-demo-001",
        endpointId: "endpoint-pacs-hai-phong-demo",
        series: [
          {
            uid: "1.2.826.0.1.3680043.10.543.202605270099.1",
            number: 1,
            modality: {
              system: "http://dicom.nema.org/resources/ontology/DCM",
              code: "DX",
              display: "Digital Radiography"
            },
            description: "PA and lateral chest radiographs",
            numberOfInstances: 2,
            bodySite: {
              system: "http://snomed.info/sct",
              code: "51185008",
              display: "Thoracic structure"
            }
          }
        ]
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      patientId: "patient-demo-001",
      encounterId: "encounter-demo-002",
      basedOnServiceRequestId: "service-request-demo-002",
      diagnosticReportId: "diagnostic-report-demo-002",
      numberOfSeries: 1,
      numberOfInstances: 2
    });
  });
});

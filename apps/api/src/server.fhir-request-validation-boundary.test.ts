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

describe("API FHIR request validation boundary", () => {
  let app: FastifyInstance;
  const originalEnv = captureAuthBoundaryEnv();

  beforeEach(() => {
    applyDefaultAuthBoundaryEnv();
  });

  afterEach(async () => {
    await app.close();
    restoreAuthBoundaryEnv(originalEnv);
  });

  async function readyClinicianSession(): Promise<string> {
    app = await readyServer();
    return loginForToken(app, "practitioner-demo-001", "clinician");
  }

  it("rejects clinical document attachment metadata with invalid MIME type or SHA-1 hash", async () => {
    const accessToken = await readyClinicianSession();

    const response = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/documents",
      headers: jsonRequestHeaders({
        ...treatmentHeaders(accessToken),
        "x-request-id": "clinical-document-validation-001"
      }),
      payload: {
        encounterId: "encounter-demo-001",
        type: "lab-report",
        title: "Invalid attachment metadata",
        storageUri: "s3://wiiicare-demo/patients/patient-demo-001/invalid.pdf",
        attachmentContentType: "not-a-mime-type",
        attachmentHashSha1Base64: "not-a-sha1-hash",
        authorPractitionerId: "practitioner-demo-001"
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: "VALIDATION_ERROR",
      requestId: "clinical-document-validation-001",
      issues: expect.any(Array)
    });
  });

  it("rejects FHIR unsignedInt overflows at the request boundary", async () => {
    const accessToken = await readyClinicianSession();

    const documentResponse = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/documents",
      headers: jsonRequestHeaders({
        ...treatmentHeaders(accessToken),
        "x-request-id": "clinical-document-unsigned-int-001"
      }),
      payload: {
        encounterId: "encounter-demo-001",
        type: "lab-report",
        title: "Oversized FHIR unsignedInt attachment",
        storageUri: "s3://wiiicare-demo/patients/patient-demo-001/oversized.pdf",
        attachmentSizeBytes: 2_147_483_648,
        authorPractitionerId: "practitioner-demo-001"
      }
    });

    expect(documentResponse.statusCode).toBe(400);
    expect(documentResponse.json()).toMatchObject({
      error: "VALIDATION_ERROR",
      requestId: "clinical-document-unsigned-int-001"
    });

    const imagingResponse = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/imaging-studies",
      headers: jsonRequestHeaders({
        ...treatmentHeaders(accessToken),
        "x-request-id": "imaging-study-unsigned-int-001"
      }),
      payload: {
        studyInstanceUid: "1.2.826.0.1.3680043.10.543.202605270100",
        series: [
          {
            uid: "1.2.826.0.1.3680043.10.543.202605270100.1",
            number: 2_147_483_648,
            modality: {
              system: "http://dicom.nema.org/resources/ontology/DCM",
              code: "DX",
              display: "Digital Radiography"
            },
            numberOfInstances: 1
          }
        ]
      }
    });

    expect(imagingResponse.statusCode).toBe(400);
    expect(imagingResponse.json()).toMatchObject({
      error: "VALIDATION_ERROR",
      requestId: "imaging-study-unsigned-int-001"
    });
  });

  it("rejects malformed DICOM UIDs at the request boundary", async () => {
    const accessToken = await readyClinicianSession();

    const invalidStudyUidResponse = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/imaging-studies",
      headers: jsonRequestHeaders({
        ...treatmentHeaders(accessToken),
        "x-request-id": "imaging-study-invalid-study-uid-001"
      }),
      payload: {
        studyInstanceUid: "1.2.826.0.01.3680043.10.543.202605270101",
        series: [
          {
            uid: "1.2.826.0.1.3680043.10.543.202605270101.1",
            modality: {
              system: "http://dicom.nema.org/resources/ontology/DCM",
              code: "DX",
              display: "Digital Radiography"
            },
            numberOfInstances: 1
          }
        ]
      }
    });

    expect(invalidStudyUidResponse.statusCode).toBe(400);
    expect(invalidStudyUidResponse.json()).toMatchObject({
      error: "VALIDATION_ERROR",
      requestId: "imaging-study-invalid-study-uid-001"
    });

    const invalidSeriesUidResponse = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/imaging-studies",
      headers: jsonRequestHeaders({
        ...treatmentHeaders(accessToken),
        "x-request-id": "imaging-study-invalid-series-uid-001"
      }),
      payload: {
        studyInstanceUid: "1.2.826.0.1.3680043.10.543.202605270102",
        series: [
          {
            uid: "1.2.826.0.1.3680043.10.543.202605270102.",
            modality: {
              system: "http://dicom.nema.org/resources/ontology/DCM",
              code: "DX",
              display: "Digital Radiography"
            },
            numberOfInstances: 1
          }
        ]
      }
    });

    expect(invalidSeriesUidResponse.statusCode).toBe(400);
    expect(invalidSeriesUidResponse.json()).toMatchObject({
      error: "VALIDATION_ERROR",
      requestId: "imaging-study-invalid-series-uid-001"
    });
  });
});

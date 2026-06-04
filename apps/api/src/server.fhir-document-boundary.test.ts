import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  applyDefaultAuthBoundaryEnv,
  captureAuthBoundaryEnv,
  expectOperationOutcome,
  loginForToken,
  readyServer,
  restoreAuthBoundaryEnv,
  treatmentHeaders
} from "./server.auth.test-support.js";

const dischargeSummaryTitle =
  "T\u00f3m t\u1eaft ra vi\u1ec7n - Nguy\u1ec5n V\u0103n An";

describe("API FHIR document boundary", () => {
  let app: FastifyInstance;
  const originalEnv = captureAuthBoundaryEnv();

  beforeEach(() => {
    applyDefaultAuthBoundaryEnv();
  });

  afterEach(async () => {
    await app.close();
    restoreAuthBoundaryEnv(originalEnv);
  });

  async function readySessionToken(): Promise<string> {
    app = await readyServer();
    return loginForToken(app, "practitioner-demo-001", "clinician");
  }

  it("exports signed clinical document provenance as FHIR Provenance", async () => {
    const accessToken = await readySessionToken();

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/clinical-documents/clinical-document-demo-001/fhir-provenance",
      headers: treatmentHeaders(accessToken)
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body).toMatchObject({
      resourceType: "Provenance",
      id: "clinical-document-demo-001-provenance",
      target: [
        {
          reference: "DocumentReference/clinical-document-demo-001",
          display: dischargeSummaryTitle
        }
      ],
      occurredDateTime: "2026-05-27T02:00:00.000Z",
      recorded: "2026-05-27T02:00:00.000Z",
      agent: [
        {
          who: {
            reference: "Practitioner/practitioner-demo-001"
          }
        }
      ],
      entity: [
        {
          role: "source",
          what: {
            reference: "s3://wiiicare-demo/patients/patient-demo-001/discharge-summary.pdf"
          }
        }
      ]
    });
  });

  it("exports clinical document attachment metadata as FHIR DocumentReference", async () => {
    const accessToken = await readySessionToken();

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/clinical-documents/clinical-document-demo-001/fhir",
      headers: treatmentHeaders(accessToken)
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body).toMatchObject({
      resourceType: "DocumentReference",
      id: "clinical-document-demo-001",
      content: [
        {
          attachment: {
            contentType: "application/pdf",
            url: "s3://wiiicare-demo/patients/patient-demo-001/discharge-summary.pdf",
            size: 245760,
            hash: "Kb0sBAJESyiK08beYsfPVMQp3xU=",
            title: dischargeSummaryTitle,
            creation: "2026-05-27T01:55:00.000Z"
          }
        }
      ]
    });
  });

  it("rejects FHIR Provenance export for an unsigned clinical document", async () => {
    const accessToken = await readySessionToken();

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/clinical-documents/clinical-document-demo-002/fhir-provenance",
      headers: treatmentHeaders(accessToken)
    });

    expectOperationOutcome(response, {
      statusCode: 422,
      code: "business-rule",
      detailsCode: "CLINICAL_DOCUMENT_PROVENANCE_ERROR"
    });
  });

  it("returns FHIR OperationOutcome when a FHIR DocumentReference target is missing", async () => {
    const accessToken = await readySessionToken();

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/clinical-documents/clinical-document-missing/fhir",
      headers: treatmentHeaders(accessToken)
    });

    expectOperationOutcome(response, {
      statusCode: 404,
      code: "not-found",
      detailsCode: "CLINICAL_DOCUMENT_NOT_FOUND"
    });
  });
});

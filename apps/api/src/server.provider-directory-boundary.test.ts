import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  applyDefaultAuthBoundaryEnv,
  captureAuthBoundaryEnv,
  loginForToken,
  readyServer,
  restoreAuthBoundaryEnv,
  treatmentHeaders
} from "./server.auth.test-support.js";

describe("API provider directory boundary", () => {
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

  it("returns provider directory and FHIR Endpoint resources", async () => {
    const directoryResponse = await app.inject({
      method: "GET",
      url: "/api/v1/provider-directory",
      headers: treatmentHeaders(accessToken)
    });
    const directoryBody = directoryResponse.json();

    expect(directoryResponse.statusCode).toBe(200);
    expect(directoryBody.organizations).toHaveLength(5);
    expect(directoryBody.endpoints).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "endpoint-pacs-hai-phong-demo",
          connectionType: "dicom-wado-rs"
        }),
        expect.objectContaining({
          id: "endpoint-fhir-hai-phong-referral",
          managingOrganizationId: "hospital-hai-phong-referral",
          connectionType: "hl7-fhir-rest"
        })
      ])
    );

    const fhirResponse = await app.inject({
      method: "GET",
      url: "/api/v1/provider-directory/Endpoint/endpoint-pacs-hai-phong-demo/fhir",
      headers: treatmentHeaders(accessToken)
    });

    expect(fhirResponse.statusCode).toBe(200);
    expect(fhirResponse.json()).toMatchObject({
      resourceType: "Endpoint",
      id: "endpoint-pacs-hai-phong-demo",
      connectionType: {
        code: "dicom-wado-rs"
      },
      managingOrganization: {
        reference: "Organization/department-diagnostic-imaging"
      }
    });
  });

  it("denies nurse encounter creation and finish privileges", async () => {
    const nurseToken = await loginForToken(app, "nurse-demo-001", "nurse");

    const createResponse = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/encounters",
      headers: treatmentHeaders(nurseToken)
    });

    const finishResponse = await app.inject({
      method: "POST",
      url: "/api/v1/encounters/encounter-demo-001/finish",
      headers: treatmentHeaders(nurseToken)
    });

    for (const [response, permission] of [
      [createResponse, "encounter:create"],
      [finishResponse, "encounter:finish"]
    ] as const) {
      expect(response.statusCode).toBe(403);
      expect(response.json()).toMatchObject({
        error: "FORBIDDEN",
        permission
      });
    }
  });
});

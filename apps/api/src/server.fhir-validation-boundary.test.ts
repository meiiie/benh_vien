import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  applyDefaultAuthBoundaryEnv,
  auditHeaders,
  captureAuthBoundaryEnv,
  expectOperationOutcome,
  loginForToken,
  readyServer,
  restoreAuthBoundaryEnv
} from "./server.auth.test-support.js";
import { fhirRequestHeaders } from "./server.fhir.test-support.js";

describe("API FHIR validation boundary", () => {
  let app: FastifyInstance;
  const originalEnv = captureAuthBoundaryEnv();

  beforeEach(() => {
    applyDefaultAuthBoundaryEnv();
  });

  afterEach(async () => {
    await app.close();
    restoreAuthBoundaryEnv(originalEnv);
  });

  async function readyAuditorSession(): Promise<string> {
    app = await readyServer();
    return loginForToken(app, "security-officer-demo", "auditor");
  }

  it("negotiates validation errors as FHIR OperationOutcome when requested", async () => {
    const auditorToken = await readyAuditorSession();

    const fhirResponse = await app.inject({
      method: "GET",
      url: "/api/v1/audit-events?limit=0",
      headers: fhirRequestHeaders({
        ...auditHeaders(auditorToken),
        "x-request-id": "fhir-validation-error-001"
      })
    });

    expectOperationOutcome(fhirResponse, {
      statusCode: 400,
      code: "invalid",
      detailsCode: "VALIDATION_ERROR"
    });
    expect(fhirResponse.json()).toMatchObject({
      issue: [
        {
          diagnostics: expect.any(String),
          expression: ["limit"]
        }
      ]
    });

    const jsonResponse = await app.inject({
      method: "GET",
      url: "/api/v1/audit-events?limit=0",
      headers: {
        ...auditHeaders(auditorToken),
        "x-request-id": "json-validation-error-001"
      }
    });

    expect(jsonResponse.statusCode).toBe(400);
    expect(String(jsonResponse.headers["content-type"])).toContain("application/json");
    expect(jsonResponse.json()).toMatchObject({
      error: "VALIDATION_ERROR",
      message: "Request validation failed.",
      requestId: "json-validation-error-001"
    });
  });
});

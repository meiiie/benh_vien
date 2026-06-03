import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { ProviderDirectoryRepository } from "@benh-vien-so/domain";
import { buildServer } from "./server.js";
import {
  applyDefaultAuthBoundaryEnv,
  bundleTransferHeaders,
  captureAuthBoundaryEnv,
  jsonRequestHeaders,
  loginForToken,
  readyServer,
  restoreAuthBoundaryEnv,
  treatmentHeaders,
  uuidPattern
} from "./server.auth.test-support.js";

describe("API HTTP envelope boundary", () => {
  let app: FastifyInstance | undefined;
  const originalEnv = captureAuthBoundaryEnv();

  beforeEach(() => {
    applyDefaultAuthBoundaryEnv();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
      app = undefined;
    }

    restoreAuthBoundaryEnv(originalEnv);
  });

  it("sets baseline HTTP security headers", async () => {
    app = await readyServer();

    const response = await app.inject({
      method: "GET",
      url: "/health"
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["x-frame-options"]).toBe("DENY");
    expect(response.headers["referrer-policy"]).toBe("no-referrer");
    expect(response.headers["permissions-policy"]).toBe(
      "camera=(), microphone=(), geolocation=()"
    );
    expect(response.headers["cross-origin-resource-policy"]).toBe("same-site");
    expect(response.headers["cache-control"]).toBe("no-store");
    expect(response.headers.pragma).toBe("no-cache");
  });

  it("echoes the request id header for trace correlation", async () => {
    app = await readyServer();

    const response = await app.inject({
      method: "GET",
      url: "/health",
      headers: {
        "x-request-id": "trace-demo-001"
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["x-request-id"]).toBe("trace-demo-001");
  });

  it("replaces unsafe upstream request ids before echoing them", async () => {
    app = await readyServer();

    const healthResponse = await app.inject({
      method: "GET",
      url: "/health",
      headers: {
        "x-request-id": "bad trace id with spaces"
      }
    });
    const replacementRequestId = String(healthResponse.headers["x-request-id"]);

    expect(healthResponse.statusCode).toBe(200);
    expect(replacementRequestId).not.toBe("bad trace id with spaces");
    expect(replacementRequestId).toMatch(uuidPattern);

    const validationResponse = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      headers: jsonRequestHeaders({
        "x-request-id": "x".repeat(129)
      }),
      payload: {
        username: "practitioner-demo-001"
      }
    });
    const validationBody = validationResponse.json();

    expect(validationResponse.statusCode).toBe(400);
    expect(validationBody).toMatchObject({
      error: "VALIDATION_ERROR",
      requestId: expect.stringMatching(uuidPattern)
    });
    expect(validationBody.requestId).not.toBe("x".repeat(129));
  });

  it("adds request ids to manual JSON error envelopes", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-missing-001/fhir-bundle",
      headers: {
        ...bundleTransferHeaders(accessToken),
        "x-request-id": "manual-json-error-001"
      }
    });

    expect(response.statusCode).toBe(404);
    expect(String(response.headers["content-type"])).toContain("application/json");
    expect(response.json()).toMatchObject({
      error: "PATIENT_NOT_FOUND",
      requestId: "manual-json-error-001"
    });
  });

  it("returns a safe validation error envelope with request id", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/provider-directory/InvalidResource/provider-demo/fhir",
      headers: {
        ...treatmentHeaders(accessToken),
        "x-request-id": "validation-trace-demo-001"
      }
    });
    const body = response.json();

    expect(response.statusCode).toBe(400);
    expect(body).toMatchObject({
      error: "VALIDATION_ERROR",
      message: "Request validation failed.",
      requestId: "validation-trace-demo-001",
      issues: expect.any(Array)
    });
    expect(JSON.stringify(body)).not.toContain("stack");
  });

  it("returns a safe internal error envelope without leaking implementation details", async () => {
    const throwingProviderDirectoryRepository: ProviderDirectoryRepository = {
      async findDirectory() {
        throw new Error("database credential path leaked");
      },
      async save() {
        return undefined;
      }
    };
    app = await buildServer({
      logger: false,
      providerDirectoryRepository: throwingProviderDirectoryRepository
    });
    await app.ready();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/provider-directory",
      headers: {
        ...treatmentHeaders(accessToken),
        "x-request-id": "internal-trace-demo-001"
      }
    });
    const body = response.json();
    const serializedBody = JSON.stringify(body);

    expect(response.statusCode).toBe(500);
    expect(body).toMatchObject({
      error: "INTERNAL_SERVER_ERROR",
      message: "Unexpected internal server error.",
      requestId: "internal-trace-demo-001"
    });
    expect(serializedBody).not.toContain("database credential path leaked");
    expect(serializedBody).not.toContain("stack");
  });
});

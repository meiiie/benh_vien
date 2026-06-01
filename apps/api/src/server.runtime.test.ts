import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { ProviderDirectoryRepository } from "@benh-vien-so/domain";
import type { LoginRateLimiter } from "./modules/auth/login-rate-limit.js";
import { buildServer } from "./server.js";
import {
  applyDefaultAuthBoundaryEnv,
  auditHeaders,
  bundleTransferHeaders,
  captureAuthBoundaryEnv,
  loginForToken,
  operationsHeaders,
  readyServer,
  restoreAuthBoundaryEnv,
  treatmentHeaders,
  uuidPattern
} from "./server.auth.test-support.js";

describe("API runtime and HTTP envelope boundary", () => {
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

  it("returns readiness checks for repository-backed dependencies", async () => {
    app = await readyServer();

    const response = await app.inject({
      method: "GET",
      url: "/ready"
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body).toMatchObject({
      status: "ready",
      service: "benh-vien-so-api",
      repository: "in-memory",
      checks: {
        patients: {
          status: "ok",
          count: 1
        },
        providerDirectory: {
          status: "ok",
          organizations: expect.any(Number),
          practitioners: expect.any(Number),
          endpoints: expect.any(Number)
        },
        loginRateLimit: {
          status: "ok",
          store: "memory"
        }
      }
    });
    expect(body.latencyMs).toEqual(expect.any(Number));
  });

  it("returns redacted runtime metadata for unauthenticated web compatibility checks", async () => {
    app = await readyServer();

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/runtime"
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body).toMatchObject({
      service: "benh-vien-so-api",
      product: "WiiiCare Nexus",
      version: "0.2.0",
      publicApiBaseUrl: expect.stringContaining("/api/v1"),
      operationalDiagnostics: {
        available: false,
        reason: expect.any(String)
      },
      features: {
        apiDocsEnabled: null,
        recordTransferDeliveryAttempts: true,
        recordTransferDeliveryWorkerEnabled: null,
        recordTransferRetryWorkerEnabled: null
      }
    });
    expect(body).not.toHaveProperty("repository");
    expect(body).not.toHaveProperty("nodeEnv");
    expect(body).not.toHaveProperty("httpBodyLimitBytes");
    expect(Date.parse(body.checkedAt)).not.toBeNaN();
  });

  it("returns runtime diagnostics to operations and audit sessions", async () => {
    app = await readyServer();
    const adminToken = await loginForToken(app, "admin-demo", "admin");
    const auditorToken = await loginForToken(app, "security-officer-demo", "auditor");

    const operationsResponse = await app.inject({
      method: "GET",
      url: "/api/v1/runtime",
      headers: operationsHeaders(adminToken)
    });
    const auditResponse = await app.inject({
      method: "GET",
      url: "/api/v1/runtime",
      headers: auditHeaders(auditorToken)
    });

    expect(operationsResponse.statusCode).toBe(200);
    const operationsBody = operationsResponse.json();
    expect(operationsBody).toMatchObject({
      repository: "in-memory",
      nodeEnv: expect.any(String),
      httpBodyLimitBytes: 1_048_576,
      operationalDiagnostics: {
        available: true
      },
      features: {
        apiDocsEnabled: true,
        recordTransferDeliveryAttempts: true,
        recordTransferDeliveryWorkerEnabled: false,
        recordTransferRetryWorkerEnabled: false
      }
    });
    expect(auditResponse.statusCode).toBe(200);
    expect(auditResponse.json()).toMatchObject({
      operationalDiagnostics: {
        available: true
      },
      features: {
        apiDocsEnabled: true
      }
    });
    expect(Date.parse(operationsBody.checkedAt)).not.toBeNaN();
  });

  it("marks readiness as not ready when the login rate limit store is unhealthy", async () => {
    const unhealthyLoginRateLimiter: LoginRateLimiter = {
      async consume() {
        return {
          limited: false
        };
      },
      async check() {
        return {
          status: "error",
          store: "valkey",
          message: "Valkey rate limit store is unavailable."
        };
      }
    };
    app = await buildServer({
      logger: false,
      loginRateLimiter: unhealthyLoginRateLimiter
    });
    await app.ready();

    const response = await app.inject({
      method: "GET",
      url: "/ready"
    });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toMatchObject({
      status: "not_ready",
      checks: {
        patients: {
          status: "ok"
        },
        providerDirectory: {
          status: "ok"
        },
        loginRateLimit: {
          status: "error",
          store: "valkey"
        }
      }
    });
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

  it("serves API documentation outside production by default", async () => {
    delete process.env.BVS_API_DOCS_ENABLED;
    app = await readyServer();

    const response = await app.inject({
      method: "GET",
      url: "/docs/"
    });

    expect(response.statusCode).toBe(200);
    expect(String(response.headers["content-type"])).toContain("text/html");
  });

  it("can disable API documentation through runtime configuration", async () => {
    process.env.BVS_API_DOCS_ENABLED = "false";
    app = await readyServer();

    const docsResponse = await app.inject({
      method: "GET",
      url: "/docs/"
    });
    const adminToken = await loginForToken(app, "admin-demo", "admin");
    const runtimeResponse = await app.inject({
      method: "GET",
      url: "/api/v1/runtime",
      headers: operationsHeaders(adminToken)
    });

    expect(docsResponse.statusCode).toBe(404);
    expect(runtimeResponse.statusCode).toBe(200);
    expect(runtimeResponse.json()).toMatchObject({
      features: {
        apiDocsEnabled: false
      }
    });
  });

  it("rejects invalid API documentation feature flag values", async () => {
    process.env.BVS_API_DOCS_ENABLED = "sometimes";

    await expect(buildServer({ logger: false })).rejects.toThrow(
      "BVS_API_DOCS_ENABLED must be either 'true' or 'false'."
    );
  });

  it("rejects invalid HTTP body limit configuration", async () => {
    for (const value of ["512", "10485761", "1.5", "not-a-number"]) {
      process.env.BVS_HTTP_BODY_LIMIT_BYTES = value;

      await expect(buildServer({ logger: false })).rejects.toThrow(
        "BVS_HTTP_BODY_LIMIT_BYTES must be an integer between 1024 and 10485760."
      );
    }
  });

  it("rejects oversized JSON request bodies with a safe request error", async () => {
    process.env.BVS_HTTP_BODY_LIMIT_BYTES = "1024";
    app = await readyServer();

    const response = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      headers: {
        "content-type": "application/json",
        "x-request-id": "body-too-large-001"
      },
      payload: {
        username: "practitioner-demo-001",
        password: "x".repeat(2_000),
        role: "clinician"
      }
    });

    expect(response.statusCode).toBe(413);
    expect(response.json()).toMatchObject({
      error: "REQUEST_ERROR",
      requestId: "body-too-large-001"
    });
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
      headers: {
        "content-type": "application/json",
        "x-request-id": "x".repeat(129)
      },
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

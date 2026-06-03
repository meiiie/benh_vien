import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { LoginRateLimiter } from "./modules/auth/login-rate-limit.js";
import { buildServer } from "./server.js";
import {
  applyDefaultAuthBoundaryEnv,
  auditHeaders,
  captureAuthBoundaryEnv,
  loginForToken,
  operationsHeaders,
  readyServer,
  restoreAuthBoundaryEnv
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
});

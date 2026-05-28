import Fastify, { type FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { ProviderDirectoryRepository } from "@benh-vien-so/domain";
import { registerAuthRoutes } from "./modules/auth/auth-routes.js";
import { createMemoryLoginRateLimiter } from "./modules/auth/login-rate-limit.js";
import type { LoginRateLimiter } from "./modules/auth/login-rate-limit.js";
import {
  buildRecordTransferCallbackSignature,
  recordTransferCallbackKeyIdHeader,
  recordTransferCallbackSignatureHeader,
  recordTransferCallbackTimestampHeader
} from "./modules/record-transfers/record-transfer-callback-signature.js";
import { buildServer } from "./server.js";

const testSecret = "wiiicare-test-secret-at-least-32-characters";
const callbackSecret = "wiiicare-record-transfer-callback-secret-for-tests";
const callbackKeyId = "gateway-hai-phong-referral";
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe("API auth and RBAC boundary", () => {
  let app: FastifyInstance | undefined;
  const originalRepository = process.env.BVS_REPOSITORY;
  const originalAuthSecret = process.env.BVS_AUTH_SECRET;
  const originalAuthTokenTtlSeconds = process.env.BVS_AUTH_TOKEN_TTL_SECONDS;
  const originalCorsOrigins = process.env.BVS_CORS_ORIGINS;
  const originalDatabaseUrl = process.env.DATABASE_URL;
  const originalNodeEnv = process.env.NODE_ENV;
  const originalPublicApiBaseUrl = process.env.BVS_PUBLIC_API_BASE_URL;
  const originalAuthLoginRateLimitMax = process.env.BVS_AUTH_LOGIN_RATE_LIMIT_MAX;
  const originalAuthLoginRateLimitWindowSeconds =
    process.env.BVS_AUTH_LOGIN_RATE_LIMIT_WINDOW_SECONDS;
  const originalRateLimitStore = process.env.BVS_RATE_LIMIT_STORE;
  const originalValkeyUrl = process.env.BVS_VALKEY_URL;
  const originalDemoAuthEnabled = process.env.BVS_DEMO_AUTH_ENABLED;
  const originalRecordTransferRetryWorkerEnabled =
    process.env.BVS_RECORD_TRANSFER_RETRY_WORKER_ENABLED;
  const originalRecordTransferDeliveryWorkerEnabled =
    process.env.BVS_RECORD_TRANSFER_DELIVERY_WORKER_ENABLED;
  const originalRecordTransferCallbackSecret =
    process.env.BVS_RECORD_TRANSFER_CALLBACK_SECRET;
  const originalRecordTransferCallbackSecretsJson =
    process.env.BVS_RECORD_TRANSFER_CALLBACK_SECRETS_JSON;

  beforeEach(() => {
    process.env.BVS_REPOSITORY = "in-memory";
    process.env.BVS_AUTH_SECRET = testSecret;
    process.env.BVS_RECORD_TRANSFER_RETRY_WORKER_ENABLED = "false";
    process.env.BVS_RECORD_TRANSFER_DELIVERY_WORKER_ENABLED = "false";
  });

  afterEach(async () => {
    if (app) {
      await app.close();
      app = undefined;
    }

    restoreEnv("BVS_REPOSITORY", originalRepository);
    restoreEnv("BVS_AUTH_SECRET", originalAuthSecret);
    restoreEnv("BVS_AUTH_TOKEN_TTL_SECONDS", originalAuthTokenTtlSeconds);
    restoreEnv("BVS_CORS_ORIGINS", originalCorsOrigins);
    restoreEnv("DATABASE_URL", originalDatabaseUrl);
    restoreEnv("NODE_ENV", originalNodeEnv);
    restoreEnv("BVS_PUBLIC_API_BASE_URL", originalPublicApiBaseUrl);
    restoreEnv("BVS_AUTH_LOGIN_RATE_LIMIT_MAX", originalAuthLoginRateLimitMax);
    restoreEnv(
      "BVS_AUTH_LOGIN_RATE_LIMIT_WINDOW_SECONDS",
      originalAuthLoginRateLimitWindowSeconds
    );
    restoreEnv("BVS_RATE_LIMIT_STORE", originalRateLimitStore);
    restoreEnv("BVS_VALKEY_URL", originalValkeyUrl);
    restoreEnv("BVS_DEMO_AUTH_ENABLED", originalDemoAuthEnabled);
    restoreEnv(
      "BVS_RECORD_TRANSFER_RETRY_WORKER_ENABLED",
      originalRecordTransferRetryWorkerEnabled
    );
    restoreEnv(
      "BVS_RECORD_TRANSFER_DELIVERY_WORKER_ENABLED",
      originalRecordTransferDeliveryWorkerEnabled
    );
    restoreEnv(
      "BVS_RECORD_TRANSFER_CALLBACK_SECRET",
      originalRecordTransferCallbackSecret
    );
    restoreEnv(
      "BVS_RECORD_TRANSFER_CALLBACK_SECRETS_JSON",
      originalRecordTransferCallbackSecretsJson
    );
  });

  it("returns a signed demo session for valid credentials", async () => {
    app = await readyServer();

    const response = await login(app, {
      username: "practitioner-demo-001",
      password: "demo",
      role: "clinician"
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.accessToken).toEqual(expect.any(String));
    expect(body.actor).toMatchObject({
      actorId: "practitioner-demo-001",
      displayName: "Bác sĩ điều trị",
      role: "clinician"
    });
  });

  it("uses the configured auth token TTL for demo sessions", async () => {
    process.env.BVS_AUTH_TOKEN_TTL_SECONDS = "600";
    app = await readyServer();

    const issuedAt = Date.now();
    const response = await login(app, {
      username: "practitioner-demo-001",
      password: "demo",
      role: "clinician"
    });
    const body = response.json();
    const ttlSeconds = Math.round((Date.parse(body.expiresAt) - issuedAt) / 1000);

    expect(response.statusCode).toBe(200);
    expect(ttlSeconds).toBeGreaterThanOrEqual(590);
    expect(ttlSeconds).toBeLessThanOrEqual(610);
  });

  it("disables demo login by default in production", async () => {
    process.env.NODE_ENV = "production";
    delete process.env.BVS_DEMO_AUTH_ENABLED;
    app = await readyAuthRouteServer();

    const response = await login(
      app,
      {
        username: "practitioner-demo-001",
        password: "demo",
        role: "clinician"
      },
      {
        "x-request-id": "demo-auth-disabled-001"
      }
    );

    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({
      error: "DEMO_AUTH_DISABLED",
      requestId: "demo-auth-disabled-001"
    });
  });

  it("allows demo login in production only when explicitly enabled", async () => {
    process.env.NODE_ENV = "production";
    process.env.BVS_DEMO_AUTH_ENABLED = "true";
    app = await readyAuthRouteServer();

    const response = await login(app, {
      username: "practitioner-demo-001",
      password: "demo",
      role: "clinician"
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      actor: {
        actorId: "practitioner-demo-001",
        role: "clinician"
      }
    });
  });

  it("returns request ids for auth boundary errors", async () => {
    app = await readyServer();

    const invalidPayloadResponse = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      headers: {
        "content-type": "application/json",
        "x-request-id": "auth-invalid-payload-001"
      },
      payload: {
        username: "practitioner-demo-001"
      }
    });
    expect(invalidPayloadResponse.statusCode).toBe(400);
    expect(invalidPayloadResponse.json()).toMatchObject({
      error: "VALIDATION_ERROR",
      message: "Request validation failed.",
      requestId: "auth-invalid-payload-001"
    });

    const unknownFieldResponse = await app.inject({
      method: "POST",
      url: "/api/v1/auth/login",
      headers: {
        "content-type": "application/json",
        "x-request-id": "auth-unknown-field-001"
      },
      payload: {
        username: "practitioner-demo-001",
        password: "demo",
        role: "clinician",
        actorId: "admin-demo"
      }
    });
    expect(unknownFieldResponse.statusCode).toBe(400);
    expect(unknownFieldResponse.json()).toMatchObject({
      error: "VALIDATION_ERROR",
      requestId: "auth-unknown-field-001"
    });

    const invalidCredentialsResponse = await login(
      app,
      {
        username: "practitioner-demo-001",
        password: "wrong-password",
        role: "clinician"
      },
      {
        "x-request-id": "auth-invalid-credentials-001"
      }
    );
    expect(invalidCredentialsResponse.statusCode).toBe(401);
    expect(invalidCredentialsResponse.json()).toMatchObject({
      error: "INVALID_CREDENTIALS",
      requestId: "auth-invalid-credentials-001"
    });

    const roleMismatchResponse = await login(
      app,
      {
        username: "practitioner-demo-001",
        password: "demo",
        role: "auditor"
      },
      {
        "x-request-id": "auth-role-mismatch-001"
      }
    );
    expect(roleMismatchResponse.statusCode).toBe(403);
    expect(roleMismatchResponse.json()).toMatchObject({
      error: "ROLE_MISMATCH",
      requestId: "auth-role-mismatch-001",
      expectedRole: "clinician"
    });

    const invalidSessionResponse = await app.inject({
      method: "GET",
      url: "/api/v1/auth/session",
      headers: {
        authorization: "Bearer invalid-token",
        "x-request-id": "auth-invalid-session-001"
      }
    });
    expect(invalidSessionResponse.statusCode).toBe(401);
    expect(invalidSessionResponse.headers["www-authenticate"]).toBe("Bearer");
    expect(invalidSessionResponse.json()).toMatchObject({
      error: "UNAUTHENTICATED",
      requestId: "auth-invalid-session-001"
    });
  });

  it("records successful and failed login attempts in the global audit trail", async () => {
    app = await readyServer();

    const invalidLoginResponse = await login(
      app,
      {
        username: "unknown-login-audit-user",
        password: "wrong-password",
        role: "clinician"
      },
      {
        "x-request-id": "auth-audit-invalid-001"
      }
    );
    expect(invalidLoginResponse.statusCode).toBe(401);

    const clinicianLoginResponse = await login(
      app,
      {
        username: "practitioner-demo-001",
        password: "demo",
        role: "clinician"
      },
      {
        "x-request-id": "auth-audit-success-001"
      }
    );
    expect(clinicianLoginResponse.statusCode).toBe(200);

    const auditorToken = await loginForToken(app, "security-officer-demo", "auditor");
    const auditResponse = await app.inject({
      method: "GET",
      url: "/api/v1/audit-events?limit=25",
      headers: auditHeaders(auditorToken)
    });
    const auditBody = auditResponse.json();
    const failedLoginEvent = auditBody.items.find(
      (event: { readonly metadata?: { readonly requestId?: string } }) =>
        event.metadata?.requestId === "auth-audit-invalid-001"
    );
    const successfulLoginEvent = auditBody.items.find(
      (event: { readonly metadata?: { readonly requestId?: string } }) =>
        event.metadata?.requestId === "auth-audit-success-001"
    );

    expect(auditResponse.statusCode).toBe(200);
    expect(failedLoginEvent).toMatchObject({
      actorId: "anonymous",
      action: "auth.login.failure",
      resourceType: "AuditEvent",
      resourceId: "auth/login",
      purposeOfUse: "OPERATIONS",
      metadata: expect.objectContaining({
        reason: "INVALID_CREDENTIALS",
        requestedRole: "clinician",
        usernameHash: expect.stringMatching(/^[a-f0-9]{64}$/)
      })
    });
    expect(failedLoginEvent.metadata).not.toHaveProperty("username");
    expect(successfulLoginEvent).toMatchObject({
      actorId: "practitioner-demo-001",
      action: "auth.login.success",
      resourceType: "AuditEvent",
      resourceId: "auth/login",
      purposeOfUse: "OPERATIONS",
      metadata: expect.objectContaining({
        actorRole: "clinician",
        usernameHash: expect.stringMatching(/^[a-f0-9]{64}$/)
      })
    });
    expect(successfulLoginEvent.metadata).not.toHaveProperty("username");
  });

  it("rate limits repeated login attempts for the same identity and client", async () => {
    process.env.BVS_AUTH_LOGIN_RATE_LIMIT_MAX = "2";
    process.env.BVS_AUTH_LOGIN_RATE_LIMIT_WINDOW_SECONDS = "60";
    app = await readyServer();

    for (const requestId of ["auth-rate-limit-001", "auth-rate-limit-002"]) {
      const response = await login(
        app,
        {
          username: "practitioner-demo-001",
          password: "wrong-password",
          role: "clinician"
        },
        {
          "x-request-id": requestId
        }
      );

      expect(response.statusCode).toBe(401);
    }

    const response = await login(
      app,
      {
        username: "practitioner-demo-001",
        password: "wrong-password",
        role: "clinician"
      },
      {
        "x-request-id": "auth-rate-limit-003"
      }
    );
    const body = response.json();

    expect(response.statusCode).toBe(429);
    expect(response.headers["retry-after"]).toEqual(expect.stringMatching(/^[1-9]\d*$/));
    expect(body).toMatchObject({
      error: "AUTH_RATE_LIMITED",
      requestId: "auth-rate-limit-003",
      retryAfterSeconds: expect.any(Number)
    });
    expect(JSON.stringify(body)).not.toContain("stack");
  });

  it("rejects patient access without a Bearer token", async () => {
    app = await readyServer();

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients",
      headers: {
        "x-request-id": "access-unauthenticated-001"
      }
    });

    expect(response.statusCode).toBe(401);
    expect(response.headers["www-authenticate"]).toBe("Bearer");
    expect(response.json()).toMatchObject({
      error: "UNAUTHENTICATED",
      requestId: "access-unauthenticated-001"
    });
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

  it("returns runtime metadata for web compatibility checks", async () => {
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
      repository: "in-memory",
      publicApiBaseUrl: expect.stringContaining("/api/v1"),
      features: {
        recordTransferDeliveryAttempts: true,
        recordTransferDeliveryWorkerEnabled: false,
        recordTransferRetryWorkerEnabled: false
      }
    });
    expect(Date.parse(body.checkedAt)).not.toBeNaN();
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

  it("requires explicit CORS origins in production", async () => {
    process.env.NODE_ENV = "production";
    process.env.BVS_REPOSITORY = "postgres";
    process.env.BVS_PUBLIC_API_BASE_URL = "https://api.wiiicare.example.vn/api/v1";
    delete process.env.BVS_CORS_ORIGINS;

    await expect(buildServer({ logger: false })).rejects.toThrow(
      "BVS_CORS_ORIGINS must be set in production."
    );
  });

  it("rejects unsafe CORS origins in production", async () => {
    process.env.NODE_ENV = "production";
    process.env.BVS_REPOSITORY = "postgres";
    process.env.BVS_PUBLIC_API_BASE_URL = "https://api.wiiicare.example.vn/api/v1";

    for (const [origin, message] of [
      ["*", "BVS_CORS_ORIGINS must not include wildcard '*' in production."],
      ["not-a-url", "BVS_CORS_ORIGINS must contain valid URL origins in production."],
      [
        "http://wiiicare.example.vn",
        "BVS_CORS_ORIGINS must contain canonical HTTPS origins in production."
      ],
      [
        "https://wiiicare.example.vn/app",
        "BVS_CORS_ORIGINS must contain canonical HTTPS origins in production."
      ]
    ] as const) {
      process.env.BVS_CORS_ORIGINS = origin;

      await expect(buildServer({ logger: false })).rejects.toThrow(message);
    }
  });

  it("requires a strong auth secret at startup in production", async () => {
    process.env.NODE_ENV = "production";
    process.env.BVS_CORS_ORIGINS = "https://wiiicare.example.vn";
    delete process.env.BVS_AUTH_SECRET;

    await expect(buildServer({ logger: false })).rejects.toThrow(
      "BVS_AUTH_SECRET must be set to at least 32 characters in production."
    );
  });

  it("rejects placeholder auth secrets at startup in production", async () => {
    process.env.NODE_ENV = "production";
    process.env.BVS_CORS_ORIGINS = "https://wiiicare.example.vn";

    for (const secret of [
      "change-me-with-a-random-secret-of-at-least-32-characters",
      "wiiicare-dev-only-auth-secret-change-before-production"
    ]) {
      process.env.BVS_AUTH_SECRET = secret;

      await expect(buildServer({ logger: false })).rejects.toThrow(
        "BVS_AUTH_SECRET must not use placeholder values in production."
      );
    }
  });

  it("requires a bounded auth token TTL at startup", async () => {
    process.env.NODE_ENV = "production";
    process.env.BVS_CORS_ORIGINS = "https://wiiicare.example.vn";
    process.env.BVS_AUTH_TOKEN_TTL_SECONDS = "60";

    await expect(buildServer({ logger: false })).rejects.toThrow(
      "BVS_AUTH_TOKEN_TTL_SECONDS must be an integer between 300 and 28800."
    );
  });

  it("rejects invalid repository configuration", async () => {
    process.env.BVS_REPOSITORY = "postgresql";

    await expect(buildServer({ logger: false })).rejects.toThrow(
      "BVS_REPOSITORY must be either 'postgres' or 'in-memory'."
    );
  });

  it("requires PostgreSQL repositories in production", async () => {
    process.env.NODE_ENV = "production";
    process.env.BVS_CORS_ORIGINS = "https://wiiicare.example.vn";
    process.env.BVS_REPOSITORY = "in-memory";

    await expect(buildServer({ logger: false })).rejects.toThrow(
      "BVS_REPOSITORY must be 'postgres' in production."
    );
  });

  it("requires a public API base URL in production", async () => {
    process.env.NODE_ENV = "production";
    process.env.BVS_REPOSITORY = "postgres";
    delete process.env.BVS_PUBLIC_API_BASE_URL;

    await expect(buildServer({ logger: false })).rejects.toThrow(
      "BVS_PUBLIC_API_BASE_URL must be set in production."
    );
  });

  it("rejects invalid public API base URLs", async () => {
    process.env.BVS_PUBLIC_API_BASE_URL = "not-a-url";

    await expect(buildServer({ logger: false })).rejects.toThrow(
      "BVS_PUBLIC_API_BASE_URL must be a valid absolute URL."
    );
  });

  it("rejects public API base URLs with query or fragment", async () => {
    process.env.BVS_PUBLIC_API_BASE_URL =
      "https://api.wiiicare.example.vn/api/v1?tenant=demo";

    await expect(buildServer({ logger: false })).rejects.toThrow(
      "BVS_PUBLIC_API_BASE_URL must not include query or fragment."
    );
  });

  it("requires HTTPS public API base URLs in production", async () => {
    process.env.NODE_ENV = "production";
    process.env.BVS_REPOSITORY = "postgres";
    process.env.BVS_PUBLIC_API_BASE_URL = "http://api.wiiicare.example.vn/api/v1";

    await expect(buildServer({ logger: false })).rejects.toThrow(
      "BVS_PUBLIC_API_BASE_URL must use HTTPS in production."
    );
  });

  it("rejects loopback public API base URLs in production", async () => {
    process.env.NODE_ENV = "production";
    process.env.BVS_REPOSITORY = "postgres";

    for (const publicApiBaseUrl of [
      "https://localhost/api/v1",
      "https://127.0.0.1/api/v1",
      "https://0.0.0.0/api/v1",
      "https://[::1]/api/v1"
    ]) {
      process.env.BVS_PUBLIC_API_BASE_URL = publicApiBaseUrl;

      await expect(buildServer({ logger: false })).rejects.toThrow(
        "BVS_PUBLIC_API_BASE_URL must not use localhost or loopback hosts in production."
      );
    }
  });

  it("serves FHIR CapabilityStatement metadata without a demo session", async () => {
    process.env.BVS_PUBLIC_API_BASE_URL = "https://api.wiiicare.example.vn/api/v1/";
    app = await readyServer();

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/fhir/metadata"
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body).toMatchObject({
      resourceType: "CapabilityStatement",
      fhirVersion: "4.0.1",
      implementation: {
        url: "https://api.wiiicare.example.vn/api/v1"
      },
      rest: [
        {
          mode: "server",
          resource: expect.arrayContaining([
            expect.objectContaining({
              type: "Patient"
            }),
            expect.objectContaining({
              type: "Provenance"
            }),
            expect.objectContaining({
              type: "Bundle"
            }),
            expect.objectContaining({
              type: "AuditEvent"
            })
          ])
        }
      ]
    });
  });

  it("allows clinician treatment access to patient registry", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients",
      headers: treatmentHeaders(accessToken)
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.items).toHaveLength(1);
    expect(body.items[0]).toMatchObject({
      id: "patient-demo-001",
      fullName: "Nguyễn Văn An"
    });
  });

  it("filters treatment patient access by the actor provider organization", async () => {
    app = await readyServer();
    const adminToken = await loginForToken(app, "admin-demo", "admin");
    const clinicianToken = await loginForToken(app, "practitioner-demo-001", "clinician");
    const auditorToken = await loginForToken(app, "security-officer-demo", "auditor");

    const createResponse = await app.inject({
      method: "POST",
      url: "/api/v1/patients",
      headers: {
        ...treatmentHeaders(adminToken),
        "content-type": "application/json"
      },
      payload: {
        identifiers: [
          {
            system: "urn:benh-vien-so:mrn",
            value: "MRN-OUTSIDE-TEST",
            type: "hospital-mrn"
          }
        ],
        fullName: "Outside Hospital Patient",
        gender: "unknown",
        managingOrganizationId: "hospital-outside-demo"
      }
    });
    const outsidePatientId = createResponse.json().id as string;

    expect(createResponse.statusCode).toBe(201);

    const clinicianListResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients",
      headers: treatmentHeaders(clinicianToken)
    });
    const clinicianPatientIds = clinicianListResponse
      .json()
      .items.map((patient: { readonly id: string }) => patient.id);

    expect(clinicianListResponse.statusCode).toBe(200);
    expect(clinicianPatientIds).toContain("patient-demo-001");
    expect(clinicianPatientIds).not.toContain(outsidePatientId);

    const clinicianReadResponse = await app.inject({
      method: "GET",
      url: `/api/v1/patients/${outsidePatientId}`,
      headers: {
        ...treatmentHeaders(clinicianToken),
        "x-request-id": "patient-abac-denied-001"
      }
    });

    expect(clinicianReadResponse.statusCode).toBe(403);
    expect(clinicianReadResponse.json()).toMatchObject({
      error: "PATIENT_ACCESS_DENIED",
      requestId: "patient-abac-denied-001",
      patientId: outsidePatientId,
      actor: {
        id: "practitioner-demo-001",
        role: "clinician",
        purposeOfUse: "TREATMENT"
      }
    });

    for (const [url, requestId] of [
      [`/api/v1/patients/${outsidePatientId}/encounters`, "encounter-list-abac-denied-001"],
      [
        `/api/v1/patients/${outsidePatientId}/allergy-intolerances`,
        "allergy-list-abac-denied-001"
      ],
      [`/api/v1/patients/${outsidePatientId}/conditions`, "condition-list-abac-denied-001"],
      [
        `/api/v1/patients/${outsidePatientId}/medication-requests`,
        "medication-request-list-abac-denied-001"
      ],
      [
        `/api/v1/patients/${outsidePatientId}/medication-dispenses`,
        "medication-dispense-list-abac-denied-001"
      ],
      [
        `/api/v1/patients/${outsidePatientId}/medication-administrations`,
        "medication-administration-list-abac-denied-001"
      ],
      [`/api/v1/patients/${outsidePatientId}/documents`, "document-list-abac-denied-001"],
      [`/api/v1/patients/${outsidePatientId}/observations`, "observation-list-abac-denied-001"],
      [
        `/api/v1/patients/${outsidePatientId}/service-requests`,
        "service-request-list-abac-denied-001"
      ],
      [
        `/api/v1/patients/${outsidePatientId}/workflow-tasks`,
        "workflow-task-list-abac-denied-001"
      ],
      [`/api/v1/patients/${outsidePatientId}/procedures`, "procedure-list-abac-denied-001"],
      [
        `/api/v1/patients/${outsidePatientId}/diagnostic-reports`,
        "diagnostic-report-list-abac-denied-001"
      ],
      [
        `/api/v1/patients/${outsidePatientId}/imaging-studies`,
        "imaging-study-list-abac-denied-001"
      ],
      [`/api/v1/patients/${outsidePatientId}/consents`, "consent-list-abac-denied-001"],
      [
        `/api/v1/patients/${outsidePatientId}/record-transfers`,
        "record-transfer-list-abac-denied-001"
      ]
    ] as const) {
      const response = await app.inject({
        method: "GET",
        url,
        headers: {
          ...treatmentHeaders(clinicianToken),
          "x-request-id": requestId
        }
      });

      expect(response.statusCode).toBe(403);
      expect(response.json()).toMatchObject({
        error: "PATIENT_ACCESS_DENIED",
        requestId,
        patientId: outsidePatientId
      });
    }

    const outsideEncounterResponse = await app.inject({
      method: "POST",
      url: `/api/v1/patients/${outsidePatientId}/encounters`,
      headers: {
        ...treatmentHeaders(adminToken),
        "content-type": "application/json"
      },
      payload: {
        class: "ambulatory",
        serviceType: "Khám ngoài tổ chức",
        reasonText: "Encounter ngoài tổ chức để kiểm tra ABAC.",
        attendingPractitionerId: "practitioner-demo-003",
        startedAt: "2026-05-28T00:30:00.000Z"
      }
    });
    const outsideEncounterId = outsideEncounterResponse.json().id as string;

    expect(outsideEncounterResponse.statusCode).toBe(201);

    const outsideAllergyResponse = await app.inject({
      method: "POST",
      url: `/api/v1/patients/${outsidePatientId}/allergy-intolerances`,
      headers: {
        ...treatmentHeaders(adminToken),
        "content-type": "application/json"
      },
      payload: {
        encounterId: outsideEncounterId,
        type: "allergy",
        category: "medication",
        code: {
          system: "http://snomed.info/sct",
          code: "91936005",
          display: "Allergy to penicillin"
        },
        recorderPractitionerId: "practitioner-demo-003"
      }
    });
    const outsideAllergyId = outsideAllergyResponse.json().id as string;

    expect(outsideAllergyResponse.statusCode).toBe(201);

    const outsideConditionResponse = await app.inject({
      method: "POST",
      url: `/api/v1/patients/${outsidePatientId}/conditions`,
      headers: {
        ...treatmentHeaders(adminToken),
        "content-type": "application/json"
      },
      payload: {
        encounterId: outsideEncounterId,
        category: "encounter-diagnosis",
        code: {
          system: "http://hl7.org/fhir/sid/icd-10",
          code: "J18.9",
          display: "Pneumonia, unspecified organism"
        },
        recorderPractitionerId: "practitioner-demo-003"
      }
    });
    const outsideConditionId = outsideConditionResponse.json().id as string;

    expect(outsideConditionResponse.statusCode).toBe(201);

    const outsideDocumentResponse = await app.inject({
      method: "POST",
      url: `/api/v1/patients/${outsidePatientId}/documents`,
      headers: {
        ...treatmentHeaders(adminToken),
        "content-type": "application/json"
      },
      payload: {
        type: "referral-letter",
        title: "Outside referral letter",
        storageUri: "s3://wiiicare-test/outside/referral-letter.pdf",
        authorPractitionerId: "practitioner-demo-003"
      }
    });
    const outsideDocumentId = outsideDocumentResponse.json().id as string;

    expect(outsideDocumentResponse.statusCode).toBe(201);

    const outsideObservationResponse = await app.inject({
      method: "POST",
      url: `/api/v1/patients/${outsidePatientId}/observations`,
      headers: {
        ...treatmentHeaders(adminToken),
        "content-type": "application/json"
      },
      payload: {
        category: "vital-signs",
        code: {
          system: "http://loinc.org",
          code: "8310-5",
          display: "Body temperature"
        },
        effectiveAt: "2026-05-28T01:00:00.000Z",
        valueQuantity: {
          value: 37,
          unit: "Cel",
          system: "http://unitsofmeasure.org",
          code: "Cel"
        },
        performerPractitionerId: "practitioner-demo-001"
      }
    });
    const outsideObservationId = outsideObservationResponse.json().id as string;

    expect(outsideObservationResponse.statusCode).toBe(201);

    const outsideMedicationRequestResponse = await app.inject({
      method: "POST",
      url: `/api/v1/patients/${outsidePatientId}/medication-requests`,
      headers: {
        ...treatmentHeaders(adminToken),
        "content-type": "application/json"
      },
      payload: {
        encounterId: outsideEncounterId,
        reasonConditionId: outsideConditionId,
        category: "outpatient",
        medicationCode: {
          system: "http://www.whocc.no/atc",
          code: "J01CA04",
          display: "Amoxicillin"
        },
        dosageInstruction: {
          text: "Take 500 mg every 8 hours",
          route: "Oral route",
          doseQuantity: {
            value: 500,
            unit: "mg",
            system: "http://unitsofmeasure.org",
            code: "mg"
          },
          frequency: 3,
          period: 1,
          periodUnit: "d"
        },
        requesterPractitionerId: "practitioner-demo-003",
        expectedSupplyDurationDays: 7
      }
    });
    const outsideMedicationRequestId = outsideMedicationRequestResponse.json().id as string;

    expect(outsideMedicationRequestResponse.statusCode).toBe(201);

    const outsideMedicationDispenseResponse = await app.inject({
      method: "POST",
      url: `/api/v1/patients/${outsidePatientId}/medication-dispenses`,
      headers: {
        ...treatmentHeaders(adminToken),
        "content-type": "application/json"
      },
      payload: {
        encounterId: outsideEncounterId,
        medicationRequestId: outsideMedicationRequestId,
        status: "completed",
        category: "outpatient",
        medicationCode: {
          system: "http://www.whocc.no/atc",
          code: "J01CA04",
          display: "Amoxicillin"
        },
        quantity: {
          value: 21,
          unit: "tablet",
          system: "http://unitsofmeasure.org",
          code: "{tablet}"
        },
        daysSupply: {
          value: 7,
          unit: "day",
          system: "http://unitsofmeasure.org",
          code: "d"
        },
        whenPrepared: "2026-05-28T01:10:00.000Z",
        whenHandedOver: "2026-05-28T01:15:00.000Z",
        dispenserPractitionerId: "nurse-demo-001",
        receiverPractitionerId: "nurse-demo-001",
        dosageInstruction: {
          text: "Take 500 mg every 8 hours",
          route: "Oral route",
          doseQuantity: {
            value: 500,
            unit: "mg",
            system: "http://unitsofmeasure.org",
            code: "mg"
          },
          frequency: 3,
          period: 1,
          periodUnit: "d"
        }
      }
    });
    const outsideMedicationDispenseId = outsideMedicationDispenseResponse.json()
      .id as string;

    expect(outsideMedicationDispenseResponse.statusCode).toBe(201);

    const outsideMedicationAdministrationResponse = await app.inject({
      method: "POST",
      url: `/api/v1/patients/${outsidePatientId}/medication-administrations`,
      headers: {
        ...treatmentHeaders(adminToken),
        "content-type": "application/json"
      },
      payload: {
        encounterId: outsideEncounterId,
        medicationRequestId: outsideMedicationRequestId,
        reasonConditionId: outsideConditionId,
        status: "completed",
        category: "outpatient",
        medicationCode: {
          system: "http://www.whocc.no/atc",
          code: "J01CA04",
          display: "Amoxicillin"
        },
        effectivePeriod: {
          start: "2026-05-28T01:20:00.000Z"
        },
        performers: [
          {
            actorType: "Practitioner",
            actorId: "nurse-demo-001"
          }
        ],
        dosage: {
          text: "Take 500 mg every 8 hours",
          route: {
            system: "http://snomed.info/sct",
            code: "26643006",
            display: "Oral route"
          },
          doseQuantity: {
            value: 500,
            unit: "mg",
            system: "http://unitsofmeasure.org",
            code: "mg"
          }
        }
      }
    });
    const outsideMedicationAdministrationId = outsideMedicationAdministrationResponse.json()
      .id as string;

    expect(outsideMedicationAdministrationResponse.statusCode).toBe(201);

    const outsideServiceRequestResponse = await app.inject({
      method: "POST",
      url: `/api/v1/patients/${outsidePatientId}/service-requests`,
      headers: {
        ...treatmentHeaders(adminToken),
        "content-type": "application/json"
      },
      payload: {
        encounterId: outsideEncounterId,
        reasonConditionId: outsideConditionId,
        category: "laboratory",
        code: {
          system: "http://loinc.org",
          code: "58410-2",
          display: "Complete blood count panel"
        },
        requesterPractitionerId: "practitioner-demo-003"
      }
    });
    const outsideServiceRequestId = outsideServiceRequestResponse.json().id as string;

    expect(outsideServiceRequestResponse.statusCode).toBe(201);

    const outsideDiagnosticReportResponse = await app.inject({
      method: "POST",
      url: `/api/v1/patients/${outsidePatientId}/diagnostic-reports`,
      headers: {
        ...treatmentHeaders(adminToken),
        "content-type": "application/json"
      },
      payload: {
        encounterId: outsideEncounterId,
        basedOnServiceRequestId: outsideServiceRequestId,
        category: "laboratory",
        code: {
          system: "http://loinc.org",
          code: "58410-2",
          display: "Complete blood count panel"
        },
        effectiveAt: "2026-05-28T01:30:00.000Z",
        issuedAt: "2026-05-28T01:45:00.000Z",
        performerOrganizationId: "department-laboratory",
        resultsInterpreterPractitionerId: "practitioner-demo-003",
        resultObservationIds: [outsideObservationId],
        conclusion: "Outside diagnostic report for ABAC verification."
      }
    });
    const outsideDiagnosticReportId = outsideDiagnosticReportResponse.json().id as string;

    expect(outsideDiagnosticReportResponse.statusCode).toBe(201);

    const outsideProcedureResponse = await app.inject({
      method: "POST",
      url: `/api/v1/patients/${outsidePatientId}/procedures`,
      headers: {
        ...treatmentHeaders(adminToken),
        "content-type": "application/json"
      },
      payload: {
        encounterId: outsideEncounterId,
        basedOnServiceRequestId: outsideServiceRequestId,
        reasonConditionId: outsideConditionId,
        status: "completed",
        category: "diagnostic",
        code: {
          system: "http://snomed.info/sct",
          code: "168537006",
          display: "Chest X-ray"
        },
        performedPeriod: {
          start: "2026-05-28T02:00:00.000Z",
          end: "2026-05-28T02:10:00.000Z"
        },
        performers: [
          {
            actorType: "Practitioner",
            actorId: "practitioner-demo-003",
            onBehalfOfOrganizationId: "hospital-outside-demo"
          }
        ],
        reportReferences: [
          {
            resourceType: "DiagnosticReport",
            id: outsideDiagnosticReportId
          }
        ],
        note: "Outside procedure for ABAC verification."
      }
    });
    const outsideProcedureId = outsideProcedureResponse.json().id as string;

    expect(outsideProcedureResponse.statusCode).toBe(201);

    const outsideImagingStudyResponse = await app.inject({
      method: "POST",
      url: `/api/v1/patients/${outsidePatientId}/imaging-studies`,
      headers: {
        ...treatmentHeaders(adminToken),
        "content-type": "application/json"
      },
      payload: {
        encounterId: outsideEncounterId,
        basedOnServiceRequestId: outsideServiceRequestId,
        diagnosticReportId: outsideDiagnosticReportId,
        studyInstanceUid: "1.2.826.0.1.3680043.10.543.202605280001",
        accessionNumber: "OUTSIDE-CXR-ABAC-001",
        description: "Outside chest X-ray study for ABAC verification",
        startedAt: "2026-05-28T02:00:00.000Z",
        referrerPractitionerId: "practitioner-demo-003",
        interpreterPractitionerId: "practitioner-demo-003",
        endpointId: "endpoint-pacs-hai-phong-demo",
        series: [
          {
            uid: "1.2.826.0.1.3680043.10.543.202605280001.1",
            number: 1,
            modality: {
              system: "http://dicom.nema.org/resources/ontology/DCM",
              code: "DX",
              display: "Digital Radiography"
            },
            description: "Outside chest radiograph",
            numberOfInstances: 1,
            bodySite: {
              system: "http://snomed.info/sct",
              code: "51185008",
              display: "Thoracic structure"
            }
          }
        ]
      }
    });
    const outsideImagingStudyId = outsideImagingStudyResponse.json().id as string;

    expect(outsideImagingStudyResponse.statusCode).toBe(201);

    const outsideTaskResponse = await app.inject({
      method: "POST",
      url: `/api/v1/patients/${outsidePatientId}/workflow-tasks`,
      headers: {
        ...treatmentHeaders(adminToken),
        "content-type": "application/json"
      },
      payload: {
        encounterId: outsideEncounterId,
        basedOnServiceRequestId: outsideServiceRequestId,
        status: "requested",
        code: {
          system: "urn:wiiicare:nexus:workflow-task",
          code: "lab-order",
          display: "Lab order"
        },
        requesterPractitionerId: "practitioner-demo-003",
        ownerOrganizationId: "hospital-outside-demo"
      }
    });
    const outsideTaskId = outsideTaskResponse.json().id as string;

    expect(outsideTaskResponse.statusCode).toBe(201);

    const outsideConsentResponse = await app.inject({
      method: "POST",
      url: `/api/v1/patients/${outsidePatientId}/consents`,
      headers: {
        ...treatmentHeaders(adminToken),
        "content-type": "application/json"
      },
      payload: {
        category: "record-sharing",
        granteeOrganizationId: "hospital-hai-phong-referral",
        validFrom: "2026-05-28T00:00:00.000Z",
        validUntil: "2026-12-31T23:59:59.000Z"
      }
    });
    const outsideConsentId = outsideConsentResponse.json().id as string;

    expect(outsideConsentResponse.statusCode).toBe(201);

    const outsideTransferResponse = await app.inject({
      method: "POST",
      url: `/api/v1/patients/${outsidePatientId}/record-transfers`,
      headers: {
        ...treatmentHeaders(adminToken),
        "content-type": "application/json"
      },
      payload: {
        bundleType: "document",
        sourceOrganizationId: "hospital-outside-demo",
        recipientOrganizationId: "hospital-hai-phong-referral",
        consentReference: outsideConsentId,
        reason: "Outside transfer for ABAC verification."
      }
    });
    const outsideTransferId = outsideTransferResponse.json().id as string;

    expect(outsideTransferResponse.statusCode).toBe(201);

    for (const [url, requestId] of [
      [`/api/v1/encounters/${outsideEncounterId}`, "encounter-read-abac-denied-001"],
      [
        `/api/v1/allergy-intolerances/${outsideAllergyId}`,
        "allergy-read-abac-denied-001"
      ],
      [`/api/v1/conditions/${outsideConditionId}`, "condition-read-abac-denied-001"],
      [
        `/api/v1/medication-requests/${outsideMedicationRequestId}`,
        "medication-request-read-abac-denied-001"
      ],
      [
        `/api/v1/medication-dispenses/${outsideMedicationDispenseId}`,
        "medication-dispense-read-abac-denied-001"
      ],
      [
        `/api/v1/medication-administrations/${outsideMedicationAdministrationId}`,
        "medication-administration-read-abac-denied-001"
      ],
      [`/api/v1/clinical-documents/${outsideDocumentId}/fhir`, "document-read-abac-denied-001"],
      [`/api/v1/observations/${outsideObservationId}`, "observation-read-abac-denied-001"],
      [
        `/api/v1/service-requests/${outsideServiceRequestId}`,
        "service-request-read-abac-denied-001"
      ],
      [`/api/v1/workflow-tasks/${outsideTaskId}`, "workflow-task-read-abac-denied-001"],
      [`/api/v1/procedures/${outsideProcedureId}`, "procedure-read-abac-denied-001"],
      [
        `/api/v1/diagnostic-reports/${outsideDiagnosticReportId}`,
        "diagnostic-report-read-abac-denied-001"
      ],
      [
        `/api/v1/imaging-studies/${outsideImagingStudyId}`,
        "imaging-study-read-abac-denied-001"
      ],
      [`/api/v1/record-transfers/${outsideTransferId}`, "transfer-read-abac-denied-001"]
    ] as const) {
      const response = await app.inject({
        method: "GET",
        url,
        headers: {
          ...treatmentHeaders(clinicianToken),
          "x-request-id": requestId
        }
      });

      expect(response.statusCode).toBe(403);
      expect(response.json()).toMatchObject({
        error: "PATIENT_ACCESS_DENIED",
        requestId,
        patientId: outsidePatientId
      });
    }

    for (const [url, requestId] of [
      [`/api/v1/encounters/${outsideEncounterId}/fhir`, "encounter-export-abac-denied-001"],
      [
        `/api/v1/allergy-intolerances/${outsideAllergyId}/fhir`,
        "allergy-export-abac-denied-001"
      ],
      [`/api/v1/conditions/${outsideConditionId}/fhir`, "condition-export-abac-denied-001"],
      [
        `/api/v1/medication-requests/${outsideMedicationRequestId}/fhir`,
        "medication-request-export-abac-denied-001"
      ],
      [
        `/api/v1/medication-dispenses/${outsideMedicationDispenseId}/fhir`,
        "medication-dispense-export-abac-denied-001"
      ],
      [
        `/api/v1/medication-administrations/${outsideMedicationAdministrationId}/fhir`,
        "medication-administration-export-abac-denied-001"
      ],
      [
        `/api/v1/service-requests/${outsideServiceRequestId}/fhir`,
        "service-request-export-abac-denied-001"
      ],
      [`/api/v1/workflow-tasks/${outsideTaskId}/fhir`, "workflow-task-export-abac-denied-001"],
      [`/api/v1/procedures/${outsideProcedureId}/fhir`, "procedure-export-abac-denied-001"],
      [
        `/api/v1/diagnostic-reports/${outsideDiagnosticReportId}/fhir`,
        "diagnostic-report-export-abac-denied-001"
      ],
      [
        `/api/v1/imaging-studies/${outsideImagingStudyId}/fhir`,
        "imaging-study-export-abac-denied-001"
      ],
      [`/api/v1/consents/${outsideConsentId}/fhir`, "consent-export-abac-denied-001"]
    ] as const) {
      const response = await app.inject({
        method: "GET",
        url,
        headers: {
          ...treatmentHeaders(clinicianToken),
          "x-request-id": requestId
        }
      });

      expect(response.statusCode).toBe(403);
      expect(response.json()).toMatchObject({
        error: "PATIENT_ACCESS_DENIED",
        requestId,
        patientId: outsidePatientId
      });
    }

    const auditorListResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients",
      headers: auditHeaders(auditorToken)
    });
    const auditorPatientIds = auditorListResponse
      .json()
      .items.map((patient: { readonly id: string }) => patient.id);

    expect(auditorListResponse.statusCode).toBe(200);
    expect(auditorPatientIds).toContain(outsidePatientId);
  });

  it("allows auditor audit-purpose patient registry context", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "security-officer-demo", "auditor");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients",
      headers: auditHeaders(accessToken)
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.items).toHaveLength(1);
    expect(body.items[0]).toMatchObject({
      id: "patient-demo-001"
    });
  });

  it("denies auditor treatment-purpose patient registry context", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "security-officer-demo", "auditor");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients",
      headers: {
        ...treatmentHeaders(accessToken),
        "x-request-id": "access-forbidden-auditor-treatment-001"
      }
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({
      error: "FORBIDDEN",
      permission: "patient:list",
      requestId: "access-forbidden-auditor-treatment-001"
    });
  });

  it("denies auditor attempts to create clinical data", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "security-officer-demo", "auditor");

    const response = await app.inject({
      method: "POST",
      url: "/api/v1/patients",
      headers: {
        ...auditHeaders(accessToken),
        "content-type": "application/json"
      },
      payload: {
        identifiers: [
          {
            system: "urn:benh-vien-so:mrn",
            value: "MRN-DENIED-TEST",
            type: "hospital-mrn"
          }
        ],
        fullName: "RBAC Denied",
        managingOrganizationId: "hospital-hai-phong-demo"
      }
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({
      error: "FORBIDDEN",
      permission: "patient:create"
    });
  });

  it("allows auditor audit-purpose access to patient audit events", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "security-officer-demo", "auditor");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/audit-events",
      headers: auditHeaders(accessToken)
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      items: expect.any(Array)
    });
  });

  it("allows auditor audit-purpose review of global security audit events", async () => {
    app = await readyServer();
    const clinicianToken = await loginForToken(app, "practitioner-demo-001", "clinician");
    const auditorToken = await loginForToken(app, "security-officer-demo", "auditor");

    const forbiddenAuditListResponse = await app.inject({
      method: "GET",
      url: "/api/v1/audit-events",
      headers: {
        ...treatmentHeaders(clinicianToken),
        "x-request-id": "global-audit-clinician-denied-001"
      }
    });

    expect(forbiddenAuditListResponse.statusCode).toBe(403);
    expect(forbiddenAuditListResponse.json()).toMatchObject({
      error: "FORBIDDEN",
      permission: "audit-event:list",
      requestId: "global-audit-clinician-denied-001"
    });

    const deniedResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients",
      headers: {
        ...treatmentHeaders(auditorToken),
        "x-request-id": "global-audit-denied-001"
      }
    });

    expect(deniedResponse.statusCode).toBe(403);
    expect(deniedResponse.json()).toMatchObject({
      error: "FORBIDDEN",
      permission: "patient:list",
      requestId: "global-audit-denied-001"
    });

    const auditResponse = await app.inject({
      method: "GET",
      url: "/api/v1/audit-events?limit=25",
      headers: auditHeaders(auditorToken)
    });
    const auditBody = auditResponse.json();
    const deniedAuditEvent = auditBody.items.find(
      (event: { readonly metadata?: { readonly requestId?: string } }) =>
        event.metadata?.requestId === "global-audit-denied-001"
    );

    expect(auditResponse.statusCode).toBe(200);
    expect(deniedAuditEvent).toMatchObject({
      action: "access.denied",
      resourceType: "Patient",
      resourceId: "patient:list",
      metadata: expect.objectContaining({
        denialCode: "FORBIDDEN",
        deniedPermission: "patient:list",
        deniedActorId: "security-officer-demo",
        deniedActorRole: "auditor",
        deniedActorPurposeOfUse: "TREATMENT",
        route: "GET /api/v1/patients",
        statusCode: 403
      })
    });
    expect(deniedAuditEvent.patientId).toBeUndefined();
  });

  it("stores request id in audit metadata for clinical access", async () => {
    app = await readyServer();
    const clinicianToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const readResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001",
      headers: {
        ...treatmentHeaders(clinicianToken),
        "x-request-id": "audit-trace-demo-001"
      }
    });
    expect(readResponse.statusCode).toBe(200);

    const auditorToken = await loginForToken(app, "security-officer-demo", "auditor");
    const auditResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/audit-events",
      headers: auditHeaders(auditorToken)
    });
    const body = auditResponse.json();

    expect(auditResponse.statusCode).toBe(200);
    expect(body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          action: "patient.read",
          metadata: expect.objectContaining({
            requestId: "audit-trace-demo-001"
          })
        })
      ])
    );
  });

  it("records denied patient access in the patient audit trail and FHIR export", async () => {
    app = await readyServer();
    const adminToken = await loginForToken(app, "admin-demo", "admin");
    const clinicianToken = await loginForToken(app, "practitioner-demo-001", "clinician");
    const auditorToken = await loginForToken(app, "security-officer-demo", "auditor");

    const createResponse = await app.inject({
      method: "POST",
      url: "/api/v1/patients",
      headers: {
        ...treatmentHeaders(adminToken),
        "content-type": "application/json"
      },
      payload: {
        identifiers: [
          {
            system: "urn:benh-vien-so:mrn",
            value: "MRN-DENIED-AUDIT-TEST",
            type: "hospital-mrn"
          }
        ],
        fullName: "Denied Audit Patient",
        gender: "unknown",
        managingOrganizationId: "hospital-outside-demo"
      }
    });
    const outsidePatientId = createResponse.json().id as string;

    expect(createResponse.statusCode).toBe(201);

    const deniedResponse = await app.inject({
      method: "GET",
      url: `/api/v1/patients/${outsidePatientId}`,
      headers: {
        ...treatmentHeaders(clinicianToken),
        "x-request-id": "patient-denied-audit-001"
      }
    });

    expect(deniedResponse.statusCode).toBe(403);
    expect(deniedResponse.json()).toMatchObject({
      error: "PATIENT_ACCESS_DENIED",
      patientId: outsidePatientId,
      requestId: "patient-denied-audit-001"
    });

    const auditResponse = await app.inject({
      method: "GET",
      url: `/api/v1/patients/${outsidePatientId}/audit-events`,
      headers: auditHeaders(auditorToken)
    });
    const auditBody = auditResponse.json();

    expect(auditResponse.statusCode).toBe(200);
    expect(auditBody.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          action: "access.denied",
          resourceType: "Patient",
          resourceId: outsidePatientId,
          patientId: outsidePatientId,
          metadata: expect.objectContaining({
            denialCode: "PATIENT_ACCESS_DENIED",
            deniedActorId: "practitioner-demo-001",
            deniedActorRole: "clinician",
            deniedActorPurposeOfUse: "TREATMENT",
            requestId: "patient-denied-audit-001",
            route: `GET /api/v1/patients/${outsidePatientId}`,
            statusCode: 403
          })
        })
      ])
    );

    const fhirResponse = await app.inject({
      method: "GET",
      url: `/api/v1/patients/${outsidePatientId}/audit-events/fhir-bundle`,
      headers: auditHeaders(auditorToken)
    });
    const fhirBody = fhirResponse.json();
    type FhirAuditEventResource = {
      readonly subtype: readonly { readonly code: string }[];
    };
    const deniedAuditResource = fhirBody.entry
      .map((entry: { readonly resource: FhirAuditEventResource }) => entry.resource)
      .find((resource: FhirAuditEventResource) =>
        resource.subtype.some((subtype) => subtype.code === "access.denied")
      );

    expect(fhirResponse.statusCode).toBe(200);
    expect(deniedAuditResource).toMatchObject({
      resourceType: "AuditEvent",
      action: "E",
      outcome: "4",
      outcomeDesc: "Access denied",
      entity: [
        {
          what: {
            reference: `Patient/${outsidePatientId}`
          },
          name: "access.denied"
        }
      ]
    });
  });

  it("exports patient audit trail as a FHIR AuditEvent Bundle for auditor review", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "security-officer-demo", "auditor");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/audit-events/fhir-bundle",
      headers: auditHeaders(accessToken)
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body).toMatchObject({
      resourceType: "Bundle",
      type: "collection",
      entry: [
        {
          resource: {
            resourceType: "AuditEvent",
            type: {
              code: "rest"
            },
            subtype: [
              {
                code: "audit-event.fhir-export"
              }
            ],
            agent: [
              {
                requestor: true,
                purposeOfUse: [
                  {
                    code: "AUDIT"
                  }
                ]
              }
            ]
          }
        }
      ]
    });
    expect(body.entry[0].resource.entity[0].detail).toContainEqual(
      expect.objectContaining({
        type: "integrityHash",
        valueString: expect.stringMatching(/^[a-f0-9]{64}$/)
      })
    );
  });

  it("denies clinician treatment-purpose export of the audit FHIR Bundle", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/audit-events/fhir-bundle",
      headers: treatmentHeaders(accessToken)
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({
      error: "FORBIDDEN",
      permission: "audit-event:fhir-export"
    });
  });

  it("returns a verified audit integrity report for auditor review", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "security-officer-demo", "auditor");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/audit-integrity",
      headers: auditHeaders(accessToken)
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body).toMatchObject({
      patientId: "patient-demo-001",
      status: "verified",
      verified: true,
      totalEvents: 1,
      sealedEvents: 1
    });
    expect(body.latestHash).toEqual(expect.stringMatching(/^[a-f0-9]{64}$/));
  });

  it("denies nurse FHIR export even with treatment purpose", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "nurse-demo-001", "nurse");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/fhir",
      headers: treatmentHeaders(accessToken)
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({
      error: "FORBIDDEN",
      permission: "patient:fhir-export"
    });
  });

  it("returns a patient-record FHIR Bundle for treatment export", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/fhir-bundle",
      headers: bundleTransferHeaders(accessToken)
    });
    const body = response.json();
    const resourceTypes = body.entry.map(
      (entry: { readonly resource: { readonly resourceType: string } }) =>
        entry.resource.resourceType
    );

    expect(response.statusCode).toBe(200);
    expect(body).toMatchObject({
      resourceType: "Bundle",
      id: "patient-record-patient-demo-001",
      type: "collection"
    });
    expect(resourceTypes).toEqual(
      expect.arrayContaining([
        "Patient",
        "Organization",
        "Practitioner",
        "PractitionerRole",
        "Endpoint",
        "Consent",
        "Encounter",
        "AllergyIntolerance",
        "Condition",
        "ServiceRequest",
        "Task",
        "Procedure",
        "Observation",
        "DiagnosticReport",
        "ImagingStudy",
        "MedicationRequest",
        "MedicationDispense",
        "MedicationAdministration",
        "DocumentReference"
      ])
    );
    expect(body.entry).toHaveLength(47);
  });

  it("returns a patient-record FHIR document Bundle with Composition first", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/fhir-document-bundle",
      headers: bundleTransferHeaders(accessToken)
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body).toMatchObject({
      resourceType: "Bundle",
      id: "patient-document-patient-demo-001",
      type: "document"
    });
    expect(body.entry[0].resource).toMatchObject({
      resourceType: "Composition",
      subject: {
        reference: "Patient/patient-demo-001"
      },
      author: [
        {
          reference: "Practitioner/practitioner-demo-001"
        }
      ]
    });
    expect(body.entry).toHaveLength(48);
    expect(body.entry[0].resource.section).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: "Cơ sở, nhân sự và endpoint liên thông"
        }),
        expect.objectContaining({
          title: "Đồng ý chia sẻ hồ sơ"
        }),
        expect.objectContaining({
          title: "Luồng công việc thực thi chỉ định"
        }),
        expect.objectContaining({
          title: "Thủ thuật và hoạt động đã thực hiện"
        }),
        expect.objectContaining({
          title: "Cấp phát thuốc"
        }),
        expect.objectContaining({
          title: "Dùng thuốc thực tế"
        })
      ])
    );
  });

  it("exports signed clinical document provenance as FHIR Provenance", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

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
          display: "Tóm tắt ra viện - Nguyễn Văn An"
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
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

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
            title: "Tóm tắt ra viện - Nguyễn Văn An",
            creation: "2026-05-27T01:55:00.000Z"
          }
        }
      ]
    });
  });

  it("rejects FHIR Provenance export for an unsigned clinical document", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

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
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

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

  it("negotiates auth and RBAC denials on FHIR endpoints as OperationOutcome", async () => {
    app = await readyServer();
    const nurseToken = await loginForToken(app, "nurse-demo-001", "nurse");
    const auditorToken = await loginForToken(app, "security-officer-demo", "auditor");

    const unauthenticatedResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/fhir",
      headers: {
        accept: "application/fhir+json",
        "x-request-id": "fhir-unauthenticated-001"
      }
    });

    expectOperationOutcome(unauthenticatedResponse, {
      statusCode: 401,
      code: "login",
      detailsCode: "UNAUTHENTICATED"
    });
    expect(String(unauthenticatedResponse.headers["www-authenticate"])).toBe("Bearer");

    const forbiddenResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/fhir",
      headers: {
        ...treatmentHeaders(nurseToken),
        accept: "application/fhir+json",
        "x-request-id": "fhir-forbidden-nurse-export-001"
      }
    });

    expectOperationOutcome(forbiddenResponse, {
      statusCode: 403,
      code: "forbidden",
      detailsCode: "FORBIDDEN"
    });

    const auditResponse = await app.inject({
      method: "GET",
      url: "/api/v1/audit-events?limit=25",
      headers: auditHeaders(auditorToken)
    });
    const auditBody = auditResponse.json();
    const deniedAuditEvent = auditBody.items.find(
      (event: { readonly metadata?: { readonly requestId?: string } }) =>
        event.metadata?.requestId === "fhir-forbidden-nurse-export-001"
    );

    expect(auditResponse.statusCode).toBe(200);
    expect(deniedAuditEvent).toMatchObject({
      action: "access.denied",
      resourceType: "Patient",
      resourceId: "patient:fhir-export",
      metadata: expect.objectContaining({
        denialCode: "FORBIDDEN",
        deniedPermission: "patient:fhir-export",
        deniedActorId: "nurse-demo-001",
        deniedActorRole: "nurse",
        deniedActorPurposeOfUse: "TREATMENT",
        statusCode: 403
      })
    });
  });

  it("negotiates patient-scope ABAC denials on FHIR endpoints as OperationOutcome", async () => {
    app = await readyServer();
    const adminToken = await loginForToken(app, "admin-demo", "admin");
    const clinicianToken = await loginForToken(app, "practitioner-demo-001", "clinician");
    const auditorToken = await loginForToken(app, "security-officer-demo", "auditor");

    const outsidePatientResponse = await app.inject({
      method: "POST",
      url: "/api/v1/patients",
      headers: {
        ...treatmentHeaders(adminToken),
        "content-type": "application/json"
      },
      payload: {
        identifiers: [
          {
            system: "urn:benh-vien-so:mrn",
            value: "MRN-FHIR-ABAC-DENIED",
            type: "hospital-mrn"
          }
        ],
        fullName: "FHIR ABAC Denied Patient",
        gender: "unknown",
        managingOrganizationId: "hospital-outside-fhir-denied"
      }
    });
    const outsidePatient = outsidePatientResponse.json() as { readonly id: string };

    expect(outsidePatientResponse.statusCode).toBe(201);

    const deniedResponse = await app.inject({
      method: "GET",
      url: `/api/v1/patients/${outsidePatient.id}/fhir`,
      headers: {
        ...treatmentHeaders(clinicianToken),
        accept: "application/fhir+json",
        "x-request-id": "fhir-patient-abac-denied-001"
      }
    });

    expectOperationOutcome(deniedResponse, {
      statusCode: 403,
      code: "forbidden",
      detailsCode: "PATIENT_ACCESS_DENIED"
    });

    const auditResponse = await app.inject({
      method: "GET",
      url: `/api/v1/patients/${outsidePatient.id}/audit-events`,
      headers: auditHeaders(auditorToken)
    });
    const auditBody = auditResponse.json();
    const deniedAuditEvent = auditBody.items.find(
      (event: { readonly metadata?: { readonly requestId?: string } }) =>
        event.metadata?.requestId === "fhir-patient-abac-denied-001"
    );

    expect(auditResponse.statusCode).toBe(200);
    expect(deniedAuditEvent).toMatchObject({
      action: "access.denied",
      resourceType: "Patient",
      resourceId: outsidePatient.id,
      patientId: outsidePatient.id,
      metadata: expect.objectContaining({
        denialCode: "PATIENT_ACCESS_DENIED",
        deniedActorId: "practitioner-demo-001",
        deniedActorRole: "clinician",
        deniedActorPurposeOfUse: "TREATMENT",
        statusCode: 403
      })
    });
  });

  it("negotiates validation errors as FHIR OperationOutcome when requested", async () => {
    app = await readyServer();
    const auditorToken = await loginForToken(app, "security-officer-demo", "auditor");

    const fhirResponse = await app.inject({
      method: "GET",
      url: "/api/v1/audit-events?limit=0",
      headers: {
        ...auditHeaders(auditorToken),
        accept: "application/fhir+json",
        "x-request-id": "fhir-validation-error-001"
      }
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

  it("rejects clinical document attachment metadata with invalid MIME type or SHA-1 hash", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const response = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/documents",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json",
        "x-request-id": "clinical-document-validation-001"
      },
      payload: {
        encounterId: "encounter-demo-001",
        type: "lab-report",
        title: "Tài liệu metadata lỗi",
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

  it("returns provider directory and FHIR Endpoint resources", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

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

  it("lists workflow tasks and exports them as FHIR Task", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const listResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/workflow-tasks",
      headers: treatmentHeaders(accessToken)
    });
    const listBody = listResponse.json();

    expect(listResponse.statusCode).toBe(200);
    expect(listBody.items).toHaveLength(2);
    expect(listBody.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "workflow-task-demo-002",
          status: "completed",
          basedOnServiceRequestId: "service-request-demo-002"
        })
      ])
    );

    const fhirResponse = await app.inject({
      method: "GET",
      url: "/api/v1/workflow-tasks/workflow-task-demo-002/fhir",
      headers: treatmentHeaders(accessToken)
    });

    expect(fhirResponse.statusCode).toBe(200);
    expect(fhirResponse.json()).toMatchObject({
      resourceType: "Task",
      id: "workflow-task-demo-002",
      status: "completed",
      focus: {
        reference: "ServiceRequest/service-request-demo-002"
      },
      output: expect.arrayContaining([
        expect.objectContaining({
          valueReference: {
            reference: "ImagingStudy/imaging-study-demo-001",
            display: "Metadata DICOM X-quang ngực"
          }
        })
      ])
    });
  });

  it("lists procedures and exports them as FHIR Procedure", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const listResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/procedures",
      headers: treatmentHeaders(accessToken)
    });
    const listBody = listResponse.json();

    expect(listResponse.statusCode).toBe(200);
    expect(listBody.items).toHaveLength(2);
    expect(listBody.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "procedure-demo-001",
          status: "completed",
          basedOnServiceRequestId: "service-request-demo-002"
        })
      ])
    );

    const fhirResponse = await app.inject({
      method: "GET",
      url: "/api/v1/procedures/procedure-demo-001/fhir",
      headers: treatmentHeaders(accessToken)
    });

    expect(fhirResponse.statusCode).toBe(200);
    expect(fhirResponse.json()).toMatchObject({
      resourceType: "Procedure",
      id: "procedure-demo-001",
      status: "completed",
      basedOn: [
        {
          reference: "ServiceRequest/service-request-demo-002"
        }
      ],
      subject: {
        reference: "Patient/patient-demo-001"
      },
      report: [
        {
          reference: "DiagnosticReport/diagnostic-report-demo-002"
        }
      ]
    });
  });

  it("creates a procedure linked to a service request and diagnostic report", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const response = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/procedures",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json"
      },
      payload: {
        encounterId: "encounter-demo-002",
        basedOnServiceRequestId: "service-request-demo-002",
        reasonConditionId: "condition-demo-002",
        status: "completed",
        category: "diagnostic",
        code: {
          system: "http://snomed.info/sct",
          code: "168537006",
          display: "Chest X-ray"
        },
        performedPeriod: {
          start: "2026-05-27T07:10:00.000Z",
          end: "2026-05-27T07:20:00.000Z"
        },
        performers: [
          {
            actorType: "Practitioner",
            actorId: "practitioner-demo-001",
            onBehalfOfOrganizationId: "department-diagnostic-imaging"
          }
        ],
        reportReferences: [
          {
            resourceType: "DiagnosticReport",
            id: "diagnostic-report-demo-002"
          }
        ],
        note: "Procedure thử nghiệm trong API test."
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      patientId: "patient-demo-001",
      encounterId: "encounter-demo-002",
      basedOnServiceRequestId: "service-request-demo-002",
      category: "diagnostic",
      reportReferences: [
        {
          resourceType: "DiagnosticReport",
          id: "diagnostic-report-demo-002"
        }
      ]
    });
  });

  it("lists allergy intolerances and exports them as FHIR AllergyIntolerance", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const listResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/allergy-intolerances",
      headers: treatmentHeaders(accessToken)
    });
    const listBody = listResponse.json();

    expect(listResponse.statusCode).toBe(200);
    expect(listBody.items).toHaveLength(2);

    const fhirResponse = await app.inject({
      method: "GET",
      url: `/api/v1/allergy-intolerances/${listBody.items[0].id}/fhir`,
      headers: treatmentHeaders(accessToken)
    });

    expect(fhirResponse.statusCode).toBe(200);
    expect(fhirResponse.json()).toMatchObject({
      resourceType: "AllergyIntolerance",
      patient: {
        reference: "Patient/patient-demo-001"
      }
    });
  });

  it("creates an allergy intolerance attached to the selected patient encounter", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const response = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/allergy-intolerances",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json"
      },
      payload: {
        encounterId: "encounter-demo-002",
        type: "allergy",
        category: "medication",
        criticality: "high",
        code: {
          system: "http://snomed.info/sct",
          code: "91936005",
          display: "Allergy to penicillin"
        },
        reaction: {
          manifestation: {
            system: "http://snomed.info/sct",
            code: "271807003",
            display: "Skin rash"
          },
          severity: "moderate"
        },
        recorderPractitionerId: "practitioner-demo-001",
        note: "Cảnh báo dị ứng thử nghiệm trong API test."
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      patientId: "patient-demo-001",
      encounterId: "encounter-demo-002",
      category: "medication",
      type: "allergy"
    });
  });

  it("lists conditions and exports them as FHIR Condition", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const listResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/conditions",
      headers: treatmentHeaders(accessToken)
    });
    const listBody = listResponse.json();

    expect(listResponse.statusCode).toBe(200);
    expect(listBody.items).toHaveLength(2);

    const fhirResponse = await app.inject({
      method: "GET",
      url: `/api/v1/conditions/${listBody.items[0].id}/fhir`,
      headers: treatmentHeaders(accessToken)
    });

    expect(fhirResponse.statusCode).toBe(200);
    expect(fhirResponse.json()).toMatchObject({
      resourceType: "Condition",
      subject: {
        reference: "Patient/patient-demo-001"
      }
    });
  });

  it("creates a condition attached to the selected patient encounter", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const response = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/conditions",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json"
      },
      payload: {
        encounterId: "encounter-demo-002",
        category: "encounter-diagnosis",
        code: {
          system: "http://hl7.org/fhir/sid/icd-10",
          code: "R50.9",
          display: "Sốt chưa rõ nguyên nhân"
        },
        severity: "mild",
        onsetAt: "2026-05-27T00:00:00.000Z",
        recorderPractitionerId: "practitioner-demo-001",
        note: "Chẩn đoán thử nghiệm trong API test."
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      patientId: "patient-demo-001",
      encounterId: "encounter-demo-002",
      category: "encounter-diagnosis"
    });
  });

  it("lists observations and exports them as FHIR Observation", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const listResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/observations",
      headers: treatmentHeaders(accessToken)
    });
    const listBody = listResponse.json();

    expect(listResponse.statusCode).toBe(200);
    expect(listBody.items).toHaveLength(2);

    const fhirResponse = await app.inject({
      method: "GET",
      url: `/api/v1/observations/${listBody.items[0].id}/fhir`,
      headers: treatmentHeaders(accessToken)
    });

    expect(fhirResponse.statusCode).toBe(200);
    expect(fhirResponse.json()).toMatchObject({
      resourceType: "Observation",
      subject: {
        reference: "Patient/patient-demo-001"
      }
    });
  });

  it("creates an observation attached to the selected patient encounter", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const response = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/observations",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json"
      },
      payload: {
        encounterId: "encounter-demo-002",
        category: "vital-signs",
        code: {
          system: "http://loinc.org",
          code: "8867-4",
          display: "Heart rate"
        },
        effectiveAt: "2026-05-27T04:00:00.000Z",
        valueQuantity: {
          value: 78,
          unit: "/min",
          system: "http://unitsofmeasure.org",
          code: "/min"
        },
        performerPractitionerId: "nurse-demo-001"
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      patientId: "patient-demo-001",
      encounterId: "encounter-demo-002",
      category: "vital-signs"
    });
  });

  it("lists medication requests and exports them as FHIR MedicationRequest", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const listResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/medication-requests",
      headers: treatmentHeaders(accessToken)
    });
    const listBody = listResponse.json();

    expect(listResponse.statusCode).toBe(200);
    expect(listBody.items).toHaveLength(2);

    const fhirResponse = await app.inject({
      method: "GET",
      url: `/api/v1/medication-requests/${listBody.items[0].id}/fhir`,
      headers: treatmentHeaders(accessToken)
    });

    expect(fhirResponse.statusCode).toBe(200);
    expect(fhirResponse.json()).toMatchObject({
      resourceType: "MedicationRequest",
      status: "active",
      intent: "order",
      subject: {
        reference: "Patient/patient-demo-001"
      }
    });
  });

  it("lists medication dispenses and exports them as FHIR MedicationDispense", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const listResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/medication-dispenses",
      headers: treatmentHeaders(accessToken)
    });
    const listBody = listResponse.json();

    expect(listResponse.statusCode).toBe(200);
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

    const fhirResponse = await app.inject({
      method: "GET",
      url: "/api/v1/medication-dispenses/medication-dispense-demo-002/fhir",
      headers: treatmentHeaders(accessToken)
    });

    expect(fhirResponse.statusCode).toBe(200);
    expect(fhirResponse.json()).toMatchObject({
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
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const response = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/medication-dispenses",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json"
      },
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
          unit: "viên",
          system: "http://unitsofmeasure.org",
          code: "{tablet}"
        },
        daysSupply: {
          value: 30,
          unit: "ngày",
          system: "http://unitsofmeasure.org",
          code: "d"
        },
        whenPrepared: "2026-05-27T05:30:00.000Z",
        whenHandedOver: "2026-05-27T05:45:00.000Z",
        dispenserPractitionerId: "nurse-demo-001",
        receiverPractitionerId: "nurse-demo-001",
        dosageInstruction: {
          text: "Uống 5 mg mỗi ngày vào buổi sáng",
          route: "Đường uống",
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

  it("lists medication administrations and exports them as FHIR MedicationAdministration", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const listResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/medication-administrations",
      headers: treatmentHeaders(accessToken)
    });
    const listBody = listResponse.json();

    expect(listResponse.statusCode).toBe(200);
    expect(listBody.items).toHaveLength(2);
    expect(listBody.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "medication-administration-demo-002",
          status: "completed",
          medicationRequestId: "medication-request-demo-002"
        })
      ])
    );

    const fhirResponse = await app.inject({
      method: "GET",
      url: "/api/v1/medication-administrations/medication-administration-demo-002/fhir",
      headers: treatmentHeaders(accessToken)
    });

    expect(fhirResponse.statusCode).toBe(200);
    expect(fhirResponse.json()).toMatchObject({
      resourceType: "MedicationAdministration",
      id: "medication-administration-demo-002",
      status: "completed",
      request: {
        reference: "MedicationRequest/medication-request-demo-002"
      },
      subject: {
        reference: "Patient/patient-demo-001"
      }
    });
  });

  it("creates a medication administration linked to the original medication request", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const response = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/medication-administrations",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json"
      },
      payload: {
        encounterId: "encounter-demo-002",
        medicationRequestId: "medication-request-demo-002",
        reasonConditionId: "condition-demo-002",
        status: "completed",
        category: "outpatient",
        medicationCode: {
          system: "http://www.whocc.no/atc",
          code: "C09AA05",
          display: "Ramipril"
        },
        effectivePeriod: {
          start: "2026-05-27T06:05:00.000Z"
        },
        performers: [
          {
            actorType: "Practitioner",
            actorId: "nurse-demo-001"
          }
        ],
        dosage: {
          text: "Uống 5 mg vào buổi sáng",
          route: {
            system: "http://snomed.info/sct",
            code: "26643006",
            display: "Oral route"
          },
          doseQuantity: {
            value: 5,
            unit: "mg",
            system: "http://unitsofmeasure.org",
            code: "mg"
          }
        }
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      patientId: "patient-demo-001",
      encounterId: "encounter-demo-002",
      medicationRequestId: "medication-request-demo-002",
      reasonConditionId: "condition-demo-002",
      category: "outpatient"
    });
  });

  it("creates a medication request linked to a patient condition", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const response = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/medication-requests",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json"
      },
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
          text: "Uống 5 mg mỗi ngày vào buổi tối",
          route: "Đường uống",
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

  it("lists service requests and exports them as FHIR ServiceRequest", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const listResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/service-requests",
      headers: treatmentHeaders(accessToken)
    });
    const listBody = listResponse.json();

    expect(listResponse.statusCode).toBe(200);
    expect(listBody.items).toHaveLength(2);

    const fhirResponse = await app.inject({
      method: "GET",
      url: `/api/v1/service-requests/${listBody.items[0].id}/fhir`,
      headers: treatmentHeaders(accessToken)
    });

    expect(fhirResponse.statusCode).toBe(200);
    expect(fhirResponse.json()).toMatchObject({
      resourceType: "ServiceRequest",
      status: "active",
      intent: "order",
      subject: {
        reference: "Patient/patient-demo-001"
      }
    });
  });

  it("creates a service request linked to a patient condition", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const response = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/service-requests",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json"
      },
      payload: {
        encounterId: "encounter-demo-002",
        reasonConditionId: "condition-demo-002",
        category: "laboratory",
        priority: "urgent",
        code: {
          system: "http://loinc.org",
          code: "24323-8",
          display: "Comprehensive metabolic panel"
        },
        occurrenceAt: "2026-05-27T05:00:00.000Z",
        requesterPractitionerId: "practitioner-demo-001",
        performerOrganizationId: "department-laboratory",
        patientInstruction: "Nhịn ăn nếu khoa xét nghiệm yêu cầu."
      }
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({
      patientId: "patient-demo-001",
      encounterId: "encounter-demo-002",
      reasonConditionId: "condition-demo-002",
      category: "laboratory"
    });
  });

  it("lists diagnostic reports and exports them as FHIR DiagnosticReport", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const listResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/diagnostic-reports",
      headers: treatmentHeaders(accessToken)
    });
    const listBody = listResponse.json();

    expect(listResponse.statusCode).toBe(200);
    expect(listBody.items).toHaveLength(2);

    const fhirResponse = await app.inject({
      method: "GET",
      url: `/api/v1/diagnostic-reports/${listBody.items[0].id}/fhir`,
      headers: treatmentHeaders(accessToken)
    });

    expect(fhirResponse.statusCode).toBe(200);
    expect(fhirResponse.json()).toMatchObject({
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
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const response = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/diagnostic-reports",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json"
      },
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
        conclusion: "Báo cáo xét nghiệm thử nghiệm trong API test."
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
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const listResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/imaging-studies",
      headers: treatmentHeaders(accessToken)
    });
    const listBody = listResponse.json();

    expect(listResponse.statusCode).toBe(200);
    expect(listBody.items).toHaveLength(1);

    const fhirResponse = await app.inject({
      method: "GET",
      url: `/api/v1/imaging-studies/${listBody.items[0].id}/fhir`,
      headers: treatmentHeaders(accessToken)
    });

    expect(fhirResponse.statusCode).toBe(200);
    expect(fhirResponse.json()).toMatchObject({
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
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const response = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/imaging-studies",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json"
      },
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

  it("lists active patient consents for treatment users", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/consents",
      headers: treatmentHeaders(accessToken)
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.items).toHaveLength(1);
    expect(body.items[0]).toMatchObject({
      id: "consent-demo-transfer-001",
      patientId: "patient-demo-001",
      status: "active",
      category: "record-sharing",
      granteeOrganizationId: "hospital-hai-phong-referral"
    });
  });

  it("creates a patient consent and uses it for Bundle export", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const createResponse = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/consents",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json"
      },
      payload: {
        category: "record-sharing",
        granteeOrganizationId: "hospital-new-recipient",
        validFrom: "2026-05-27T00:00:00.000Z",
        validUntil: "2026-12-31T23:59:59.000Z"
      }
    });
    const createdConsent = createResponse.json();

    expect(createResponse.statusCode).toBe(201);
    expect(createdConsent.id).toEqual(expect.stringMatching(/^consent-/));

    const bundleResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/fhir-bundle",
      headers: {
        ...treatmentHeaders(accessToken),
        "x-consent-reference": createdConsent.id,
        "x-recipient-organization-id": "hospital-new-recipient"
      }
    });

    expect(bundleResponse.statusCode).toBe(200);
    expect(bundleResponse.json()).toMatchObject({
      resourceType: "Bundle",
      type: "collection"
    });
  });

  it("exports patient consent as FHIR Consent", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/consents/consent-demo-transfer-001/fhir",
      headers: treatmentHeaders(accessToken)
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body).toMatchObject({
      resourceType: "Consent",
      id: "consent-demo-transfer-001",
      status: "active",
      patient: {
        reference: "Patient/patient-demo-001"
      },
      provision: {
        type: "permit",
        actor: [
          {
            reference: {
              reference: "Organization/hospital-hai-phong-referral"
            }
          }
        ]
      }
    });
  });

  it("revokes a patient consent and blocks later record sharing", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const createResponse = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/consents",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json"
      },
      payload: {
        category: "record-sharing",
        granteeOrganizationId: "hospital-revoked-recipient",
        validFrom: "2026-05-27T00:00:00.000Z",
        validUntil: "2026-12-31T23:59:59.000Z"
      }
    });
    const createdConsent = createResponse.json();

    expect(createResponse.statusCode).toBe(201);

    const revokeResponse = await app.inject({
      method: "POST",
      url: `/api/v1/patients/patient-demo-001/consents/${createdConsent.id}/revoke`,
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json"
      },
      payload: {
        reason: "Người bệnh rút lại đồng ý chia sẻ hồ sơ."
      }
    });
    const revokedConsent = revokeResponse.json();

    expect(revokeResponse.statusCode).toBe(200);
    expect(revokedConsent).toMatchObject({
      id: createdConsent.id,
      status: "revoked",
      revokedByActorId: "practitioner-demo-001",
      revocationReason: "Người bệnh rút lại đồng ý chia sẻ hồ sơ."
    });
    expect(revokedConsent.revokedAt).toEqual(expect.any(String));

    const fhirConsentResponse = await app.inject({
      method: "GET",
      url: `/api/v1/consents/${createdConsent.id}/fhir`,
      headers: treatmentHeaders(accessToken)
    });

    expect(fhirConsentResponse.statusCode).toBe(200);
    expect(fhirConsentResponse.json()).toMatchObject({
      resourceType: "Consent",
      id: createdConsent.id,
      status: "inactive",
      extension: expect.arrayContaining([
        expect.objectContaining({
          url: "urn:wiiicare:nexus:fhir:StructureDefinition/consent-revocation"
        })
      ])
    });

    const bundleResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/fhir-bundle",
      headers: {
        ...treatmentHeaders(accessToken),
        "x-consent-reference": createdConsent.id,
        "x-recipient-organization-id": "hospital-revoked-recipient"
      }
    });

    expectOperationOutcome(bundleResponse, {
      statusCode: 403,
      code: "suppressed",
      detailsCode: "CONSENT_NOT_VALID_FOR_TRANSFER"
    });
  });

  it("denies consent revocation for nurse role", async () => {
    app = await readyServer();
    const clinicianToken = await loginForToken(app, "practitioner-demo-001", "clinician");
    const nurseToken = await loginForToken(app, "nurse-demo-001", "nurse");

    const createResponse = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/consents",
      headers: {
        ...treatmentHeaders(clinicianToken),
        "content-type": "application/json"
      },
      payload: {
        category: "record-sharing",
        granteeOrganizationId: "hospital-nurse-denied-recipient",
        validFrom: "2026-05-27T00:00:00.000Z",
        validUntil: "2026-12-31T23:59:59.000Z"
      }
    });
    const createdConsent = createResponse.json();

    expect(createResponse.statusCode).toBe(201);

    const revokeResponse = await app.inject({
      method: "POST",
      url: `/api/v1/patients/patient-demo-001/consents/${createdConsent.id}/revoke`,
      headers: {
        ...treatmentHeaders(nurseToken),
        "content-type": "application/json"
      },
      payload: {
        reason: "Điều dưỡng không có quyền thu hồi consent."
      }
    });

    expect(revokeResponse.statusCode).toBe(403);
    expect(revokeResponse.json()).toMatchObject({
      error: "FORBIDDEN",
      permission: "consent:revoke"
    });
  });

  it("lists record transfer packages for a patient", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/record-transfers",
      headers: treatmentHeaders(accessToken)
    });
    const body = response.json();

    expect(response.statusCode).toBe(200);
    expect(body.items).toHaveLength(1);
    expect(body.items[0]).toMatchObject({
      id: "record-transfer-demo-001",
      patientId: "patient-demo-001",
      status: "ready",
      bundleType: "document",
      bundleId: "patient-document-patient-demo-001",
      recipientOrganizationId: "hospital-hai-phong-referral",
      consentReference: "consent-demo-transfer-001"
    });
  });

  it("creates a record transfer package and exports it as FHIR Task", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const createResponse = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/record-transfers",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json"
      },
      payload: {
        priority: "urgent",
        bundleType: "document",
        sourceOrganizationId: "hospital-hai-phong-demo",
        recipientOrganizationId: "hospital-hai-phong-referral",
        consentReference: "consent-demo-transfer-001",
        reason: "Chuyển tuyến theo dõi chuyên khoa tim mạch.",
        requestedAt: "2026-05-28T03:00:00.000Z"
      }
    });
    const createdTransfer = createResponse.json();

    expect(createResponse.statusCode).toBe(201);
    expect(createdTransfer.id).toEqual(expect.stringMatching(/^record-transfer-/));
    expect(createdTransfer).toMatchObject({
      bundleId: "patient-document-patient-demo-001",
      requestedByActorId: "practitioner-demo-001"
    });

    const fhirResponse = await app.inject({
      method: "GET",
      url: `/api/v1/record-transfers/${createdTransfer.id}/fhir-task`,
      headers: treatmentHeaders(accessToken)
    });

    expect(fhirResponse.statusCode).toBe(200);
    expect(fhirResponse.json()).toMatchObject({
      resourceType: "Task",
      status: "requested",
      focus: {
        reference: "Bundle/patient-document-patient-demo-001"
      },
      for: {
        reference: "Patient/patient-demo-001"
      },
      owner: {
        reference: "Organization/hospital-hai-phong-referral"
      }
    });
  });

  it("rejects creating a record transfer directly in the dead-lettered state", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const response = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/record-transfers",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json"
      },
      payload: {
        status: "dead-lettered",
        priority: "urgent",
        bundleType: "document",
        sourceOrganizationId: "hospital-hai-phong-demo",
        recipientOrganizationId: "hospital-hai-phong-referral",
        consentReference: "consent-demo-transfer-001",
        reason: "Không cho client tạo trực tiếp trạng thái lỗi cuối.",
        requestedAt: "2026-05-28T03:00:00.000Z",
        sentAt: "2026-05-28T03:05:00.000Z",
        failedAt: "2026-05-28T03:10:00.000Z"
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: "VALIDATION_ERROR"
    });
  });

  it("keeps JSON and FHIR not-found errors separate for record transfers", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const jsonResponse = await app.inject({
      method: "GET",
      url: "/api/v1/record-transfers/record-transfer-missing",
      headers: {
        ...treatmentHeaders(accessToken),
        "x-request-id": "record-transfer-json-not-found-001"
      }
    });

    expect(jsonResponse.statusCode).toBe(404);
    expect(String(jsonResponse.headers["content-type"])).toContain("application/json");
    expect(jsonResponse.json()).toMatchObject({
      error: "RECORD_TRANSFER_NOT_FOUND",
      message: "Không tìm thấy yêu cầu chuyển hồ sơ.",
      requestId: "record-transfer-json-not-found-001"
    });

    const fhirResponse = await app.inject({
      method: "GET",
      url: "/api/v1/record-transfers/record-transfer-missing/fhir-task",
      headers: treatmentHeaders(accessToken)
    });

    expectOperationOutcome(fhirResponse, {
      statusCode: 404,
      code: "not-found",
      detailsCode: "RECORD_TRANSFER_NOT_FOUND"
    });
  });

  it("moves a record transfer through sent and received milestones", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const sendResponse = await app.inject({
      method: "POST",
      url: "/api/v1/record-transfers/record-transfer-demo-001/send",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json"
      },
      payload: {
        sentAt: "2026-05-28T04:00:00.000Z",
        note: "Xếp gói hồ sơ vào hàng chờ gửi qua gateway liên thông."
      }
    });

    expect(sendResponse.statusCode).toBe(200);
    expect(sendResponse.json()).toMatchObject({
      id: "record-transfer-demo-001",
      status: "in-progress",
      sentAt: "2026-05-28T04:00:00.000Z"
    });

    const attemptsResponse = await app.inject({
      method: "GET",
      url: "/api/v1/record-transfers/record-transfer-demo-001/delivery-attempts",
      headers: treatmentHeaders(accessToken)
    });

    expect(attemptsResponse.statusCode).toBe(200);
    expect(attemptsResponse.json()).toMatchObject({
      items: [
        {
          recordTransferId: "record-transfer-demo-001",
          patientId: "patient-demo-001",
          targetEndpointId: "endpoint-fhir-hai-phong-referral",
          targetEndpointAddress: "https://fhir.referral.demo.wiiicare.vn/fhir",
          bundleId: "patient-document-patient-demo-001",
          bundleType: "document",
          attemptNumber: 1,
          status: "queued",
          queuedAt: "2026-05-28T04:00:00.000Z",
          idempotencyKey: expect.stringMatching(/^wiiicare-record-transfer-[a-f0-9]{64}$/)
        }
      ]
    });

    const receiveResponse = await app.inject({
      method: "POST",
      url: "/api/v1/record-transfers/record-transfer-demo-001/receive",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json"
      },
      payload: {
        receivedAt: "2026-05-28T04:15:00.000Z",
        note: "Bệnh viện nhận đã xác nhận tiếp nhận."
      }
    });

    expect(receiveResponse.statusCode).toBe(200);
    expect(receiveResponse.json()).toMatchObject({
      id: "record-transfer-demo-001",
      status: "completed",
      sentAt: "2026-05-28T04:00:00.000Z",
      receivedAt: "2026-05-28T04:15:00.000Z",
      receivedByActorId: "practitioner-demo-001",
      acknowledgementReference: expect.stringMatching(
        /^wiiicare-record-transfer-ack-[a-f0-9]{32}$/
      )
    });

    const fhirResponse = await app.inject({
      method: "GET",
      url: "/api/v1/record-transfers/record-transfer-demo-001/fhir-task",
      headers: treatmentHeaders(accessToken)
    });

    expect(fhirResponse.statusCode).toBe(200);
    expect(fhirResponse.json()).toMatchObject({
      resourceType: "Task",
      status: "completed",
      executionPeriod: {
        start: "2026-05-28T04:00:00.000Z",
        end: "2026-05-28T04:15:00.000Z"
      },
      note: expect.arrayContaining([
        {
          text: "Người xác nhận nhận hồ sơ: practitioner-demo-001"
        }
      ])
    });
  });

  it("accepts an operations acknowledgement callback for a sent record transfer", async () => {
    app = await readyServer();
    const clinicianToken = await loginForToken(app, "practitioner-demo-001", "clinician");
    const gatewayToken = await loginForToken(
      app,
      "gateway-hai-phong-referral",
      "integration"
    );

    const gatewayPatientListResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients",
      headers: operationsHeaders(gatewayToken)
    });

    expect(gatewayPatientListResponse.statusCode).toBe(403);
    expect(gatewayPatientListResponse.json()).toMatchObject({
      error: "FORBIDDEN",
      permission: "patient:list"
    });

    const sendResponse = await app.inject({
      method: "POST",
      url: "/api/v1/record-transfers/record-transfer-demo-001/send",
      headers: {
        ...treatmentHeaders(clinicianToken),
        "content-type": "application/json"
      },
      payload: {
        sentAt: "2026-05-28T04:30:00.000Z",
        note: "Xếp gói hồ sơ vào hàng chờ gửi qua gateway liên thông."
      }
    });

    expect(sendResponse.statusCode).toBe(200);

    const deniedCallbackResponse = await app.inject({
      method: "POST",
      url: "/api/v1/record-transfers/record-transfer-demo-001/acknowledgement-callback",
      headers: {
        ...operationsHeaders(clinicianToken),
        "content-type": "application/json"
      },
      payload: {
        recipientOrganizationId: "hospital-hai-phong-referral",
        acknowledgementReference: "ack-denied-from-source-organization",
        receivedAt: "2026-05-28T04:45:00.000Z"
      }
    });

    expect(deniedCallbackResponse.statusCode).toBe(403);
    expect(deniedCallbackResponse.json()).toMatchObject({
      error: "FORBIDDEN",
      permission: "record-transfer:acknowledge"
    });

    const callbackPayload = {
      recipientOrganizationId: "hospital-hai-phong-referral",
      acknowledgementReference: "ack-record-transfer-callback-001",
      receivedAt: "2026-05-28T04:45:00.000Z",
      receivedByActorId: "system-hai-phong-referral-gateway",
      targetEndpointId: "endpoint-fhir-hai-phong-referral",
      deliveryIdempotencyKey: "wiiicare-record-transfer-callback-test-001",
      note: "Bệnh viện nhận xác nhận tiếp nhận qua callback liên thông."
    };

    const callbackResponse = await app.inject({
      method: "POST",
      url: "/api/v1/record-transfers/record-transfer-demo-001/acknowledgement-callback",
      headers: {
        ...operationsHeaders(gatewayToken),
        "content-type": "application/json"
      },
      payload: callbackPayload
    });

    expect(callbackResponse.statusCode).toBe(200);
    expect(callbackResponse.json()).toMatchObject({
      id: "record-transfer-demo-001",
      status: "completed",
      sentAt: "2026-05-28T04:30:00.000Z",
      receivedAt: "2026-05-28T04:45:00.000Z",
      receivedByActorId: "system-hai-phong-referral-gateway",
      acknowledgementReference: "ack-record-transfer-callback-001"
    });

    const duplicateCallbackResponse = await app.inject({
      method: "POST",
      url: "/api/v1/record-transfers/record-transfer-demo-001/acknowledgement-callback",
      headers: {
        ...operationsHeaders(gatewayToken),
        "content-type": "application/json"
      },
      payload: callbackPayload
    });

    expect(duplicateCallbackResponse.statusCode).toBe(200);
    expect(duplicateCallbackResponse.json()).toMatchObject({
      status: "completed",
      acknowledgementReference: "ack-record-transfer-callback-001"
    });

    const fhirResponse = await app.inject({
      method: "GET",
      url: "/api/v1/record-transfers/record-transfer-demo-001/fhir-task",
      headers: treatmentHeaders(clinicianToken)
    });

    expect(fhirResponse.statusCode).toBe(200);
    expect(fhirResponse.json()).toMatchObject({
      resourceType: "Task",
      status: "completed",
      note: expect.arrayContaining([
        {
          text: "Biên nhận tiếp nhận: ack-record-transfer-callback-001"
        }
      ])
    });
  });

  it("requires a valid HMAC signature for acknowledgement callbacks when configured", async () => {
    process.env.BVS_RECORD_TRANSFER_CALLBACK_SECRETS_JSON = JSON.stringify({
      [callbackKeyId]: callbackSecret
    });
    app = await readyServer();
    const clinicianToken = await loginForToken(app, "practitioner-demo-001", "clinician");
    const gatewayToken = await loginForToken(
      app,
      "gateway-hai-phong-referral",
      "integration"
    );

    const sendResponse = await app.inject({
      method: "POST",
      url: "/api/v1/record-transfers/record-transfer-demo-001/send",
      headers: {
        ...treatmentHeaders(clinicianToken),
        "content-type": "application/json"
      },
      payload: {
        sentAt: "2026-05-28T06:00:00.000Z",
        note: "Xếp gói hồ sơ vào hàng chờ gửi qua gateway liên thông."
      }
    });

    expect(sendResponse.statusCode).toBe(200);

    const callbackPayload = {
      recipientOrganizationId: "hospital-hai-phong-referral",
      acknowledgementReference: "ack-record-transfer-callback-signed-001",
      receivedAt: new Date().toISOString(),
      receivedByActorId: "system-hai-phong-referral-gateway",
      targetEndpointId: "endpoint-fhir-hai-phong-referral",
      deliveryIdempotencyKey: "wiiicare-record-transfer-callback-signed-test-001",
      note: "Bệnh viện nhận xác nhận tiếp nhận qua callback đã ký."
    };

    const unsignedCallbackResponse = await app.inject({
      method: "POST",
      url: "/api/v1/record-transfers/record-transfer-demo-001/acknowledgement-callback",
      headers: {
        ...operationsHeaders(gatewayToken),
        "content-type": "application/json",
        [recordTransferCallbackKeyIdHeader]: callbackKeyId
      },
      payload: callbackPayload
    });

    expect(unsignedCallbackResponse.statusCode).toBe(403);
    expect(unsignedCallbackResponse.json()).toMatchObject({
      error: "RECORD_TRANSFER_CALLBACK_SIGNATURE_REQUIRED",
      permission: "record-transfer:acknowledge"
    });

    const invalidTimestamp = new Date().toISOString();
    const invalidSignatureResponse = await app.inject({
      method: "POST",
      url: "/api/v1/record-transfers/record-transfer-demo-001/acknowledgement-callback",
      headers: {
        ...operationsHeaders(gatewayToken),
        "content-type": "application/json",
        [recordTransferCallbackKeyIdHeader]: callbackKeyId,
        [recordTransferCallbackTimestampHeader]: invalidTimestamp,
        [recordTransferCallbackSignatureHeader]: "invalid-signature"
      },
      payload: callbackPayload
    });

    expect(invalidSignatureResponse.statusCode).toBe(403);
    expect(invalidSignatureResponse.json()).toMatchObject({
      error: "RECORD_TRANSFER_CALLBACK_SIGNATURE_INVALID",
      permission: "record-transfer:acknowledge"
    });

    const signedCallbackResponse = await app.inject({
      method: "POST",
      url: "/api/v1/record-transfers/record-transfer-demo-001/acknowledgement-callback",
      headers: {
        ...operationsHeaders(gatewayToken),
        "content-type": "application/json",
        ...signedRecordTransferCallbackHeaders({
          recordTransferId: "record-transfer-demo-001",
          body: callbackPayload
        })
      },
      payload: callbackPayload
    });

    expect(signedCallbackResponse.statusCode).toBe(200);
    expect(signedCallbackResponse.json()).toMatchObject({
      status: "completed",
      receivedByActorId: "system-hai-phong-referral-gateway",
      acknowledgementReference: "ack-record-transfer-callback-signed-001"
    });
  });

  it("records failed record transfer delivery and prepares a retry", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const sendResponse = await app.inject({
      method: "POST",
      url: "/api/v1/record-transfers/record-transfer-demo-001/send",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json"
      },
      payload: {
        sentAt: "2026-05-28T05:00:00.000Z",
        note: "Xếp gói hồ sơ vào hàng chờ gửi qua gateway liên thông."
      }
    });

    expect(sendResponse.statusCode).toBe(200);

    const failResponse = await app.inject({
      method: "POST",
      url: "/api/v1/record-transfers/record-transfer-demo-001/fail",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json"
      },
      payload: {
        failedAt: "2026-05-28T05:05:00.000Z",
        failureReason: "Recipient gateway unavailable.",
        nextRetryAt: "2026-05-28T05:20:00.000Z"
      }
    });

    expect(failResponse.statusCode, failResponse.body).toBe(200);
    expect(failResponse.json()).toMatchObject({
      id: "record-transfer-demo-001",
      status: "failed",
      failedAt: "2026-05-28T05:05:00.000Z",
      failureReason: "Recipient gateway unavailable.",
      nextRetryAt: "2026-05-28T05:20:00.000Z",
      retryCount: 0
    });

    const failedFhirResponse = await app.inject({
      method: "GET",
      url: "/api/v1/record-transfers/record-transfer-demo-001/fhir-task",
      headers: treatmentHeaders(accessToken)
    });

    expect(failedFhirResponse.statusCode).toBe(200);
    expect(failedFhirResponse.json()).toMatchObject({
      resourceType: "Task",
      status: "failed",
      note: expect.arrayContaining([
        expect.objectContaining({
          text: "Lý do lỗi chuyển hồ sơ: Recipient gateway unavailable."
        }),
        expect.objectContaining({
          text: "Hẹn thử gửi lại: 2026-05-28T05:20:00.000Z"
        })
      ])
    });

    const retryResponse = await app.inject({
      method: "POST",
      url: "/api/v1/record-transfers/record-transfer-demo-001/retry",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json"
      },
      payload: {
        retryAt: "2026-05-28T05:20:00.000Z",
        note: "Đưa lại vào hàng đợi gửi khi gateway sẵn sàng."
      }
    });

    expect(retryResponse.statusCode).toBe(200);
    expect(retryResponse.json()).toMatchObject({
      id: "record-transfer-demo-001",
      status: "ready",
      retryCount: 1,
      note: "Đưa lại vào hàng đợi gửi khi gateway sẵn sàng."
    });
    expect(retryResponse.json()).not.toHaveProperty("sentAt");
    expect(retryResponse.json()).not.toHaveProperty("failedAt");
    expect(retryResponse.json()).not.toHaveProperty("failureReason");
    expect(retryResponse.json()).not.toHaveProperty("nextRetryAt");

    const resendResponse = await app.inject({
      method: "POST",
      url: "/api/v1/record-transfers/record-transfer-demo-001/send",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json"
      },
      payload: {
        sentAt: "2026-05-28T05:25:00.000Z"
      }
    });

    expect(resendResponse.statusCode).toBe(200);
    expect(resendResponse.json()).toMatchObject({
      status: "in-progress",
      sentAt: "2026-05-28T05:25:00.000Z",
      retryCount: 1
    });

    const attemptsResponse = await app.inject({
      method: "GET",
      url: "/api/v1/record-transfers/record-transfer-demo-001/delivery-attempts",
      headers: treatmentHeaders(accessToken)
    });

    expect(attemptsResponse.statusCode).toBe(200);
    expect(attemptsResponse.json()).toMatchObject({
      items: [
        {
          attemptNumber: 1,
          queuedAt: "2026-05-28T05:00:00.000Z",
          status: "queued"
        },
        {
          attemptNumber: 2,
          queuedAt: "2026-05-28T05:25:00.000Z",
          status: "queued"
        }
      ]
    });
  });

  it("denies record transfer creation when consent does not cover the recipient", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const response = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/record-transfers",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json"
      },
      payload: {
        bundleType: "document",
        sourceOrganizationId: "hospital-hai-phong-demo",
        recipientOrganizationId: "hospital-not-covered",
        consentReference: "consent-demo-transfer-001",
        reason: "Thử gửi sai đơn vị nhận."
      }
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({
      error: "CONSENT_DOES_NOT_ALLOW_RECORD_TRANSFER"
    });
  });

  it("requires a recipient FHIR Bundle endpoint before creating a record transfer", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const consentResponse = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/consents",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json"
      },
      payload: {
        category: "record-sharing",
        granteeOrganizationId: "department-laboratory",
        validFrom: "2026-05-28T00:00:00.000Z",
        validUntil: "2026-12-31T23:59:59.000Z"
      }
    });
    expect(consentResponse.statusCode).toBe(201);

    const response = await app.inject({
      method: "POST",
      url: "/api/v1/patients/patient-demo-001/record-transfers",
      headers: {
        ...treatmentHeaders(accessToken),
        "content-type": "application/json"
      },
      payload: {
        bundleType: "document",
        sourceOrganizationId: "hospital-hai-phong-demo",
        recipientOrganizationId: "department-laboratory",
        consentReference: consentResponse.json().id,
        reason: "Thử chuyển hồ sơ tới đơn vị chưa có FHIR Bundle endpoint."
      }
    });

    expect(response.statusCode).toBe(422);
    expect(response.json()).toMatchObject({
      error: "RECORD_TRANSFER_ENDPOINT_NOT_FOUND",
      requestId: expect.any(String)
    });
  });

  it("requires transfer context before exporting a patient-record FHIR Bundle", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/fhir-bundle",
      headers: treatmentHeaders(accessToken)
    });

    expectOperationOutcome(response, {
      statusCode: 400,
      code: "required",
      detailsCode: "MISSING_BUNDLE_TRANSFER_CONTEXT"
    });
  });

  it("denies Bundle export when consent does not match the recipient", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/fhir-bundle",
      headers: {
        ...treatmentHeaders(accessToken),
        "x-consent-reference": "consent-demo-transfer-001",
        "x-recipient-organization-id": "hospital-not-covered"
      }
    });

    expectOperationOutcome(response, {
      statusCode: 403,
      code: "suppressed",
      detailsCode: "CONSENT_NOT_VALID_FOR_TRANSFER"
    });
  });
});

async function readyServer(): Promise<FastifyInstance> {
  const server = await buildServer({
    logger: false
  });
  await server.ready();
  return server;
}

async function readyAuthRouteServer(): Promise<FastifyInstance> {
  const server = Fastify({
    logger: false,
    requestIdHeader: "x-request-id"
  });
  await server.register(
    async (api) => {
      await registerAuthRoutes(api, {
        loginRateLimiter: createMemoryLoginRateLimiter({
          maxAttempts: 20,
          windowMs: 60_000
        })
      });
    },
    {
      prefix: "/api/v1"
    }
  );
  await server.ready();
  return server;
}

async function login(
  app: FastifyInstance,
  payload: {
    readonly username: string;
    readonly password: string;
    readonly role: string;
  },
  headers: Record<string, string> = {}
) {
  return app.inject({
    method: "POST",
    url: "/api/v1/auth/login",
    headers: {
      ...headers,
      "content-type": "application/json"
    },
    payload
  });
}

async function loginForToken(
  app: FastifyInstance,
  username: string,
  role: string
): Promise<string> {
  const response = await login(app, {
    username,
    password: "demo",
    role
  });

  expect(response.statusCode).toBe(200);

  return response.json().accessToken as string;
}

function treatmentHeaders(accessToken: string): Record<string, string> {
  return {
    authorization: `Bearer ${accessToken}`,
    "x-purpose-of-use": "TREATMENT"
  };
}

function operationsHeaders(accessToken: string): Record<string, string> {
  return {
    authorization: `Bearer ${accessToken}`,
    "x-purpose-of-use": "OPERATIONS"
  };
}

function signedRecordTransferCallbackHeaders(input: {
  readonly recordTransferId: string;
  readonly body: unknown;
}): Record<string, string> {
  const timestamp = new Date().toISOString();

  return {
    [recordTransferCallbackKeyIdHeader]: callbackKeyId,
    [recordTransferCallbackTimestampHeader]: timestamp,
    [recordTransferCallbackSignatureHeader]: buildRecordTransferCallbackSignature({
      secret: callbackSecret,
      timestamp,
      recordTransferId: input.recordTransferId,
      body: input.body
    })
  };
}

function bundleTransferHeaders(accessToken: string): Record<string, string> {
  return {
    ...treatmentHeaders(accessToken),
    "x-consent-reference": "consent-demo-transfer-001",
    "x-recipient-organization-id": "hospital-hai-phong-referral"
  };
}

function auditHeaders(accessToken: string): Record<string, string> {
  return {
    authorization: `Bearer ${accessToken}`,
    "x-purpose-of-use": "AUDIT"
  };
}

function expectOperationOutcome(
  response: {
    readonly statusCode: number;
    readonly headers: Record<string, unknown>;
    json(): unknown;
  },
  expected: {
    readonly statusCode: number;
    readonly code: string;
    readonly detailsCode: string;
  }
): void {
  expect(response.statusCode).toBe(expected.statusCode);
  expect(String(response.headers["content-type"])).toContain("application/fhir+json");
  const body = response.json();
  expect(body).not.toHaveProperty("requestId");
  expect(body).toMatchObject({
    resourceType: "OperationOutcome",
    issue: [
      {
        severity: "error",
        code: expected.code,
        details: {
          coding: [
            {
              system: "urn:wiiicare:nexus:operation-outcome",
              code: expected.detailsCode
            }
          ]
        }
      }
    ]
  });
}

function restoreEnv(name: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[name];
    return;
  }

  process.env[name] = value;
}

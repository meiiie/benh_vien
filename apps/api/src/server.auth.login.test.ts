import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  applyDefaultAuthBoundaryEnv,
  auditHeaders,
  captureAuthBoundaryEnv,
  expectOperationOutcome,
  jsonRequestHeaders,
  login,
  loginForToken,
  readyAuthRouteServer,
  readyServer,
  restoreAuthBoundaryEnv
} from "./server.auth.test-support.js";

describe("API auth login boundary", () => {
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

  it("accepts case-insensitive Bearer auth schemes on session and protected routes", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const sessionResponse = await app.inject({
      method: "GET",
      url: "/api/v1/auth/session",
      headers: {
        authorization: `bearer ${accessToken}`
      }
    });
    const patientResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001",
      headers: {
        authorization: `bearer ${accessToken}`,
        "x-purpose-of-use": "TREATMENT"
      }
    });

    expect(sessionResponse.statusCode).toBe(200);
    expect(patientResponse.statusCode).toBe(200);
  });

  it("rejects invalid purpose-of-use headers instead of silently defaulting to treatment", async () => {
    app = await readyServer();
    const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

    const jsonResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients",
      headers: {
        authorization: `Bearer ${accessToken}`,
        "x-purpose-of-use": "BREAK_GLASS",
        "x-request-id": "invalid-purpose-json-001"
      }
    });
    const fhirResponse = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-demo-001/fhir",
      headers: {
        authorization: `Bearer ${accessToken}`,
        accept: "application/fhir+json",
        "x-purpose-of-use": "BREAK_GLASS",
        "x-request-id": "invalid-purpose-fhir-001"
      }
    });

    expect(jsonResponse.statusCode).toBe(400);
    expect(jsonResponse.json()).toMatchObject({
      error: "INVALID_PURPOSE_OF_USE",
      requestId: "invalid-purpose-json-001",
      allowedPurposeOfUse: ["TREATMENT", "AUDIT", "OPERATIONS"]
    });
    expectOperationOutcome(fhirResponse, {
      statusCode: 400,
      code: "invalid",
      detailsCode: "INVALID_PURPOSE_OF_USE"
    });

    const auditorToken = await loginForToken(app, "security-officer-demo", "auditor");
    const auditResponse = await app.inject({
      method: "GET",
      url: "/api/v1/audit-events?limit=25",
      headers: auditHeaders(auditorToken)
    });
    const auditBody = auditResponse.json();
    const jsonDeniedAuditEvent = auditBody.items.find(
      (event: { readonly metadata?: { readonly requestId?: string } }) =>
        event.metadata?.requestId === "invalid-purpose-json-001"
    );
    const fhirDeniedAuditEvent = auditBody.items.find(
      (event: { readonly metadata?: { readonly requestId?: string } }) =>
        event.metadata?.requestId === "invalid-purpose-fhir-001"
    );

    expect(auditResponse.statusCode).toBe(200);
    expect(jsonDeniedAuditEvent).toMatchObject({
      action: "access.denied",
      resourceType: "AuditEvent",
      resourceId: "x-purpose-of-use",
      purposeOfUse: "OPERATIONS",
      metadata: expect.objectContaining({
        denialCode: "INVALID_PURPOSE_OF_USE",
        deniedActorId: "practitioner-demo-001",
        deniedActorRole: "clinician",
        deniedActorPurposeOfUse: "INVALID",
        rejectedHeader: "x-purpose-of-use",
        route: "GET /api/v1/patients",
        statusCode: 400
      })
    });
    expect(fhirDeniedAuditEvent).toMatchObject({
      action: "access.denied",
      resourceType: "AuditEvent",
      resourceId: "x-purpose-of-use",
      purposeOfUse: "OPERATIONS",
      metadata: expect.objectContaining({
        denialCode: "INVALID_PURPOSE_OF_USE",
        deniedActorId: "practitioner-demo-001",
        deniedActorRole: "clinician",
        deniedActorPurposeOfUse: "INVALID",
        rejectedHeader: "x-purpose-of-use",
        route: "GET /api/v1/patients/patient-demo-001/fhir",
        statusCode: 400
      })
    });
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
      headers: jsonRequestHeaders({
        "x-request-id": "auth-invalid-payload-001"
      }),
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
      headers: jsonRequestHeaders({
        "x-request-id": "auth-unknown-field-001"
      }),
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
});

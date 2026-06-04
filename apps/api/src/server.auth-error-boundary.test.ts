import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  applyDefaultAuthBoundaryEnv,
  captureAuthBoundaryEnv,
  jsonRequestHeaders,
  login,
  readyServer,
  restoreAuthBoundaryEnv
} from "./server.auth.test-support.js";

describe("API auth error boundary", () => {
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

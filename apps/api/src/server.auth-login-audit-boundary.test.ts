import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  applyDefaultAuthBoundaryEnv,
  auditHeaders,
  captureAuthBoundaryEnv,
  login,
  loginForToken,
  readyServer,
  restoreAuthBoundaryEnv
} from "./server.auth.test-support.js";

describe("API auth login audit boundary", () => {
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
});

import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  applyDefaultAuthBoundaryEnv,
  captureAuthBoundaryEnv,
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

});

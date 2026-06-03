import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  applyDefaultAuthBoundaryEnv,
  auditHeaders,
  captureAuthBoundaryEnv,
  loginForToken,
  readyServer,
  restoreAuthBoundaryEnv
} from "./server.auth.test-support.js";

describe("API audit integrity boundary", () => {
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
});

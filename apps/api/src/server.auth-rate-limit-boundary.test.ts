import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  applyDefaultAuthBoundaryEnv,
  captureAuthBoundaryEnv,
  login,
  readyServer,
  restoreAuthBoundaryEnv
} from "./server.auth.test-support.js";

describe("API auth rate-limit boundary", () => {
  let app: FastifyInstance;
  const originalEnv = captureAuthBoundaryEnv();

  beforeEach(() => {
    applyDefaultAuthBoundaryEnv();
  });

  afterEach(async () => {
    await app.close();
    restoreAuthBoundaryEnv(originalEnv);
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
});

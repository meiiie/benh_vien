import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildServer } from "./server.js";
import {
  applyDefaultAuthBoundaryEnv,
  captureAuthBoundaryEnv,
  jsonRequestHeaders,
  loginForToken,
  operationsHeaders,
  readyServer,
  restoreAuthBoundaryEnv
} from "./server.auth.test-support.js";

describe("API runtime configuration boundary", () => {
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
      headers: jsonRequestHeaders({
        "x-request-id": "body-too-large-001"
      }),
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
});

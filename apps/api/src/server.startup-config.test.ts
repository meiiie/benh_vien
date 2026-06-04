import { afterEach, beforeEach, describe, it } from "vitest";
import {
  captureAuthBoundaryEnv,
  restoreAuthBoundaryEnv
} from "./server.auth.test-support.js";
import {
  applyStartupConfigBoundaryEnv,
  expectStartupConfigError,
  productionPublicApiBaseUrl
} from "./server.startup-config.test-support.js";

describe("API startup CORS configuration boundary", () => {
  const originalEnv = captureAuthBoundaryEnv();

  beforeEach(() => {
    applyStartupConfigBoundaryEnv();
  });

  afterEach(() => {
    restoreAuthBoundaryEnv(originalEnv);
  });

  it("requires explicit CORS origins in production", async () => {
    process.env.NODE_ENV = "production";
    process.env.BVS_REPOSITORY = "postgres";
    process.env.BVS_PUBLIC_API_BASE_URL = productionPublicApiBaseUrl;
    delete process.env.BVS_CORS_ORIGINS;

    await expectStartupConfigError("BVS_CORS_ORIGINS must be set in production.");
  });

  it("rejects unsafe CORS origins in production", async () => {
    process.env.NODE_ENV = "production";
    process.env.BVS_REPOSITORY = "postgres";
    process.env.BVS_PUBLIC_API_BASE_URL = productionPublicApiBaseUrl;

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
      ],
      [
        "https://localhost",
        "BVS_CORS_ORIGINS must not contain localhost, loopback, private or link-local origins in production."
      ],
      [
        "https://127.0.0.1",
        "BVS_CORS_ORIGINS must not contain localhost, loopback, private or link-local origins in production."
      ],
      [
        "https://10.0.0.5",
        "BVS_CORS_ORIGINS must not contain localhost, loopback, private or link-local origins in production."
      ],
      [
        "https://192.168.1.25",
        "BVS_CORS_ORIGINS must not contain localhost, loopback, private or link-local origins in production."
      ],
      [
        "https://[fd12:3456::1]",
        "BVS_CORS_ORIGINS must not contain localhost, loopback, private or link-local origins in production."
      ]
    ] as const) {
      process.env.BVS_CORS_ORIGINS = origin;

      await expectStartupConfigError(message);
    }
  });
});

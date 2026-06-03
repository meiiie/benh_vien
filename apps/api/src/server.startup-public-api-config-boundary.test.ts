import { afterEach, beforeEach, describe, it } from "vitest";
import {
  captureAuthBoundaryEnv,
  restoreAuthBoundaryEnv
} from "./server.auth.test-support.js";
import {
  applyStartupConfigBoundaryEnv,
  expectStartupConfigError
} from "./server.startup-config.test-support.js";

describe("API startup public API URL configuration boundary", () => {
  const originalEnv = captureAuthBoundaryEnv();

  beforeEach(() => {
    applyStartupConfigBoundaryEnv();
  });

  afterEach(() => {
    restoreAuthBoundaryEnv(originalEnv);
  });

  it("requires a public API base URL in production", async () => {
    process.env.NODE_ENV = "production";
    process.env.BVS_REPOSITORY = "postgres";
    delete process.env.BVS_PUBLIC_API_BASE_URL;

    await expectStartupConfigError("BVS_PUBLIC_API_BASE_URL must be set in production.");
  });

  it("rejects invalid public API base URLs", async () => {
    process.env.BVS_PUBLIC_API_BASE_URL = "not-a-url";

    await expectStartupConfigError("BVS_PUBLIC_API_BASE_URL must be a valid absolute URL.");
  });

  it("rejects public API base URLs with query or fragment", async () => {
    process.env.BVS_PUBLIC_API_BASE_URL =
      "https://api.wiiicare.example.vn/api/v1?tenant=demo";

    await expectStartupConfigError("BVS_PUBLIC_API_BASE_URL must not include query or fragment.");
  });

  it("requires HTTPS public API base URLs in production", async () => {
    process.env.NODE_ENV = "production";
    process.env.BVS_REPOSITORY = "postgres";
    process.env.BVS_PUBLIC_API_BASE_URL = "http://api.wiiicare.example.vn/api/v1";

    await expectStartupConfigError("BVS_PUBLIC_API_BASE_URL must use HTTPS in production.");
  });

  it("rejects local-only public API base URLs in production", async () => {
    process.env.NODE_ENV = "production";
    process.env.BVS_REPOSITORY = "postgres";

    for (const publicApiBaseUrl of [
      "https://localhost/api/v1",
      "https://gateway.localhost/api/v1",
      "https://127.0.0.1/api/v1",
      "https://0.0.0.0/api/v1",
      "https://10.0.0.5/api/v1",
      "https://172.16.0.5/api/v1",
      "https://172.31.255.250/api/v1",
      "https://192.168.1.25/api/v1",
      "https://169.254.10.20/api/v1",
      "https://[::1]/api/v1",
      "https://[fc00::1]/api/v1",
      "https://[fd12:3456::1]/api/v1",
      "https://[fe80::1]/api/v1",
      "https://[::ffff:192.168.1.25]/api/v1"
    ]) {
      process.env.BVS_PUBLIC_API_BASE_URL = publicApiBaseUrl;

      await expectStartupConfigError(
        "BVS_PUBLIC_API_BASE_URL must not use localhost, loopback, private or link-local hosts in production."
      );
    }
  });
});

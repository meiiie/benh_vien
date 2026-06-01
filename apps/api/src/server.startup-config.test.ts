import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildServer } from "./server.js";
import {
  applyDefaultAuthBoundaryEnv,
  captureAuthBoundaryEnv,
  restoreAuthBoundaryEnv
} from "./server.auth.test-support.js";

describe("API startup configuration boundary", () => {
  const originalEnv = captureAuthBoundaryEnv();

  beforeEach(() => {
    applyDefaultAuthBoundaryEnv();
  });

  afterEach(() => {
    restoreAuthBoundaryEnv(originalEnv);
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

  it("requires callback signature secrets at startup in production", async () => {
    process.env.NODE_ENV = "production";
    process.env.BVS_REPOSITORY = "postgres";
    process.env.BVS_PUBLIC_API_BASE_URL = "https://api.wiiicare.example.vn/api/v1";
    process.env.BVS_CORS_ORIGINS = "https://wiiicare.example.vn";
    delete process.env.BVS_RECORD_TRANSFER_CALLBACK_SECRET;
    delete process.env.BVS_RECORD_TRANSFER_CALLBACK_SECRETS_JSON;

    await expect(buildServer({ logger: false })).rejects.toThrow(
      "BVS_RECORD_TRANSFER_CALLBACK_SECRET hoặc BVS_RECORD_TRANSFER_CALLBACK_SECRETS_JSON phải được cấu hình tối thiểu 32 ký tự trong production."
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

      await expect(buildServer({ logger: false })).rejects.toThrow(
        "BVS_PUBLIC_API_BASE_URL must not use localhost, loopback, private or link-local hosts in production."
      );
    }
  });
});

import { afterEach, beforeEach, describe, it } from "vitest";
import {
  captureAuthBoundaryEnv,
  restoreAuthBoundaryEnv
} from "./server.auth.test-support.js";
import {
  applyStartupConfigBoundaryEnv,
  expectStartupConfigError,
  productionCorsOrigin
} from "./server.startup-config.test-support.js";

describe("API startup repository configuration boundary", () => {
  const originalEnv = captureAuthBoundaryEnv();

  beforeEach(() => {
    applyStartupConfigBoundaryEnv();
  });

  afterEach(() => {
    restoreAuthBoundaryEnv(originalEnv);
  });

  it("rejects invalid repository configuration", async () => {
    process.env.BVS_REPOSITORY = "postgresql";

    await expectStartupConfigError("BVS_REPOSITORY must be either 'postgres' or 'in-memory'.");
  });

  it("requires PostgreSQL repositories in production", async () => {
    process.env.NODE_ENV = "production";
    process.env.BVS_CORS_ORIGINS = productionCorsOrigin;
    process.env.BVS_REPOSITORY = "in-memory";

    await expectStartupConfigError("BVS_REPOSITORY must be 'postgres' in production.");
  });
});

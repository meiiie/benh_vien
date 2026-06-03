import { afterEach, beforeEach, describe, it } from "vitest";
import {
  captureAuthBoundaryEnv,
  restoreAuthBoundaryEnv
} from "./server.auth.test-support.js";
import {
  applyStartupConfigBoundaryEnv,
  configureProductionStartupDefaults,
  expectStartupConfigError
} from "./server.startup-config.test-support.js";

describe("API startup auth configuration boundary", () => {
  const originalEnv = captureAuthBoundaryEnv();

  beforeEach(() => {
    applyStartupConfigBoundaryEnv();
  });

  afterEach(() => {
    restoreAuthBoundaryEnv(originalEnv);
  });

  it("requires a strong auth secret at startup in production", async () => {
    configureProductionStartupDefaults();
    delete process.env.BVS_AUTH_SECRET;

    await expectStartupConfigError(
      "BVS_AUTH_SECRET must be set to at least 32 characters in production."
    );
  });

  it("rejects placeholder auth secrets at startup in production", async () => {
    configureProductionStartupDefaults();

    for (const secret of [
      "change-me-with-a-random-secret-of-at-least-32-characters",
      "wiiicare-dev-only-auth-secret-change-before-production"
    ]) {
      process.env.BVS_AUTH_SECRET = secret;

      await expectStartupConfigError(
        "BVS_AUTH_SECRET must not use placeholder values in production."
      );
    }
  });

  it("requires a bounded auth token TTL at startup", async () => {
    configureProductionStartupDefaults();
    process.env.BVS_AUTH_TOKEN_TTL_SECONDS = "60";

    await expectStartupConfigError(
      "BVS_AUTH_TOKEN_TTL_SECONDS must be an integer between 300 and 28800."
    );
  });
});

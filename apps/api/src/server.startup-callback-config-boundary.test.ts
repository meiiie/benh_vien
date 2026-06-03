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

describe("API startup callback configuration boundary", () => {
  const originalEnv = captureAuthBoundaryEnv();

  beforeEach(() => {
    applyStartupConfigBoundaryEnv();
  });

  afterEach(() => {
    restoreAuthBoundaryEnv(originalEnv);
  });

  it("requires callback signature secrets at startup in production", async () => {
    configureProductionStartupDefaults();
    delete process.env.BVS_RECORD_TRANSFER_CALLBACK_SECRET;
    delete process.env.BVS_RECORD_TRANSFER_CALLBACK_SECRETS_JSON;

    await expectStartupConfigError(
      "BVS_RECORD_TRANSFER_CALLBACK_SECRET hoặc BVS_RECORD_TRANSFER_CALLBACK_SECRETS_JSON phải được cấu hình tối thiểu 32 ký tự trong production."
    );
  });
});

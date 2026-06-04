import { afterEach, describe, expect, it } from "vitest";
import { assertRecordTransferCallbackSignatureConfiguration } from "./record-transfer-callback-signature.js";
import {
  callbackKeyId,
  callbackSecret,
  captureCallbackSignatureEnv,
  restoreCallbackSignatureEnv
} from "./record-transfer-callback-signature.test-support.js";

const originalEnv = captureCallbackSignatureEnv();

afterEach(() => {
  restoreCallbackSignatureEnv(originalEnv);
});

describe("record transfer callback signature configuration", () => {
  it("validates callback signature configuration at production startup", () => {
    process.env.NODE_ENV = "production";
    delete process.env.BVS_RECORD_TRANSFER_CALLBACK_SECRET;
    delete process.env.BVS_RECORD_TRANSFER_CALLBACK_SECRETS_JSON;

    expect(() => assertRecordTransferCallbackSignatureConfiguration()).toThrow(
      "BVS_RECORD_TRANSFER_CALLBACK_SECRET hoặc BVS_RECORD_TRANSFER_CALLBACK_SECRETS_JSON phải được cấu hình tối thiểu 32 ký tự trong production."
    );

    process.env.BVS_RECORD_TRANSFER_CALLBACK_SECRET =
      "change-me-with-a-random-callback-secret-of-at-least-32-characters";

    expect(() => assertRecordTransferCallbackSignatureConfiguration()).toThrow(
      "BVS_RECORD_TRANSFER_CALLBACK_SECRET không được dùng giá trị mẫu trong production."
    );

    delete process.env.BVS_RECORD_TRANSFER_CALLBACK_SECRET;
    process.env.BVS_RECORD_TRANSFER_CALLBACK_SECRETS_JSON = JSON.stringify({
      [callbackKeyId]: callbackSecret
    });

    expect(() => assertRecordTransferCallbackSignatureConfiguration()).not.toThrow();
  });
});

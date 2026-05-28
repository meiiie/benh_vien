import { afterEach, describe, expect, it } from "vitest";
import {
  assertRecordTransferCallbackSignatureConfiguration,
  buildRecordTransferCallbackSignature,
  recordTransferCallbackKeyIdHeader,
  recordTransferCallbackSignatureHeader,
  recordTransferCallbackTimestampHeader,
  verifyRecordTransferCallbackSignature
} from "./record-transfer-callback-signature.js";

const callbackSecret = "wiiicare-record-transfer-callback-secret-for-unit-tests";
const callbackKeyId = "gateway-hai-phong-referral";
const recordTransferId = "record-transfer-demo-001";
const callbackBody = {
  recipientOrganizationId: "hospital-hai-phong-referral",
  acknowledgementReference: "ack-record-transfer-callback-001"
};

const originalNodeEnv = process.env.NODE_ENV;
const originalCallbackSecret = process.env.BVS_RECORD_TRANSFER_CALLBACK_SECRET;
const originalCallbackSecretsJson =
  process.env.BVS_RECORD_TRANSFER_CALLBACK_SECRETS_JSON;

afterEach(() => {
  restoreEnv("NODE_ENV", originalNodeEnv);
  restoreEnv("BVS_RECORD_TRANSFER_CALLBACK_SECRET", originalCallbackSecret);
  restoreEnv("BVS_RECORD_TRANSFER_CALLBACK_SECRETS_JSON", originalCallbackSecretsJson);
});

describe("record transfer callback signature", () => {
  it("does not require signatures in development when no callback secret is configured", () => {
    process.env.NODE_ENV = "development";
    delete process.env.BVS_RECORD_TRANSFER_CALLBACK_SECRET;
    delete process.env.BVS_RECORD_TRANSFER_CALLBACK_SECRETS_JSON;

    expect(
      verifyRecordTransferCallbackSignature({
        headers: {},
        recordTransferId,
        body: callbackBody
      })
    ).toMatchObject({
      required: false,
      verified: false
    });
  });

  it("requires a fresh matching HMAC signature when callback secret is configured", () => {
    process.env.NODE_ENV = "development";
    process.env.BVS_RECORD_TRANSFER_CALLBACK_SECRET = callbackSecret;
    delete process.env.BVS_RECORD_TRANSFER_CALLBACK_SECRETS_JSON;
    const timestamp = "2026-05-28T08:00:00.000Z";
    const now = new Date("2026-05-28T08:02:00.000Z");
    const signature = buildRecordTransferCallbackSignature({
      secret: callbackSecret,
      timestamp,
      recordTransferId,
      body: callbackBody
    });

    expect(
      verifyRecordTransferCallbackSignature({
        headers: {},
        recordTransferId,
        body: callbackBody,
        now
      })
    ).toMatchObject({
      required: true,
      verified: false,
      error: "RECORD_TRANSFER_CALLBACK_SIGNATURE_REQUIRED"
    });

    expect(
      verifyRecordTransferCallbackSignature({
        headers: {
          [recordTransferCallbackTimestampHeader]: timestamp,
          [recordTransferCallbackSignatureHeader]: "invalid-signature"
        },
        recordTransferId,
        body: callbackBody,
        now
      })
    ).toMatchObject({
      required: true,
      verified: false,
      error: "RECORD_TRANSFER_CALLBACK_SIGNATURE_INVALID"
    });

    expect(
      verifyRecordTransferCallbackSignature({
        headers: {
          [recordTransferCallbackTimestampHeader]: timestamp,
          [recordTransferCallbackSignatureHeader]: signature
        },
        recordTransferId,
        body: {
          acknowledgementReference: callbackBody.acknowledgementReference,
          recipientOrganizationId: callbackBody.recipientOrganizationId
        },
        now
      })
    ).toMatchObject({
      required: true,
      verified: true,
      algorithm: "HMAC-SHA256",
      timestamp
    });
  });

  it("selects per-gateway callback secrets by key id when configured", () => {
    process.env.NODE_ENV = "development";
    delete process.env.BVS_RECORD_TRANSFER_CALLBACK_SECRET;
    process.env.BVS_RECORD_TRANSFER_CALLBACK_SECRETS_JSON = JSON.stringify({
      [callbackKeyId]: callbackSecret
    });
    const timestamp = "2026-05-28T08:00:00.000Z";
    const now = new Date("2026-05-28T08:02:00.000Z");
    const signature = buildRecordTransferCallbackSignature({
      secret: callbackSecret,
      timestamp,
      recordTransferId,
      body: callbackBody
    });

    expect(
      verifyRecordTransferCallbackSignature({
        headers: {
          [recordTransferCallbackTimestampHeader]: timestamp,
          [recordTransferCallbackSignatureHeader]: signature
        },
        recordTransferId,
        body: callbackBody,
        now
      })
    ).toMatchObject({
      required: true,
      verified: false,
      error: "RECORD_TRANSFER_CALLBACK_KEY_ID_REQUIRED"
    });

    expect(
      verifyRecordTransferCallbackSignature({
        headers: {
          [recordTransferCallbackKeyIdHeader]: "unknown-gateway",
          [recordTransferCallbackTimestampHeader]: timestamp,
          [recordTransferCallbackSignatureHeader]: signature
        },
        recordTransferId,
        body: callbackBody,
        now
      })
    ).toMatchObject({
      required: true,
      verified: false,
      error: "RECORD_TRANSFER_CALLBACK_KEY_ID_UNKNOWN",
      keyId: "unknown-gateway"
    });

    expect(
      verifyRecordTransferCallbackSignature({
        headers: {
          [recordTransferCallbackKeyIdHeader]: callbackKeyId,
          [recordTransferCallbackTimestampHeader]: timestamp,
          [recordTransferCallbackSignatureHeader]: signature
        },
        recordTransferId,
        body: callbackBody,
        now
      })
    ).toMatchObject({
      required: true,
      verified: true,
      algorithm: "HMAC-SHA256",
      timestamp,
      keyId: callbackKeyId
    });
  });

  it("fails closed in production when callback secret is missing", () => {
    process.env.NODE_ENV = "production";
    delete process.env.BVS_RECORD_TRANSFER_CALLBACK_SECRET;
    delete process.env.BVS_RECORD_TRANSFER_CALLBACK_SECRETS_JSON;

    expect(
      verifyRecordTransferCallbackSignature({
        headers: {},
        recordTransferId,
        body: callbackBody
      })
    ).toMatchObject({
      required: true,
      verified: false,
      statusCode: 503,
      error: "RECORD_TRANSFER_CALLBACK_SIGNATURE_NOT_CONFIGURED"
    });
  });

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

function restoreEnv(name: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[name];
    return;
  }

  process.env[name] = value;
}

import { afterEach, describe, expect, it } from "vitest";
import {
  buildRecordTransferCallbackSignature,
  recordTransferCallbackKeyIdHeader,
  recordTransferCallbackSignatureHeader,
  recordTransferCallbackTimestampHeader,
  verifyRecordTransferCallbackSignature
} from "./record-transfer-callback-signature.js";
import {
  callbackBody,
  callbackKeyId,
  callbackSecret,
  captureCallbackSignatureEnv,
  recordTransferId,
  restoreCallbackSignatureEnv
} from "./record-transfer-callback-signature.test-support.js";

const originalEnv = captureCallbackSignatureEnv();

afterEach(() => {
  restoreCallbackSignatureEnv(originalEnv);
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

  it("rejects malformed, expired and oversized callback signatures", () => {
    process.env.NODE_ENV = "development";
    process.env.BVS_RECORD_TRANSFER_CALLBACK_SECRET = callbackSecret;
    delete process.env.BVS_RECORD_TRANSFER_CALLBACK_SECRETS_JSON;
    const timestamp = "2026-05-28T08:00:00.000Z";

    expect(
      verifyRecordTransferCallbackSignature({
        headers: {
          [recordTransferCallbackTimestampHeader]: "not-a-date",
          [recordTransferCallbackSignatureHeader]: "invalid-signature"
        },
        recordTransferId,
        body: callbackBody,
        now: new Date("2026-05-28T08:00:00.000Z")
      })
    ).toMatchObject({
      required: true,
      verified: false,
      error: "RECORD_TRANSFER_CALLBACK_TIMESTAMP_INVALID"
    });

    expect(
      verifyRecordTransferCallbackSignature({
        headers: {
          [recordTransferCallbackTimestampHeader]: timestamp,
          [recordTransferCallbackSignatureHeader]: "invalid-signature"
        },
        recordTransferId,
        body: callbackBody,
        now: new Date("2026-05-28T08:06:00.000Z")
      })
    ).toMatchObject({
      required: true,
      verified: false,
      error: "RECORD_TRANSFER_CALLBACK_SIGNATURE_EXPIRED"
    });

    expect(
      verifyRecordTransferCallbackSignature({
        headers: {
          [recordTransferCallbackTimestampHeader]: timestamp,
          [recordTransferCallbackSignatureHeader]: "x".repeat(129)
        },
        recordTransferId,
        body: callbackBody,
        now: new Date("2026-05-28T08:00:00.000Z")
      })
    ).toMatchObject({
      required: true,
      verified: false,
      error: "RECORD_TRANSFER_CALLBACK_SIGNATURE_INVALID"
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

});

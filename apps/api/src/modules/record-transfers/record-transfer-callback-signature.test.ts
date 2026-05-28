import { afterEach, describe, expect, it } from "vitest";
import {
  buildRecordTransferCallbackSignature,
  recordTransferCallbackSignatureHeader,
  recordTransferCallbackTimestampHeader,
  verifyRecordTransferCallbackSignature
} from "./record-transfer-callback-signature.js";

const callbackSecret = "wiiicare-record-transfer-callback-secret-for-unit-tests";
const recordTransferId = "record-transfer-demo-001";
const callbackBody = {
  recipientOrganizationId: "hospital-hai-phong-referral",
  acknowledgementReference: "ack-record-transfer-callback-001"
};

const originalNodeEnv = process.env.NODE_ENV;
const originalCallbackSecret = process.env.BVS_RECORD_TRANSFER_CALLBACK_SECRET;

afterEach(() => {
  restoreEnv("NODE_ENV", originalNodeEnv);
  restoreEnv("BVS_RECORD_TRANSFER_CALLBACK_SECRET", originalCallbackSecret);
});

describe("record transfer callback signature", () => {
  it("does not require signatures in development when no callback secret is configured", () => {
    process.env.NODE_ENV = "development";
    delete process.env.BVS_RECORD_TRANSFER_CALLBACK_SECRET;

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

  it("fails closed in production when callback secret is missing", () => {
    process.env.NODE_ENV = "production";
    delete process.env.BVS_RECORD_TRANSFER_CALLBACK_SECRET;

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

function restoreEnv(name: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[name];
    return;
  }

  process.env[name] = value;
}

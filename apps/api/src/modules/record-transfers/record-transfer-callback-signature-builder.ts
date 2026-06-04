import { createHmac } from "node:crypto";
import { canonicalJson } from "./record-transfer-callback-json.js";

export function buildRecordTransferCallbackSignature(input: {
  readonly secret: string;
  readonly timestamp: string;
  readonly recordTransferId: string;
  readonly body: unknown;
}): string {
  return createHmac("sha256", input.secret)
    .update(buildSignaturePayload(input.timestamp, input.recordTransferId, input.body))
    .digest("base64url");
}

function buildSignaturePayload(
  timestamp: string,
  recordTransferId: string,
  body: unknown
): string {
  return `${timestamp}.${recordTransferId}.${canonicalJson(body ?? {})}`;
}

import type { IncomingHttpHeaders } from "node:http";
import { readSingleHeader } from "./record-transfer-callback-headers.js";
import {
  maxSignatureLength,
  recordTransferCallbackSignatureHeader,
  recordTransferCallbackTimestampHeader
} from "./record-transfer-callback-signature.constants.js";
import { callbackSignatureInvalidLengthMessage } from "./record-transfer-callback-signature-failure-catalog.js";
import {
  signatureInvalidFailure,
  signatureRequiredFailure
} from "./record-transfer-callback-signature-failures.js";
import type { CallbackSignatureVerification } from "./record-transfer-callback-signature.types.js";

export type ReceivedCallbackSignature =
  | {
      readonly ok: true;
      readonly timestamp: string;
      readonly receivedSignature: string;
    }
  | {
      readonly ok: false;
      readonly failure: CallbackSignatureVerification;
    };

export function readReceivedCallbackSignature(input: {
  readonly headers: IncomingHttpHeaders;
  readonly keyId: string | undefined;
}): ReceivedCallbackSignature {
  const timestamp = readSingleHeader(input.headers[recordTransferCallbackTimestampHeader]);
  const receivedSignature = readSingleHeader(
    input.headers[recordTransferCallbackSignatureHeader]
  );

  if (!timestamp || !receivedSignature) {
    return {
      ok: false,
      failure: signatureRequiredFailure(input.keyId)
    };
  }

  if (receivedSignature.length > maxSignatureLength) {
    return {
      ok: false,
      failure: signatureInvalidFailure({
        timestamp,
        keyId: input.keyId,
        message: callbackSignatureInvalidLengthMessage
      })
    };
  }

  return {
    ok: true,
    timestamp,
    receivedSignature
  };
}

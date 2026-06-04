import type { FastifyRequest } from "fastify";
import {
  RecordTransferAcknowledgementCallbackRequestSchema,
  RecordTransferIdParamsSchema,
  type RecordTransferAcknowledgementCallbackRequest
} from "@benh-vien-so/contracts";
import {
  verifyRecordTransferCallbackSignature,
  type CallbackSignatureVerification
} from "./record-transfer-callback-signature.js";

export type ParsedRecordTransferAcknowledgementCallback = {
  readonly recordTransferId: string;
  readonly callback: RecordTransferAcknowledgementCallbackRequest;
  readonly signatureVerification: CallbackSignatureVerification;
};

export function parseRecordTransferAcknowledgementCallbackRequest(
  request: FastifyRequest
): ParsedRecordTransferAcknowledgementCallback {
  const params = RecordTransferIdParamsSchema.parse(request.params);
  const parsed = RecordTransferAcknowledgementCallbackRequestSchema.safeParse(
    request.body ?? {}
  );

  if (!parsed.success) {
    throw parsed.error;
  }

  return {
    recordTransferId: params.id,
    callback: parsed.data,
    signatureVerification: verifyRecordTransferCallbackSignature({
      headers: request.headers,
      recordTransferId: params.id,
      body: request.body
    })
  };
}

import type { FastifyInstance, LightMyRequestResponse } from "fastify";
import {
  jsonRequestHeaders,
  operationsHeaders,
  recordTransferCallbackTestKeyId,
  recordTransferCallbackTestSecret,
  treatmentHeaders
} from "./server.auth.test-support.js";

export const recordTransferAcknowledgementCallbackUrl =
  "/api/v1/record-transfers/record-transfer-demo-001/acknowledgement-callback";

export const recordTransferCallbackSecretsEnvName =
  "BVS_RECORD_TRANSFER_CALLBACK_SECRETS_JSON";

type RecordTransferAcknowledgementPayload = {
  readonly recipientOrganizationId: string;
  readonly acknowledgementReference: string;
  readonly receivedAt: string;
  readonly receivedByActorId: string;
  readonly targetEndpointId: string;
  readonly deliveryIdempotencyKey: string;
  readonly note: string;
};

export function configureRecordTransferCallbackSecret(): void {
  process.env[recordTransferCallbackSecretsEnvName] = JSON.stringify({
    [recordTransferCallbackTestKeyId]: recordTransferCallbackTestSecret
  });
}

export function buildRecordTransferAcknowledgementPayload(
  input: Partial<RecordTransferAcknowledgementPayload> = {}
): RecordTransferAcknowledgementPayload {
  return {
    recipientOrganizationId: "hospital-hai-phong-referral",
    acknowledgementReference: "ack-record-transfer-callback-001",
    receivedAt: "2026-05-28T04:45:00.000Z",
    receivedByActorId: "system-hai-phong-referral-gateway",
    targetEndpointId: "endpoint-fhir-hai-phong-referral",
    deliveryIdempotencyKey: "wiiicare-record-transfer-callback-test-001",
    note: "Recipient gateway acknowledged the transferred document package.",
    ...input
  };
}

export async function sendRecordTransferForCallback(input: {
  readonly app: FastifyInstance;
  readonly clinicianToken: string;
  readonly sentAt: string;
  readonly note: string;
}): Promise<LightMyRequestResponse> {
  return input.app.inject({
    method: "POST",
    url: "/api/v1/record-transfers/record-transfer-demo-001/send",
    headers: jsonRequestHeaders(treatmentHeaders(input.clinicianToken)),
    payload: {
      sentAt: input.sentAt,
      note: input.note
    }
  });
}

export async function postRecordTransferAcknowledgementCallback(input: {
  readonly app: FastifyInstance;
  readonly token: string;
  readonly payload: RecordTransferAcknowledgementPayload;
  readonly extraHeaders?: Record<string, string>;
}): Promise<LightMyRequestResponse> {
  return input.app.inject({
    method: "POST",
    url: recordTransferAcknowledgementCallbackUrl,
    headers: {
      ...jsonRequestHeaders(operationsHeaders(input.token)),
      ...input.extraHeaders
    },
    payload: input.payload
  });
}

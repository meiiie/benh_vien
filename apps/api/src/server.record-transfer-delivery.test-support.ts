import type { FastifyInstance } from "fastify";
import type {
  RecordTransferDeliveryAttempt,
  RecordTransferDeliveryAttemptRepository
} from "@benh-vien-so/domain";
import {
  jsonRequestHeaders,
  loginForToken,
  readyServer,
  treatmentHeaders
} from "./server.auth.test-support.js";

export type RecordTransferDeliverySession = {
  readonly app: FastifyInstance;
  readonly accessToken: string;
};

export class FailingRecordTransferDeliveryAttemptRepository
  implements RecordTransferDeliveryAttemptRepository
{
  async findByRecordTransferId(): Promise<RecordTransferDeliveryAttempt[]> {
    return [];
  }

  async findQueued(): Promise<RecordTransferDeliveryAttempt[]> {
    return [];
  }

  async save(_attempt: RecordTransferDeliveryAttempt): Promise<void> {
    throw new Error("delivery attempt store unavailable");
  }
}

export async function readyRecordTransferDeliverySession(
  options?: Parameters<typeof readyServer>[0]
): Promise<RecordTransferDeliverySession> {
  const app = await readyServer(options);
  const accessToken = await loginForToken(
    app,
    "practitioner-demo-001",
    "clinician"
  );

  return {
    app,
    accessToken
  };
}

export async function sendRecordTransfer(
  app: FastifyInstance,
  accessToken: string,
  payload: Record<string, unknown>
) {
  return app.inject({
    method: "POST",
    url: "/api/v1/record-transfers/record-transfer-demo-001/send",
    headers: jsonRequestHeaders(treatmentHeaders(accessToken)),
    payload
  });
}

export async function getRecordTransferDeliveryAttempts(
  app: FastifyInstance,
  accessToken: string
) {
  return app.inject({
    method: "GET",
    url: "/api/v1/record-transfers/record-transfer-demo-001/delivery-attempts",
    headers: treatmentHeaders(accessToken)
  });
}

export async function receiveRecordTransfer(
  app: FastifyInstance,
  accessToken: string,
  payload: Record<string, unknown>
) {
  return app.inject({
    method: "POST",
    url: "/api/v1/record-transfers/record-transfer-demo-001/receive",
    headers: jsonRequestHeaders(treatmentHeaders(accessToken)),
    payload
  });
}

export async function failRecordTransfer(
  app: FastifyInstance,
  accessToken: string,
  payload: Record<string, unknown>
) {
  return app.inject({
    method: "POST",
    url: "/api/v1/record-transfers/record-transfer-demo-001/fail",
    headers: jsonRequestHeaders(treatmentHeaders(accessToken)),
    payload
  });
}

export async function retryRecordTransfer(
  app: FastifyInstance,
  accessToken: string,
  payload: Record<string, unknown>
) {
  return app.inject({
    method: "POST",
    url: "/api/v1/record-transfers/record-transfer-demo-001/retry",
    headers: jsonRequestHeaders(treatmentHeaders(accessToken)),
    payload
  });
}

export async function listPatientRecordTransfers(
  app: FastifyInstance,
  accessToken: string
) {
  return app.inject({
    method: "GET",
    url: "/api/v1/patients/patient-demo-001/record-transfers",
    headers: treatmentHeaders(accessToken)
  });
}

export async function getRecordTransferFhirTask(
  app: FastifyInstance,
  accessToken: string
) {
  return app.inject({
    method: "GET",
    url: "/api/v1/record-transfers/record-transfer-demo-001/fhir-task",
    headers: treatmentHeaders(accessToken)
  });
}

import type { FastifyInstance } from "fastify";
import { expect } from "vitest";
import {
  applyDefaultAuthBoundaryEnv,
  auditHeaders,
  jsonRequestHeaders,
  loginForToken,
  readyServer,
  treatmentHeaders
} from "./server.auth.test-support.js";

export type PatientRegistryTestContext = {
  readonly app: FastifyInstance;
  readonly accessToken: string;
};

export type PatientRegistryAuditEvent = {
  readonly metadata?: {
    readonly requestId?: string;
  };
};

export async function readyPatientRegistryTestContext(
  actorId = "practitioner-demo-001",
  role = "clinician"
): Promise<PatientRegistryTestContext> {
  applyDefaultAuthBoundaryEnv();

  const app = await readyServer();
  const accessToken = await loginForToken(app, actorId, role);

  return { app, accessToken };
}

export function patientRegistryTreatmentHeaders(
  context: PatientRegistryTestContext
): Record<string, string> {
  return treatmentHeaders(context.accessToken);
}

export function patientRegistryJsonHeaders(
  accessToken: string,
  requestId?: string
): Record<string, string> {
  return jsonRequestHeaders({
    ...treatmentHeaders(accessToken),
    ...(requestId ? { "x-request-id": requestId } : {})
  });
}

export async function loginPatientRegistryToken(
  context: PatientRegistryTestContext,
  username: string,
  role: string
): Promise<string> {
  return loginForToken(context.app, username, role);
}

export async function createPatientForRegistryMerge(input: {
  readonly context: PatientRegistryTestContext;
  readonly adminToken: string;
}): Promise<string> {
  const response = await input.context.app.inject({
    method: "POST",
    url: "/api/v1/patients",
    headers: patientRegistryJsonHeaders(input.adminToken),
    payload: {
      identifiers: [
        {
          system: "urn:benh-vien-so:mrn",
          value: "MRN-MERGE-TEST",
          type: "hospital-mrn"
        }
      ],
      fullName: "Duplicate Patient For Merge",
      gender: "unknown",
      managingOrganizationId: "hospital-hai-phong-demo"
    }
  });

  expect(response.statusCode).toBe(201);
  return response.json().id as string;
}

export async function findPatientRegistryAuditEvent(input: {
  readonly context: PatientRegistryTestContext;
  readonly requestId: string;
  readonly limit: number;
}): Promise<PatientRegistryAuditEvent | undefined> {
  const auditorToken = await loginForToken(
    input.context.app,
    "security-officer-demo",
    "auditor"
  );
  const response = await input.context.app.inject({
    method: "GET",
    url: `/api/v1/audit-events?limit=${input.limit}`,
    headers: auditHeaders(auditorToken)
  });

  return response
    .json()
    .items.find(
      (event: PatientRegistryAuditEvent) =>
        event.metadata?.requestId === input.requestId
    );
}

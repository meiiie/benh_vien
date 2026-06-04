import type { FastifyInstance, LightMyRequestResponse } from "fastify";
import { expect } from "vitest";
import {
  applyDefaultAuthBoundaryEnv,
  jsonRequestHeaders,
  loginForToken,
  readyServer,
  treatmentHeaders
} from "./server.auth.test-support.js";

export type ConsentTestContext = {
  readonly app: FastifyInstance;
  readonly accessToken: string;
};

export async function readyConsentTestContext(
  actorId = "practitioner-demo-001",
  role = "clinician"
): Promise<ConsentTestContext> {
  applyDefaultAuthBoundaryEnv();

  const app = await readyServer();
  const accessToken = await loginForToken(app, actorId, role);

  return { app, accessToken };
}

export function consentTreatmentHeaders(
  context: ConsentTestContext
): Record<string, string> {
  return treatmentHeaders(context.accessToken);
}

export function consentTreatmentJsonHeaders(
  context: ConsentTestContext
): Record<string, string> {
  return jsonRequestHeaders(consentTreatmentHeaders(context));
}

export async function createRecordSharingConsent(input: {
  readonly context: ConsentTestContext;
  readonly granteeOrganizationId: string;
}): Promise<Record<string, unknown>> {
  const response = await input.context.app.inject({
    method: "POST",
    url: "/api/v1/patients/patient-demo-001/consents",
    headers: consentTreatmentJsonHeaders(input.context),
    payload: {
      category: "record-sharing",
      granteeOrganizationId: input.granteeOrganizationId,
      validFrom: "2026-05-27T00:00:00.000Z",
      validUntil: "2026-12-31T23:59:59.000Z"
    }
  });

  expect(response.statusCode).toBe(201);
  return response.json() as Record<string, unknown>;
}

export async function revokeConsent(input: {
  readonly context: ConsentTestContext;
  readonly consentId: string;
  readonly reason: string;
}): Promise<LightMyRequestResponse> {
  return input.context.app.inject({
    method: "POST",
    url: `/api/v1/patients/patient-demo-001/consents/${input.consentId}/revoke`,
    headers: consentTreatmentJsonHeaders(input.context),
    payload: {
      reason: input.reason
    }
  });
}

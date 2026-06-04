import type { FastifyInstance } from "fastify";
import { expect } from "vitest";
import {
  applyDefaultAuthBoundaryEnv,
  jsonRequestHeaders,
  loginForToken,
  readyServer,
  treatmentHeaders
} from "./server.auth.test-support.js";

export type ClinicalResourceTestContext = {
  readonly app: FastifyInstance;
  readonly accessToken: string;
};

export type ClinicalResourceListBody = {
  readonly items: readonly { readonly id: string }[];
};

export async function readyClinicalResourceTestContext(): Promise<ClinicalResourceTestContext> {
  applyDefaultAuthBoundaryEnv();

  const app = await readyServer();
  const accessToken = await loginForToken(app, "practitioner-demo-001", "clinician");

  return { app, accessToken };
}

export function clinicalTreatmentHeaders(
  context: ClinicalResourceTestContext
): Record<string, string> {
  return treatmentHeaders(context.accessToken);
}

export function clinicalJsonHeaders(
  context: ClinicalResourceTestContext
): Record<string, string> {
  return jsonRequestHeaders(clinicalTreatmentHeaders(context));
}

export async function getTreatmentJson(
  context: ClinicalResourceTestContext,
  url: string
): Promise<Record<string, unknown>> {
  const response = await context.app.inject({
    method: "GET",
    url,
    headers: clinicalTreatmentHeaders(context)
  });

  expect(response.statusCode).toBe(200);
  return response.json() as Record<string, unknown>;
}

export async function getClinicalResourceList(
  context: ClinicalResourceTestContext,
  url: string
): Promise<ClinicalResourceListBody> {
  return (await getTreatmentJson(context, url)) as ClinicalResourceListBody;
}

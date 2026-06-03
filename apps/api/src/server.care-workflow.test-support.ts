import type { FastifyInstance } from "fastify";
import { expect } from "vitest";
import {
  applyDefaultAuthBoundaryEnv,
  jsonRequestHeaders,
  loginForToken,
  readyServer,
  treatmentHeaders
} from "./server.auth.test-support.js";

export type CareWorkflowTestContext = {
  readonly app: FastifyInstance;
  readonly accessToken: string;
};

export type ClinicalResourceListBody = {
  readonly items: readonly { readonly id: string }[];
};

export async function readyCareWorkflowTestContext(): Promise<CareWorkflowTestContext> {
  applyDefaultAuthBoundaryEnv();

  const app = await readyServer();
  const accessToken = await loginForToken(
    app,
    "practitioner-demo-001",
    "clinician"
  );

  return { app, accessToken };
}

export function treatmentJsonHeaders(
  context: CareWorkflowTestContext
): Record<string, string> {
  return jsonRequestHeaders(treatmentHeaders(context.accessToken));
}

export async function getTreatmentJson(
  context: CareWorkflowTestContext,
  url: string
): Promise<Record<string, unknown>> {
  const response = await context.app.inject({
    method: "GET",
    url,
    headers: treatmentHeaders(context.accessToken)
  });

  expect(response.statusCode).toBe(200);
  return response.json() as Record<string, unknown>;
}

export async function getClinicalResourceList(
  context: CareWorkflowTestContext,
  url: string
): Promise<ClinicalResourceListBody> {
  return (await getTreatmentJson(context, url)) as ClinicalResourceListBody;
}

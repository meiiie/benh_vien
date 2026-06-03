import type { FastifyInstance } from "fastify";
import {
  applyDefaultAuthBoundaryEnv,
  auditHeaders,
  jsonRequestHeaders,
  loginForToken,
  readyServer,
  requestIdHeaders,
  treatmentHeaders
} from "./server.auth.test-support.js";

export type AuditTestContext = {
  readonly app: FastifyInstance;
  readonly accessToken: string;
};

export type AuditEventListItem = {
  readonly patientId?: string;
  readonly metadata?: {
    readonly requestId?: string;
  };
};

export async function readyAuditTestContext(
  actorId = "security-officer-demo",
  role = "auditor"
): Promise<AuditTestContext> {
  applyDefaultAuthBoundaryEnv();

  const app = await readyServer();
  const accessToken = await loginForToken(app, actorId, role);

  return { app, accessToken };
}

export async function loginAuditTestToken(
  context: AuditTestContext,
  username: string,
  role: string
): Promise<string> {
  return loginForToken(context.app, username, role);
}

export function auditPurposeHeaders(context: AuditTestContext): Record<string, string> {
  return auditHeaders(context.accessToken);
}

export function auditJsonHeaders(context: AuditTestContext): Record<string, string> {
  return jsonRequestHeaders(auditPurposeHeaders(context));
}

export function treatmentRequestIdHeaders(
  context: AuditTestContext,
  requestId: string
): Record<string, string> {
  return requestIdHeaders(treatmentHeaders(context.accessToken), requestId);
}

export function tokenTreatmentRequestIdHeaders(
  accessToken: string,
  requestId: string
): Record<string, string> {
  return requestIdHeaders(treatmentHeaders(accessToken), requestId);
}

export function tokenAuditHeaders(accessToken: string): Record<string, string> {
  return auditHeaders(accessToken);
}

export function findAuditEventByRequestId(
  items: readonly AuditEventListItem[],
  requestId: string
): AuditEventListItem | undefined {
  return items.find((event) => event.metadata?.requestId === requestId);
}

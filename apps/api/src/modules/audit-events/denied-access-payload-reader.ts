import type { FastifyRequest } from "fastify";
import { isAuditableDeniedAccess } from "./denied-access-audit-policy.js";
import type { DeniedAccessPayload } from "./denied-access-audit.types.js";
import { parseDeniedAccessPayload } from "./denied-access-payload-parser.js";

export function rememberDeniedAccessForAudit(
  deniedAccessPayloads: WeakMap<FastifyRequest, DeniedAccessPayload>,
  request: FastifyRequest,
  statusCode: number,
  payload: unknown
): void {
  if (statusCode !== 400 && statusCode !== 403) {
    return;
  }

  const payloadText = readPayloadText(payload);
  const deniedAccess = payloadText
    ? parseDeniedAccessPayload(payloadText)
    : undefined;

  if (deniedAccess && isAuditableDeniedAccess(statusCode, deniedAccess)) {
    deniedAccessPayloads.set(request, deniedAccess);
  }
}

function readPayloadText(payload: unknown): string | undefined {
  if (typeof payload === "string") {
    return payload;
  }

  if (Buffer.isBuffer(payload)) {
    return payload.toString("utf8");
  }

  return undefined;
}

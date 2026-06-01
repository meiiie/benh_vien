import type { FastifyRequest } from "fastify";
import { AuditEvent } from "@benh-vien-so/domain";
import type { AuditEventRepository } from "@benh-vien-so/domain";
import { readAuthenticatedActorIdentity } from "../access-control/access-context.js";

export async function recordInvalidPurposeOfUseAuditEvent(
  auditEventRepository: AuditEventRepository,
  request: FastifyRequest,
  statusCode: number
): Promise<void> {
  const actor = readAuthenticatedActorIdentity(request);

  if (!actor) {
    return;
  }

  await auditEventRepository.save(
    AuditEvent.record({
      actorId: actor.actorId,
      action: "access.denied",
      resourceType: "AuditEvent",
      resourceId: "x-purpose-of-use",
      purposeOfUse: "OPERATIONS",
      ipAddress: request.ip,
      userAgent: readHeader(request.headers["user-agent"]),
      metadata: {
        actorRole: actor.role,
        requestId: request.id,
        denialCode: "INVALID_PURPOSE_OF_USE",
        deniedActorId: actor.actorId,
        deniedActorRole: actor.role,
        deniedActorPurposeOfUse: "INVALID",
        rejectedHeader: "x-purpose-of-use",
        allowedPurposeOfUse: ["TREATMENT", "AUDIT", "OPERATIONS"],
        route: `${request.method} ${request.url}`,
        statusCode
      }
    })
  );
}

function readHeader(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

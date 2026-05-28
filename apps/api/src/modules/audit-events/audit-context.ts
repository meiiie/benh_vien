import type { FastifyRequest } from "fastify";
import { AuditEvent } from "@benh-vien-so/domain";
import type {
  AuditAction,
  AuditEventRepository,
  AuditResourceType
} from "@benh-vien-so/domain";
import { readActorContext } from "../access-control/access-context.js";

type AuditInput = {
  readonly action: AuditAction;
  readonly resourceType: AuditResourceType;
  readonly resourceId: string;
  readonly patientId?: string;
  readonly metadata?: Record<string, unknown>;
};

export async function recordAuditEvent(
  repository: AuditEventRepository,
  request: FastifyRequest,
  input: AuditInput
): Promise<void> {
  const actor = readActorContext(request);

  if (!actor) {
    return;
  }

  await repository.save(
    AuditEvent.record({
      actorId: actor.actorId,
      action: input.action,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      patientId: input.patientId,
      purposeOfUse: actor.purposeOfUse,
      ipAddress: request.ip,
      userAgent: readHeader(request.headers["user-agent"]),
      metadata: {
        actorRole: actor.role,
        requestId: request.id,
        ...input.metadata
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

import type { FastifyReply, FastifyRequest } from "fastify";
import {
  canAccess,
  isActorRole,
  isPurposeOfUse
} from "@benh-vien-so/domain";
import type { ActorContext, Permission } from "@benh-vien-so/domain";

export function readActorContext(request: FastifyRequest): ActorContext {
  const rawRole = readHeader(request.headers["x-actor-role"]) ?? "clinician";
  const rawPurposeOfUse = readHeader(request.headers["x-purpose-of-use"]) ?? "TREATMENT";

  return {
    actorId: readHeader(request.headers["x-actor-id"]) ?? "demo-clinician",
    role: isActorRole(rawRole) ? rawRole : "clinician",
    purposeOfUse: isPurposeOfUse(rawPurposeOfUse) ? rawPurposeOfUse : "TREATMENT"
  };
}

export function requirePermission(
  request: FastifyRequest,
  reply: FastifyReply,
  permission: Permission
): ActorContext | undefined {
  const actor = readActorContext(request);

  if (canAccess(actor, permission)) {
    return actor;
  }

  reply.status(403).send({
    error: "FORBIDDEN",
    message: "Actor không có quyền thực hiện thao tác này.",
    permission,
    actor: {
      id: actor.actorId,
      role: actor.role,
      purposeOfUse: actor.purposeOfUse
    }
  });

  return undefined;
}

function readHeader(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

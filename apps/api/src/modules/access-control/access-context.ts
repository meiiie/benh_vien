import type { FastifyReply, FastifyRequest } from "fastify";
import {
  canAccess,
  isPurposeOfUse
} from "@benh-vien-so/domain";
import type { ActorContext, Permission } from "@benh-vien-so/domain";
import { verifyAccessToken } from "../auth/auth-session.js";

export function readActorContext(request: FastifyRequest): ActorContext | undefined {
  const token = readBearerToken(request.headers.authorization);
  const session = token ? verifyAccessToken(token) : undefined;

  if (!session) {
    return undefined;
  }

  const rawPurposeOfUse = readHeader(request.headers["x-purpose-of-use"]) ?? "TREATMENT";

  return {
    actorId: session.actor.actorId,
    role: session.actor.role,
    purposeOfUse: isPurposeOfUse(rawPurposeOfUse) ? rawPurposeOfUse : "TREATMENT"
  };
}

export function requirePermission(
  request: FastifyRequest,
  reply: FastifyReply,
  permission: Permission
): ActorContext | undefined {
  const actor = readActorContext(request);

  if (!actor) {
    reply.status(401).send({
      error: "UNAUTHENTICATED",
      message: "Cần đăng nhập và gửi Authorization Bearer token hợp lệ."
    });

    return undefined;
  }

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

function readBearerToken(value: string | string[] | undefined): string | undefined {
  const header = readHeader(value);

  if (!header?.startsWith("Bearer ")) {
    return undefined;
  }

  return header.slice("Bearer ".length).trim();
}

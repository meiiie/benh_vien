import type { FastifyReply, FastifyRequest } from "fastify";
import { canAccess } from "@benh-vien-so/domain";
import type { ActorContext, Permission } from "@benh-vien-so/domain";
import { readActorContextResult } from "./access-context-reader.js";
import {
  sendForbiddenPermissionResponse,
  sendInvalidPurposeOfUseResponse,
  sendUnauthenticatedResponse
} from "./access-permission-responses.js";

export function requirePermission(
  request: FastifyRequest,
  reply: FastifyReply,
  permission: Permission
): ActorContext | undefined {
  const actorResult = readActorContextResult(request);

  if (actorResult.kind === "invalid-purpose-of-use") {
    sendInvalidPurposeOfUseResponse(request, reply);
    return undefined;
  }

  if (actorResult.kind === "missing") {
    sendUnauthenticatedResponse(request, reply);
    return undefined;
  }

  const actor = actorResult.actor;

  if (canAccess(actor, permission)) {
    return actor;
  }

  sendForbiddenPermissionResponse(request, reply, actor, permission);
  return undefined;
}

import type { FastifyRequest } from "fastify";
import type { ActorContext } from "@benh-vien-so/domain";
import { verifyAccessToken } from "../auth/auth-session.js";
import { readBearerToken } from "../auth/bearer-token.js";

export type AuthenticatedActorIdentity = Pick<ActorContext, "actorId" | "role">;

export function readAuthenticatedActorIdentity(
  request: FastifyRequest
): AuthenticatedActorIdentity | undefined {
  const token = readBearerToken(request.headers.authorization);
  const session = token ? verifyAccessToken(token) : undefined;

  if (!session) {
    return undefined;
  }

  return {
    actorId: session.actor.actorId,
    role: session.actor.role
  };
}

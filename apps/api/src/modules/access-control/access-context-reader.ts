import type { FastifyRequest } from "fastify";
import { isPurposeOfUse } from "@benh-vien-so/domain";
import type { ActorContext } from "@benh-vien-so/domain";
import { readAuthenticatedActorIdentity } from "./access-context-authenticated-actor.js";
import { readHeader } from "./access-context-http.js";

export type ActorContextReadResult =
  | {
      readonly kind: "actor";
      readonly actor: ActorContext;
    }
  | {
      readonly kind: "invalid-purpose-of-use";
    }
  | {
      readonly kind: "missing";
    };

export function readActorContext(request: FastifyRequest): ActorContext | undefined {
  const actorResult = readActorContextResult(request);

  return actorResult.kind === "actor" ? actorResult.actor : undefined;
}

export function readActorContextResult(request: FastifyRequest): ActorContextReadResult {
  const authenticatedActor = readAuthenticatedActorIdentity(request);

  if (!authenticatedActor) {
    return {
      kind: "missing"
    };
  }

  const purposeOfUse = readHeader(request.headers["x-purpose-of-use"])?.trim() || "TREATMENT";

  if (!isPurposeOfUse(purposeOfUse)) {
    return {
      kind: "invalid-purpose-of-use"
    };
  }

  return {
    kind: "actor",
    actor: {
      actorId: authenticatedActor.actorId,
      role: authenticatedActor.role,
      purposeOfUse
    }
  };
}

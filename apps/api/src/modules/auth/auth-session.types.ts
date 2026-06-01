import type { ActorRole } from "@benh-vien-so/domain";

export type AuthenticatedActor = {
  readonly actorId: string;
  readonly displayName: string;
  readonly role: ActorRole;
};

export type AuthenticatedSession = {
  readonly actor: AuthenticatedActor;
  readonly expiresAt: string;
};

export type TokenPayload = AuthenticatedActor & {
  readonly exp: number;
  readonly iat: number;
};

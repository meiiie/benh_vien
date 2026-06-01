import type { ActorRole } from "@benh-vien-so/domain";
import type {
  AuthenticatedActor,
  TokenPayload
} from "./auth-session.types.js";
import { maxAuthTokenTtlSeconds } from "./auth-session-config.js";

const maxClockSkewSeconds = 60;

export function assertValidDate(value: Date, message: string): void {
  if (Number.isNaN(value.getTime())) {
    throw new Error(message);
  }
}

export function hasValidTokenLifetime(
  payload: Partial<TokenPayload>,
  now: Date
): payload is TokenPayload {
  if (!isUnixTimestamp(payload.iat) || !isUnixTimestamp(payload.exp)) {
    return false;
  }

  const nowSeconds = Math.floor(now.getTime() / 1000);

  return (
    payload.iat <= nowSeconds + maxClockSkewSeconds &&
    payload.exp > nowSeconds &&
    payload.exp > payload.iat &&
    payload.exp - payload.iat <= maxAuthTokenTtlSeconds
  );
}

export function normalizeAuthenticatedActor(
  value: Partial<AuthenticatedActor>
): AuthenticatedActor | undefined {
  const actorId = normalizeRequiredText(value.actorId);
  const displayName = normalizeRequiredText(value.displayName);

  if (!actorId || !displayName || !isTokenRole(value.role)) {
    return undefined;
  }

  return {
    actorId,
    displayName,
    role: value.role
  };
}

function isUnixTimestamp(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    Number.isFinite(value) &&
    value > 0
  );
}

function normalizeRequiredText(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim().replace(/\s+/g, " ");
  return normalized || undefined;
}

function isTokenRole(value: unknown): value is ActorRole {
  return (
    value === "clinician" ||
    value === "nurse" ||
    value === "auditor" ||
    value === "admin" ||
    value === "integration"
  );
}

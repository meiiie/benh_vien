import { createHash } from "node:crypto";
import type { FastifyRequest } from "fastify";
import { AuditEvent } from "@benh-vien-so/domain";
import type { AuditEventRepository } from "@benh-vien-so/domain";

export async function recordLoginAuditEvent(
  auditRepository: AuditEventRepository | undefined,
  request: FastifyRequest,
  input: {
    readonly actorId: string;
    readonly action: "auth.login.success" | "auth.login.failure";
    readonly metadata: Record<string, unknown>;
  }
): Promise<void> {
  if (!auditRepository) {
    return;
  }

  await auditRepository.save(
    AuditEvent.record({
      actorId: input.actorId,
      action: input.action,
      resourceType: "AuditEvent",
      resourceId: "auth/login",
      purposeOfUse: "OPERATIONS",
      ipAddress: request.ip,
      userAgent: readHeader(request.headers["user-agent"]),
      metadata: {
        requestId: request.id,
        ...input.metadata
      }
    })
  );
}

export function readUsernameHash(value: unknown): string | undefined {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return undefined;
  }

  const username = (value as { readonly username?: unknown }).username;

  return typeof username === "string" ? hashLoginUsername(username) : undefined;
}

export function hashLoginUsername(username: string): string {
  return createHash("sha256").update(username.trim().toLowerCase()).digest("hex");
}

function readHeader(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

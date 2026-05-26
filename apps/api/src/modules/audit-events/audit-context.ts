import type { FastifyRequest } from "fastify";
import { AuditEvent } from "@benh-vien-so/domain";
import type {
  AuditAction,
  AuditEventRepository,
  AuditResourceType
} from "@benh-vien-so/domain";

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
  await repository.save(
    AuditEvent.record({
      actorId: readHeader(request.headers["x-actor-id"]) ?? "demo-clinician",
      action: input.action,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      patientId: input.patientId,
      purposeOfUse: readHeader(request.headers["x-purpose-of-use"]) ?? "TREATMENT",
      ipAddress: request.ip,
      userAgent: readHeader(request.headers["user-agent"]),
      metadata: input.metadata ?? {}
    })
  );
}

function readHeader(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

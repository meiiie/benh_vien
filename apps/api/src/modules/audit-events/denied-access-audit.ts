import type { FastifyRequest } from "fastify";
import type { AuditEventRepository } from "@benh-vien-so/domain";
import { recordAuditEvent } from "./audit-context.js";
import {
  inferDeniedAuditResourceType,
  isAuditableDeniedAccess,
  resolveDeniedAuditResourceId
} from "./denied-access-audit-policy.js";
import { recordInvalidPurposeOfUseAuditEvent } from "./denied-access-invalid-purpose-audit.js";

export type { DeniedAccessPayload } from "./denied-access-audit.types.js";
export { rememberDeniedAccessForAudit } from "./denied-access-payload-reader.js";

import type { DeniedAccessPayload } from "./denied-access-audit.types.js";

export async function recordDeniedAccessAuditEvent(
  auditEventRepository: AuditEventRepository,
  request: FastifyRequest,
  statusCode: number,
  deniedAccess: DeniedAccessPayload
): Promise<void> {
  if (!isAuditableDeniedAccess(statusCode, deniedAccess)) {
    return;
  }

  try {
    if (deniedAccess.error === "INVALID_PURPOSE_OF_USE") {
      await recordInvalidPurposeOfUseAuditEvent(auditEventRepository, request, statusCode);
      return;
    }

    await recordAuditEvent(auditEventRepository, request, {
      action: "access.denied",
      resourceType: inferDeniedAuditResourceType(deniedAccess),
      resourceId: resolveDeniedAuditResourceId(deniedAccess, request.id),
      patientId: deniedAccess.patientId,
      metadata: {
        denialCode: deniedAccess.error,
        deniedPermission: deniedAccess.permission,
        deniedActorId: deniedAccess.actor?.id,
        deniedActorRole: deniedAccess.actor?.role,
        deniedActorPurposeOfUse: deniedAccess.actor?.purposeOfUse,
        route: `${request.method} ${request.url}`,
        statusCode
      }
    });
  } catch (error) {
    request.log.error(
      { err: error, requestId: request.id },
      "Failed to record denied access audit event"
    );
  }
}

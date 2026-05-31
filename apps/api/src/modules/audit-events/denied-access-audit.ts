import type { FastifyRequest } from "fastify";
import { AuditEvent } from "@benh-vien-so/domain";
import type { AuditEventRepository, AuditResourceType } from "@benh-vien-so/domain";
import { readAuthenticatedActorIdentity } from "../access-control/access-context.js";
import { recordAuditEvent } from "./audit-context.js";

export type DeniedAccessPayload = {
  readonly error: "FORBIDDEN" | "PATIENT_ACCESS_DENIED" | "INVALID_PURPOSE_OF_USE";
  readonly requestId?: string;
  readonly permission?: string;
  readonly patientId?: string;
  readonly actor?: {
    readonly id?: string;
    readonly role?: string;
    readonly purposeOfUse?: string;
  };
};

const auditResourceByPermissionPrefix: Record<string, AuditResourceType> = {
  "patient:": "Patient",
  "provider-directory:": "ProviderDirectory",
  "record-transfer:": "RecordTransfer",
  "encounter:": "Encounter",
  "allergy-intolerance:": "AllergyIntolerance",
  "condition:": "Condition",
  "medication-request:": "MedicationRequest",
  "medication-dispense:": "MedicationDispense",
  "medication-administration:": "MedicationAdministration",
  "observation:": "Observation",
  "service-request:": "ServiceRequest",
  "workflow-task:": "Task",
  "procedure:": "Procedure",
  "diagnostic-report:": "DiagnosticReport",
  "imaging-study:": "ImagingStudy",
  "clinical-document:": "ClinicalDocument",
  "consent:": "Consent",
  "audit-event:": "AuditEvent"
};

export async function recordDeniedAccessAuditEvent(
  auditEventRepository: AuditEventRepository,
  request: FastifyRequest,
  statusCode: number,
  deniedAccess: DeniedAccessPayload
): Promise<void> {
  if (!isAuditableDeniedAccess(statusCode, deniedAccess)) {
    return;
  }

  const resourceType = inferDeniedAuditResourceType(deniedAccess);
  const resourceId =
    deniedAccess.error === "PATIENT_ACCESS_DENIED" && deniedAccess.patientId
      ? deniedAccess.patientId
      : deniedAccess.permission ?? request.id;

  try {
    if (deniedAccess.error === "INVALID_PURPOSE_OF_USE") {
      await recordInvalidPurposeOfUseAuditEvent(auditEventRepository, request, statusCode);
      return;
    }

    await recordAuditEvent(auditEventRepository, request, {
      action: "access.denied",
      resourceType,
      resourceId,
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

export function rememberDeniedAccessForAudit(
  deniedAccessPayloads: WeakMap<FastifyRequest, DeniedAccessPayload>,
  request: FastifyRequest,
  statusCode: number,
  payload: unknown
): void {
  if (statusCode !== 400 && statusCode !== 403) {
    return;
  }

  const payloadText = readPayloadText(payload);
  const deniedAccess = payloadText
    ? parseDeniedAccessPayload(payloadText)
    : undefined;

  if (deniedAccess && isAuditableDeniedAccess(statusCode, deniedAccess)) {
    deniedAccessPayloads.set(request, deniedAccess);
  }
}

async function recordInvalidPurposeOfUseAuditEvent(
  auditEventRepository: AuditEventRepository,
  request: FastifyRequest,
  statusCode: number
): Promise<void> {
  const actor = readAuthenticatedActorIdentity(request);

  if (!actor) {
    return;
  }

  await auditEventRepository.save(
    AuditEvent.record({
      actorId: actor.actorId,
      action: "access.denied",
      resourceType: "AuditEvent",
      resourceId: "x-purpose-of-use",
      purposeOfUse: "OPERATIONS",
      ipAddress: request.ip,
      userAgent: readHeader(request.headers["user-agent"]),
      metadata: {
        actorRole: actor.role,
        requestId: request.id,
        denialCode: "INVALID_PURPOSE_OF_USE",
        deniedActorId: actor.actorId,
        deniedActorRole: actor.role,
        deniedActorPurposeOfUse: "INVALID",
        rejectedHeader: "x-purpose-of-use",
        allowedPurposeOfUse: ["TREATMENT", "AUDIT", "OPERATIONS"],
        route: `${request.method} ${request.url}`,
        statusCode
      }
    })
  );
}

function parseDeniedAccessPayload(payload: string): DeniedAccessPayload | undefined {
  try {
    const parsedPayload = JSON.parse(payload) as unknown;

    if (isDeniedAccessPayload(parsedPayload)) {
      return parsedPayload;
    }

    return parseDeniedAccessOperationOutcome(parsedPayload);
  } catch {
    return undefined;
  }
}

function parseDeniedAccessOperationOutcome(value: unknown): DeniedAccessPayload | undefined {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return undefined;
  }

  if ((value as { readonly resourceType?: unknown }).resourceType !== "OperationOutcome") {
    return undefined;
  }

  const issue = (value as { readonly issue?: unknown }).issue;

  if (!Array.isArray(issue)) {
    return undefined;
  }

  const firstIssue = issue[0] as
    | {
        readonly details?: {
          readonly coding?: readonly { readonly code?: unknown }[];
        };
        readonly diagnostics?: unknown;
      }
    | undefined;
  const code = firstIssue?.details?.coding?.find(
    (coding) =>
      coding.code === "FORBIDDEN" ||
      coding.code === "PATIENT_ACCESS_DENIED" ||
      coding.code === "INVALID_PURPOSE_OF_USE"
  )?.code;

  if (
    code !== "FORBIDDEN" &&
    code !== "PATIENT_ACCESS_DENIED" &&
    code !== "INVALID_PURPOSE_OF_USE"
  ) {
    return undefined;
  }

  const diagnostics = parseOperationOutcomeDiagnostics(firstIssue?.diagnostics);

  return {
    error: code,
    requestId: diagnostics.requestId,
    permission: diagnostics.permission,
    patientId: diagnostics.patientId,
    actor: {
      id: diagnostics.actorId,
      role: diagnostics.actorRole,
      purposeOfUse: diagnostics.purposeOfUse
    }
  };
}

function parseOperationOutcomeDiagnostics(value: unknown): Record<string, string> {
  if (typeof value !== "string") {
    return {};
  }

  return Object.fromEntries(
    value
      .split(";")
      .map((part) => part.trim().split("="))
      .filter(
        (entry): entry is [string, string] =>
          entry.length === 2 && entry[0].length > 0 && entry[1].length > 0
      )
  );
}

function isDeniedAccessPayload(value: unknown): value is DeniedAccessPayload {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const error = (value as { readonly error?: unknown }).error;

  return (
    error === "FORBIDDEN" ||
    error === "PATIENT_ACCESS_DENIED" ||
    error === "INVALID_PURPOSE_OF_USE"
  );
}

function isAuditableDeniedAccess(statusCode: number, payload: DeniedAccessPayload): boolean {
  if (payload.error === "INVALID_PURPOSE_OF_USE") {
    return statusCode === 400;
  }

  return statusCode === 403;
}

function inferDeniedAuditResourceType(payload: DeniedAccessPayload): AuditResourceType {
  if (payload.error === "PATIENT_ACCESS_DENIED") {
    return "Patient";
  }

  if (payload.permission) {
    for (const [prefix, resourceType] of Object.entries(auditResourceByPermissionPrefix)) {
      if (payload.permission.startsWith(prefix)) {
        return resourceType;
      }
    }
  }

  return "AuditEvent";
}

function readHeader(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function readPayloadText(payload: unknown): string | undefined {
  if (typeof payload === "string") {
    return payload;
  }

  if (Buffer.isBuffer(payload)) {
    return payload.toString("utf8");
  }

  return undefined;
}

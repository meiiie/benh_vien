import type { FastifyReply, FastifyRequest } from "fastify";
import {
  canAccess,
  canAccessPatientRecord,
  isPurposeOfUse
} from "@benh-vien-so/domain";
import type {
  ActorContext,
  Patient,
  PatientRepository,
  Permission,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import { verifyAccessToken } from "../auth/auth-session.js";
import { readBearerToken } from "../auth/bearer-token.js";
import { sendFhirOperationOutcome } from "../fhir/operation-outcome-response.js";

export function readActorContext(request: FastifyRequest): ActorContext | undefined {
  const actorResult = readActorContextResult(request);

  return actorResult.kind === "actor" ? actorResult.actor : undefined;
}

type ActorContextReadResult =
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

function readActorContextResult(request: FastifyRequest): ActorContextReadResult {
  const token = readBearerToken(request.headers.authorization);
  const session = token ? verifyAccessToken(token) : undefined;

  if (!session) {
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
      actorId: session.actor.actorId,
      role: session.actor.role,
      purposeOfUse
    }
  };
}

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
    reply.header("WWW-Authenticate", "Bearer");

    if (acceptsFhirJson(request)) {
      sendFhirOperationOutcome(reply, {
        statusCode: 401,
        code: "login",
        diagnostics: `requestId=${request.id}`,
        expression: ["Authorization"],
        details: {
          code: "UNAUTHENTICATED",
          display: "Unauthenticated",
          text: "Cần đăng nhập và gửi Authorization Bearer token hợp lệ."
        }
      });

      return undefined;
    }

    reply.status(401).send({
      error: "UNAUTHENTICATED",
      message: "Cần đăng nhập và gửi Authorization Bearer token hợp lệ.",
      requestId: request.id
    });

    return undefined;
  }

  const actor = actorResult.actor;

  if (canAccess(actor, permission)) {
    return actor;
  }

  if (acceptsFhirJson(request)) {
    sendFhirOperationOutcome(reply, {
      statusCode: 403,
      code: "forbidden",
      diagnostics: [
        `requestId=${request.id}`,
        `permission=${permission}`,
        `actorId=${actor.actorId}`,
        `actorRole=${actor.role}`,
        `purposeOfUse=${actor.purposeOfUse}`
      ].join("; "),
      expression: ["Authorization", "Permission"],
      details: {
        code: "FORBIDDEN",
        display: "Forbidden",
        text: "Actor không có quyền thực hiện thao tác này."
      }
    });

    return undefined;
  }

  reply.status(403).send({
    error: "FORBIDDEN",
    message: "Actor không có quyền thực hiện thao tác này.",
    requestId: request.id,
    permission,
    actor: {
      id: actor.actorId,
      role: actor.role,
      purposeOfUse: actor.purposeOfUse
    }
  });

  return undefined;
}

export async function requirePatientRecordAccess(
  request: FastifyRequest,
  reply: FastifyReply,
  actor: ActorContext,
  patient: Patient,
  providerDirectoryRepository: ProviderDirectoryRepository
): Promise<boolean> {
  const providerDirectory = await providerDirectoryRepository.findDirectory();

  if (canAccessPatientRecord(actor, patient.toSnapshot(), providerDirectory.toSnapshot())) {
    return true;
  }

  if (acceptsFhirJson(request)) {
    sendFhirOperationOutcome(reply, {
      statusCode: 403,
      code: "forbidden",
      diagnostics: [
        `requestId=${request.id}`,
        `patientId=${patient.id}`,
        `actorId=${actor.actorId}`,
        `actorRole=${actor.role}`,
        `purposeOfUse=${actor.purposeOfUse}`
      ].join("; "),
      expression: ["Patient.id"],
      details: {
        code: "PATIENT_ACCESS_DENIED",
        display: "Patient access denied",
        text: "Actor không có quan hệ điều trị, quyền kiểm toán hoặc quyền quản trị phù hợp với hồ sơ bệnh nhân này."
      }
    });

    return false;
  }

  reply.status(403).send({
    error: "PATIENT_ACCESS_DENIED",
    message:
      "Actor không có quan hệ điều trị, quyền kiểm toán hoặc quyền quản trị phù hợp với hồ sơ bệnh nhân này.",
    requestId: request.id,
    patientId: patient.id,
    actor: {
      id: actor.actorId,
      role: actor.role,
      purposeOfUse: actor.purposeOfUse
    }
  });

  return false;
}

export async function requirePatientRecordAccessByPatientId(
  request: FastifyRequest,
  reply: FastifyReply,
  actor: ActorContext,
  patientId: string,
  patientRepository: PatientRepository,
  providerDirectoryRepository: ProviderDirectoryRepository
): Promise<Patient | undefined> {
  const patient = await patientRepository.findById(patientId);

  if (!patient) {
    reply.status(404).send({
      error: "PATIENT_NOT_FOUND",
      requestId: request.id
    });

    return undefined;
  }

  if (
    !(await requirePatientRecordAccess(
      request,
      reply,
      actor,
      patient,
      providerDirectoryRepository
    ))
  ) {
    return undefined;
  }

  if (isPatientRecordWriteRequest(request) && patient.toSnapshot().status === "merged") {
    sendMergedPatientRecordConflict(request, reply, patient);
    return undefined;
  }

  return patient;
}

export async function filterPatientsByAccess(
  actor: ActorContext,
  patients: readonly Patient[],
  providerDirectoryRepository: ProviderDirectoryRepository
): Promise<Patient[]> {
  const providerDirectory = await providerDirectoryRepository.findDirectory();
  const providerDirectorySnapshot = providerDirectory.toSnapshot();

  return patients.filter((patient) =>
    canAccessPatientRecord(actor, patient.toSnapshot(), providerDirectorySnapshot)
  );
}

function readHeader(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function acceptsFhirJson(request: FastifyRequest): boolean {
  return (
    readHeader(request.headers.accept)
      ?.split(",")
      .map((value) => value.trim().toLowerCase().split(";")[0])
      .includes("application/fhir+json") ?? false
  );
}

function isPatientRecordWriteRequest(request: FastifyRequest): boolean {
  return !["GET", "HEAD", "OPTIONS"].includes(request.method.toUpperCase());
}

function sendMergedPatientRecordConflict(
  request: FastifyRequest,
  reply: FastifyReply,
  patient: Patient
): void {
  const snapshot = patient.toSnapshot();

  if (acceptsFhirJson(request)) {
    sendFhirOperationOutcome(reply, {
      statusCode: 409,
      code: "conflict",
      diagnostics: [
        `requestId=${request.id}`,
        `patientId=${patient.id}`,
        `mergedIntoPatientId=${snapshot.mergedIntoPatientId ?? ""}`
      ].join("; "),
      expression: ["Patient.active", "Patient.link"],
      details: {
        code: "PATIENT_RECORD_MERGED",
        display: "Patient record merged",
        text:
          "Hồ sơ bệnh nhân này đã được merge vào hồ sơ chính; không được ghi dữ liệu mới vào hồ sơ nguồn."
      }
    });

    return;
  }

  reply.status(409).send({
    error: "PATIENT_RECORD_MERGED",
    message:
      "Hồ sơ bệnh nhân này đã được merge vào hồ sơ chính; không được ghi dữ liệu mới vào hồ sơ nguồn.",
    requestId: request.id,
    patientId: patient.id,
    mergedIntoPatientId: snapshot.mergedIntoPatientId,
    mergedAt: snapshot.mergedAt
  });
}

function sendInvalidPurposeOfUseResponse(
  request: FastifyRequest,
  reply: FastifyReply
): void {
  const message = "x-purpose-of-use phải là một trong các giá trị TREATMENT, AUDIT hoặc OPERATIONS.";

  if (acceptsFhirJson(request)) {
    sendFhirOperationOutcome(reply, {
      statusCode: 400,
      code: "invalid",
      diagnostics: `requestId=${request.id}; allowedPurposeOfUse=TREATMENT,AUDIT,OPERATIONS`,
      expression: ["x-purpose-of-use"],
      details: {
        code: "INVALID_PURPOSE_OF_USE",
        display: "Invalid purpose of use",
        text: message
      }
    });

    return;
  }

  reply.status(400).send({
    error: "INVALID_PURPOSE_OF_USE",
    message,
    requestId: request.id,
    allowedPurposeOfUse: ["TREATMENT", "AUDIT", "OPERATIONS"]
  });
}

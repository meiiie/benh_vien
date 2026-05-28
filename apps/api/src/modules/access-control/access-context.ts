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
import { sendFhirOperationOutcome } from "../fhir/operation-outcome-response.js";

export function readActorContext(request: FastifyRequest): ActorContext | undefined {
  const token = readBearerToken(request.headers.authorization);
  const session = token ? verifyAccessToken(token) : undefined;

  if (!session) {
    return undefined;
  }

  const rawPurposeOfUse = readHeader(request.headers["x-purpose-of-use"]) ?? "TREATMENT";

  return {
    actorId: session.actor.actorId,
    role: session.actor.role,
    purposeOfUse: isPurposeOfUse(rawPurposeOfUse) ? rawPurposeOfUse : "TREATMENT"
  };
}

export function requirePermission(
  request: FastifyRequest,
  reply: FastifyReply,
  permission: Permission
): ActorContext | undefined {
  const actor = readActorContext(request);

  if (!actor) {
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

function readBearerToken(value: string | string[] | undefined): string | undefined {
  const header = readHeader(value);

  if (!header?.startsWith("Bearer ")) {
    return undefined;
  }

  return header.slice("Bearer ".length).trim();
}

import type { FastifyReply, FastifyRequest } from "fastify";
import type { ActorContext, Patient } from "@benh-vien-so/domain";
import { sendFhirOperationOutcome } from "../fhir/operation-outcome-response.js";
import { acceptsFhirJson } from "./access-context-http.js";

const patientAccessDeniedMessage =
  "Actor không có quan hệ điều trị, quyền kiểm toán hoặc quyền quản trị phù hợp với hồ sơ bệnh nhân này.";

export function sendPatientNotFoundResponse(
  request: FastifyRequest,
  reply: FastifyReply
): void {
  reply.status(404).send({
    error: "PATIENT_NOT_FOUND",
    requestId: request.id
  });
}

export function sendPatientAccessDeniedResponse(
  request: FastifyRequest,
  reply: FastifyReply,
  actor: ActorContext,
  patient: Patient
): void {
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
        text: patientAccessDeniedMessage
      }
    });

    return;
  }

  reply.status(403).send({
    error: "PATIENT_ACCESS_DENIED",
    message: patientAccessDeniedMessage,
    requestId: request.id,
    patientId: patient.id,
    actor: {
      id: actor.actorId,
      role: actor.role,
      purposeOfUse: actor.purposeOfUse
    }
  });
}

export function sendMergedPatientRecordConflict(
  request: FastifyRequest,
  reply: FastifyReply,
  patient: Patient
): void {
  const snapshot = patient.toSnapshot();
  const message =
    "Hồ sơ bệnh nhân này đã được merge vào hồ sơ chính; không được ghi dữ liệu mới vào hồ sơ nguồn.";

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
        text: message
      }
    });

    return;
  }

  reply.status(409).send({
    error: "PATIENT_RECORD_MERGED",
    message,
    requestId: request.id,
    patientId: patient.id,
    mergedIntoPatientId: snapshot.mergedIntoPatientId,
    mergedAt: snapshot.mergedAt
  });
}

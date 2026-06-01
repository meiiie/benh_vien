import type { FastifyReply, FastifyRequest } from "fastify";
import { Patient } from "@benh-vien-so/domain";
import type {
  AuditEventRepository,
  PatientIdentifierConflict,
  PatientRepository
} from "@benh-vien-so/domain";
import { recordAuditEvent } from "../audit-events/audit-context.js";

export async function findPatientIdentifierConflict(
  repository: PatientRepository,
  patient: Patient
): Promise<PatientIdentifierConflict | undefined> {
  const snapshot = patient.toSnapshot();

  for (const identifier of snapshot.identifiers) {
    const existing = await repository.findByIdentifier(identifier);

    if (existing && existing.id !== snapshot.id) {
      return {
        existingPatientId: existing.id,
        identifier
      };
    }
  }

  return undefined;
}

export async function sendPatientIdentifierConflict(
  request: FastifyRequest,
  reply: FastifyReply,
  auditRepository: AuditEventRepository,
  patient: Patient,
  conflict: PatientIdentifierConflict
) {
  const snapshot = patient.toSnapshot();
  await recordAuditEvent(auditRepository, request, {
    action: "patient.identifier-conflict",
    resourceType: "Patient",
    resourceId: conflict.existingPatientId,
    patientId: conflict.existingPatientId === "unknown" ? undefined : conflict.existingPatientId,
    metadata: {
      requestedPatientId: snapshot.id,
      requestedManagingOrganizationId: snapshot.managingOrganizationId,
      identifierSystem: conflict.identifier.system,
      identifierType: conflict.identifier.type
    }
  });

  return reply.status(409).send({
    error: "PATIENT_IDENTIFIER_CONFLICT",
    message:
      "Định danh bệnh nhân đã thuộc về một hồ sơ khác. Cần đối soát/MPI thay vì tạo hồ sơ mới.",
    identifier: {
      system: conflict.identifier.system,
      type: conflict.identifier.type
    }
  });
}

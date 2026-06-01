import type { FastifyReply, FastifyRequest } from "fastify";
import type {
  ActorContext,
  AuditEvent,
  AuditEventSnapshot,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import { requirePatientRecordAccessByPatientId } from "../access-control/access-context.js";

export function toAuditEventResponse(event: AuditEvent): AuditEventSnapshot {
  return event.toSnapshot();
}

export async function requireAuditPatientRecordAccess(
  request: FastifyRequest,
  reply: FastifyReply,
  actor: ActorContext,
  patientId: string,
  patientRepository: PatientRepository,
  providerDirectoryRepository: ProviderDirectoryRepository
): Promise<boolean> {
  const patient = await requirePatientRecordAccessByPatientId(
    request,
    reply,
    actor,
    patientId,
    patientRepository,
    providerDirectoryRepository
  );

  return Boolean(patient);
}

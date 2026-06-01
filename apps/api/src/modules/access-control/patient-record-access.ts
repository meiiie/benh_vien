import type { FastifyReply, FastifyRequest } from "fastify";
import { canAccessPatientRecord } from "@benh-vien-so/domain";
import type {
  ActorContext,
  Patient,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import { isPatientRecordWriteRequest } from "./access-context-http.js";
import {
  sendMergedPatientRecordConflict,
  sendPatientAccessDeniedResponse,
  sendPatientNotFoundResponse
} from "./patient-record-access-responses.js";

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

  sendPatientAccessDeniedResponse(request, reply, actor, patient);
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
    sendPatientNotFoundResponse(request, reply);
    return undefined;
  }

  const hasAccess = await requirePatientRecordAccess(
    request,
    reply,
    actor,
    patient,
    providerDirectoryRepository
  );

  if (!hasAccess) {
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

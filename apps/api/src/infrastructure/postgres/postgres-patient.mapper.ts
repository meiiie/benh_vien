import { Patient } from "@benh-vien-so/domain";
import type { PatientIdentifier, PatientSnapshot } from "@benh-vien-so/domain";
import type { PatientRow } from "./postgres-patient.types.js";

export function rowToPatient(row: PatientRow): Patient {
  const identifiers =
    typeof row.identifiers === "string"
      ? (JSON.parse(row.identifiers) as PatientIdentifier[])
      : row.identifiers;

  return Patient.rehydrate({
    id: row.id,
    identifiers,
    fullName: row.full_name,
    birthDate: row.birth_date ?? undefined,
    gender: row.gender,
    address: row.address ?? undefined,
    phone: row.phone ?? undefined,
    managingOrganizationId: row.managing_organization_id,
    status: row.status,
    mergedIntoPatientId: row.merged_into_patient_id ?? undefined,
    mergedAt: row.merged_at ? toIsoString(row.merged_at) : undefined,
    mergedByActorId: row.merged_by_actor_id ?? undefined,
    mergeReason: row.merge_reason ?? undefined,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at)
  });
}

export function patientToUpsertValues(snapshot: PatientSnapshot): unknown[] {
  return [
    snapshot.id,
    JSON.stringify(snapshot.identifiers),
    snapshot.fullName,
    snapshot.birthDate ?? null,
    snapshot.gender,
    snapshot.address ?? null,
    snapshot.phone ?? null,
    snapshot.managingOrganizationId,
    snapshot.status,
    snapshot.mergedIntoPatientId ?? null,
    snapshot.mergedAt ?? null,
    snapshot.mergedByActorId ?? null,
    snapshot.mergeReason ?? null,
    snapshot.createdAt,
    snapshot.updatedAt
  ];
}

export function patientIdentifierIndexValues(
  snapshot: PatientSnapshot,
  identifier: PatientIdentifier
): unknown[] {
  return [snapshot.id, identifier.system, identifier.value, identifier.type];
}

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

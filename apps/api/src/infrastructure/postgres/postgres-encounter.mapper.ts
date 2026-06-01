import { Encounter } from "@benh-vien-so/domain";
import type { EncounterSnapshot } from "@benh-vien-so/domain";
import type { EncounterRow } from "./postgres-encounter.types.js";

export function rowToEncounter(row: EncounterRow): Encounter {
  const snapshot: EncounterSnapshot = {
    id: row.id,
    patientId: row.patient_id,
    status: row.status,
    class: row.encounter_class,
    serviceType: row.service_type,
    reasonText: row.reason_text,
    departmentId: row.department_id ?? undefined,
    attendingPractitionerId: row.attending_practitioner_id,
    startedAt: toIsoString(row.started_at),
    endedAt: row.ended_at ? toIsoString(row.ended_at) : undefined,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at)
  };

  return Encounter.rehydrate(snapshot);
}

export function encounterToUpsertValues(encounter: Encounter): unknown[] {
  const snapshot = encounter.toSnapshot();

  return [
    snapshot.id,
    snapshot.patientId,
    snapshot.status,
    snapshot.class,
    snapshot.serviceType,
    snapshot.reasonText,
    snapshot.departmentId ?? null,
    snapshot.attendingPractitionerId,
    snapshot.startedAt,
    snapshot.endedAt ?? null,
    snapshot.createdAt,
    snapshot.updatedAt
  ];
}

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

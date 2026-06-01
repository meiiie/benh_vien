import { Observation } from "@benh-vien-so/domain";
import type {
  ObservationCode,
  ObservationQuantity,
  ObservationSnapshot
} from "@benh-vien-so/domain";
import type { ObservationRow } from "./postgres-observation.types.js";

export function rowToObservation(row: ObservationRow): Observation {
  const snapshot: ObservationSnapshot = {
    id: row.id,
    patientId: row.patient_id,
    encounterId: row.encounter_id ?? undefined,
    status: row.status,
    category: row.category,
    code: parseJson<ObservationCode>(row.code),
    effectiveAt: toIsoString(row.effective_at),
    valueQuantity: row.value_quantity
      ? parseJson<ObservationQuantity>(row.value_quantity)
      : undefined,
    valueText: row.value_text ?? undefined,
    performerPractitionerId: row.performer_practitioner_id ?? undefined,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at)
  };

  return Observation.rehydrate(snapshot);
}

export function observationToUpsertValues(observation: Observation): unknown[] {
  const snapshot = observation.toSnapshot();

  return [
    snapshot.id,
    snapshot.patientId,
    snapshot.encounterId ?? null,
    snapshot.status,
    snapshot.category,
    JSON.stringify(snapshot.code),
    snapshot.effectiveAt,
    snapshot.valueQuantity ? JSON.stringify(snapshot.valueQuantity) : null,
    snapshot.valueText ?? null,
    snapshot.performerPractitionerId ?? null,
    snapshot.createdAt,
    snapshot.updatedAt
  ];
}

function parseJson<T>(value: T | string): T {
  return typeof value === "string" ? (JSON.parse(value) as T) : value;
}

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

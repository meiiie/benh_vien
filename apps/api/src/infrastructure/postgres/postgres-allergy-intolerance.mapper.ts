import { AllergyIntolerance } from "@benh-vien-so/domain";
import type {
  AllergyCode,
  AllergyIntoleranceSnapshot,
  AllergyReaction
} from "@benh-vien-so/domain";
import type { AllergyIntoleranceRow } from "./postgres-allergy-intolerance.types.js";

export function rowToAllergyIntolerance(
  row: AllergyIntoleranceRow
): AllergyIntolerance {
  const snapshot: AllergyIntoleranceSnapshot = {
    id: row.id,
    patientId: row.patient_id,
    encounterId: row.encounter_id ?? undefined,
    clinicalStatus: row.clinical_status,
    verificationStatus: row.verification_status,
    type: row.type,
    category: row.category,
    criticality: row.criticality ?? undefined,
    code: parseJson<AllergyCode>(row.code),
    reaction: row.reaction ? parseJson<AllergyReaction>(row.reaction) : undefined,
    recordedAt: toIsoString(row.recorded_at),
    recorderPractitionerId: row.recorder_practitioner_id,
    note: row.note ?? undefined,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at)
  };

  return AllergyIntolerance.rehydrate(snapshot);
}

export function allergyIntoleranceToUpsertValues(
  allergyIntolerance: AllergyIntolerance
): unknown[] {
  const snapshot = allergyIntolerance.toSnapshot();

  return [
    snapshot.id,
    snapshot.patientId,
    snapshot.encounterId ?? null,
    snapshot.clinicalStatus,
    snapshot.verificationStatus,
    snapshot.type,
    snapshot.category,
    snapshot.criticality ?? null,
    JSON.stringify(snapshot.code),
    snapshot.reaction ? JSON.stringify(snapshot.reaction) : null,
    snapshot.recordedAt,
    snapshot.recorderPractitionerId,
    snapshot.note ?? null,
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

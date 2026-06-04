import { Condition } from "@benh-vien-so/domain";
import type {
  ConditionCode,
  ConditionSnapshot
} from "@benh-vien-so/domain";
import type { ConditionRow } from "./postgres-condition.types.js";

export function rowToCondition(row: ConditionRow): Condition {
  const snapshot: ConditionSnapshot = {
    id: row.id,
    patientId: row.patient_id,
    encounterId: row.encounter_id ?? undefined,
    clinicalStatus: row.clinical_status,
    verificationStatus: row.verification_status,
    category: row.category,
    code: parseJson<ConditionCode>(row.code),
    severity: row.severity ?? undefined,
    onsetAt: row.onset_at ? toIsoString(row.onset_at) : undefined,
    recordedAt: toIsoString(row.recorded_at),
    recorderPractitionerId: row.recorder_practitioner_id,
    note: row.note ?? undefined,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at)
  };

  return Condition.rehydrate(snapshot);
}

export function conditionToUpsertValues(condition: Condition): unknown[] {
  const snapshot = condition.toSnapshot();

  return [
    snapshot.id,
    snapshot.patientId,
    snapshot.encounterId ?? null,
    snapshot.clinicalStatus,
    snapshot.verificationStatus,
    snapshot.category,
    JSON.stringify(snapshot.code),
    snapshot.severity ?? null,
    snapshot.onsetAt ?? null,
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

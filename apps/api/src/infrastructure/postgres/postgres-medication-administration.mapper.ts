import { MedicationAdministration } from "@benh-vien-so/domain";
import type {
  MedicationAdministrationDosage,
  MedicationAdministrationEffectivePeriod,
  MedicationAdministrationPerformer,
  MedicationAdministrationSnapshot,
  MedicationCode
} from "@benh-vien-so/domain";
import type { MedicationAdministrationRow } from "./postgres-medication-administration.types.js";

export function rowToMedicationAdministration(
  row: MedicationAdministrationRow
): MedicationAdministration {
  const snapshot: MedicationAdministrationSnapshot = {
    id: row.id,
    patientId: row.patient_id,
    encounterId: row.encounter_id ?? undefined,
    medicationRequestId: row.medication_request_id ?? undefined,
    reasonConditionId: row.reason_condition_id ?? undefined,
    status: row.status,
    statusReason: row.status_reason
      ? parseJson<MedicationCode>(row.status_reason)
      : undefined,
    category: row.category,
    medicationCode: parseJson<MedicationCode>(row.medication_code),
    effectivePeriod: normalizeEffectivePeriod(
      parseJson<MedicationAdministrationEffectivePeriod>(row.effective_period)
    ),
    performers: parseJson<MedicationAdministrationPerformer[]>(row.performers),
    dosage: row.dosage
      ? normalizeDosage(parseJson<MedicationAdministrationDosage>(row.dosage))
      : undefined,
    note: row.note ?? undefined,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at)
  };

  return MedicationAdministration.rehydrate(snapshot);
}

export function medicationAdministrationToUpsertValues(
  medicationAdministration: MedicationAdministration
): unknown[] {
  const snapshot = medicationAdministration.toSnapshot();

  return [
    snapshot.id,
    snapshot.patientId,
    snapshot.encounterId ?? null,
    snapshot.medicationRequestId ?? null,
    snapshot.reasonConditionId ?? null,
    snapshot.status,
    snapshot.statusReason ? JSON.stringify(snapshot.statusReason) : null,
    snapshot.category,
    JSON.stringify(snapshot.medicationCode),
    JSON.stringify(snapshot.effectivePeriod),
    JSON.stringify(snapshot.performers),
    snapshot.dosage ? JSON.stringify(snapshot.dosage) : null,
    snapshot.note ?? null,
    snapshot.createdAt,
    snapshot.updatedAt
  ];
}

function parseJson<T>(value: T | string): T {
  return typeof value === "string" ? (JSON.parse(value) as T) : value;
}

function normalizeEffectivePeriod(
  value: MedicationAdministrationEffectivePeriod
): MedicationAdministrationEffectivePeriod {
  return {
    start: value.start ? toIsoString(value.start) : undefined,
    end: value.end ? toIsoString(value.end) : undefined
  };
}

function normalizeDosage(
  value: MedicationAdministrationDosage
): MedicationAdministrationDosage {
  return {
    ...value,
    doseQuantity: value.doseQuantity ? { ...value.doseQuantity } : undefined
  };
}

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

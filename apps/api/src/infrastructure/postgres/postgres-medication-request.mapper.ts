import { MedicationRequest } from "@benh-vien-so/domain";
import type {
  DosageInstruction,
  MedicationCode,
  MedicationRequestSnapshot
} from "@benh-vien-so/domain";
import type { MedicationRequestRow } from "./postgres-medication-request.types.js";

export function rowToMedicationRequest(row: MedicationRequestRow): MedicationRequest {
  const snapshot: MedicationRequestSnapshot = {
    id: row.id,
    patientId: row.patient_id,
    encounterId: row.encounter_id ?? undefined,
    reasonConditionId: row.reason_condition_id ?? undefined,
    status: row.status,
    intent: row.intent,
    category: row.category,
    priority: row.priority,
    medicationCode: parseJson<MedicationCode>(row.medication_code),
    dosageInstruction: parseJson<DosageInstruction>(row.dosage_instruction),
    authoredOn: toIsoString(row.authored_on),
    requesterPractitionerId: row.requester_practitioner_id,
    expectedSupplyDurationDays: row.expected_supply_duration_days ?? undefined,
    note: row.note ?? undefined,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at)
  };

  return MedicationRequest.rehydrate(snapshot);
}

export function medicationRequestToUpsertValues(
  medicationRequest: MedicationRequest
): unknown[] {
  const snapshot = medicationRequest.toSnapshot();

  return [
    snapshot.id,
    snapshot.patientId,
    snapshot.encounterId ?? null,
    snapshot.reasonConditionId ?? null,
    snapshot.status,
    snapshot.intent,
    snapshot.category,
    snapshot.priority,
    JSON.stringify(snapshot.medicationCode),
    JSON.stringify(snapshot.dosageInstruction),
    snapshot.authoredOn,
    snapshot.requesterPractitionerId,
    snapshot.expectedSupplyDurationDays ?? null,
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

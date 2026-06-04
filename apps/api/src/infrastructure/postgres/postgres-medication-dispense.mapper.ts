import { MedicationDispense } from "@benh-vien-so/domain";
import type {
  DosageInstruction,
  MedicationCode,
  MedicationDispenseSnapshot,
  MedicationQuantity
} from "@benh-vien-so/domain";
import type { MedicationDispenseRow } from "./postgres-medication-dispense.types.js";

export function rowToMedicationDispense(
  row: MedicationDispenseRow
): MedicationDispense {
  const snapshot: MedicationDispenseSnapshot = {
    id: row.id,
    patientId: row.patient_id,
    encounterId: row.encounter_id ?? undefined,
    medicationRequestId: row.medication_request_id ?? undefined,
    status: row.status,
    statusReason: row.status_reason
      ? parseJson<MedicationCode>(row.status_reason)
      : undefined,
    category: row.category,
    medicationCode: parseJson<MedicationCode>(row.medication_code),
    quantity: row.quantity ? parseJson<MedicationQuantity>(row.quantity) : undefined,
    daysSupply: row.days_supply
      ? parseJson<MedicationQuantity>(row.days_supply)
      : undefined,
    whenPrepared: row.when_prepared ? toIsoString(row.when_prepared) : undefined,
    whenHandedOver: row.when_handed_over ? toIsoString(row.when_handed_over) : undefined,
    dispenserPractitionerId: row.dispenser_practitioner_id ?? undefined,
    destinationLocationId: row.destination_location_id ?? undefined,
    receiverPractitionerId: row.receiver_practitioner_id ?? undefined,
    dosageInstruction: row.dosage_instruction
      ? parseJson<DosageInstruction>(row.dosage_instruction)
      : undefined,
    note: row.note ?? undefined,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at)
  };

  return MedicationDispense.rehydrate(snapshot);
}

export function medicationDispenseToUpsertValues(
  medicationDispense: MedicationDispense
): unknown[] {
  const snapshot = medicationDispense.toSnapshot();

  return [
    snapshot.id,
    snapshot.patientId,
    snapshot.encounterId ?? null,
    snapshot.medicationRequestId ?? null,
    snapshot.status,
    snapshot.statusReason ? JSON.stringify(snapshot.statusReason) : null,
    snapshot.category,
    JSON.stringify(snapshot.medicationCode),
    snapshot.quantity ? JSON.stringify(snapshot.quantity) : null,
    snapshot.daysSupply ? JSON.stringify(snapshot.daysSupply) : null,
    snapshot.whenPrepared ?? null,
    snapshot.whenHandedOver ?? null,
    snapshot.dispenserPractitionerId ?? null,
    snapshot.destinationLocationId ?? null,
    snapshot.receiverPractitionerId ?? null,
    snapshot.dosageInstruction ? JSON.stringify(snapshot.dosageInstruction) : null,
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

import pg from "pg";
import { createPostgresRepositoryPool } from "./postgres-pool.js";
import { MedicationDispense } from "@benh-vien-so/domain";
import type {
  DosageInstruction,
  MedicationCode,
  MedicationDispenseCategory,
  MedicationDispenseRepository,
  MedicationDispenseSnapshot,
  MedicationDispenseStatus,
  MedicationQuantity
} from "@benh-vien-so/domain";

type MedicationDispenseRow = {
  id: string;
  patient_id: string;
  encounter_id: string | null;
  medication_request_id: string | null;
  status: MedicationDispenseStatus;
  status_reason: MedicationCode | string | null;
  category: MedicationDispenseCategory;
  medication_code: MedicationCode | string;
  quantity: MedicationQuantity | string | null;
  days_supply: MedicationQuantity | string | null;
  when_prepared: Date | string | null;
  when_handed_over: Date | string | null;
  dispenser_practitioner_id: string | null;
  destination_location_id: string | null;
  receiver_practitioner_id: string | null;
  dosage_instruction: DosageInstruction | string | null;
  note: string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

export class PostgresMedicationDispenseRepository
  implements MedicationDispenseRepository
{
  private readonly pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = createPostgresRepositoryPool(connectionString);
  }

  async findByPatientId(patientId: string): Promise<MedicationDispense[]> {
    const result = await this.pool.query<MedicationDispenseRow>(
      `SELECT
        id,
        patient_id,
        encounter_id,
        medication_request_id,
        status,
        status_reason,
        category,
        medication_code,
        quantity,
        days_supply,
        when_prepared,
        when_handed_over,
        dispenser_practitioner_id,
        destination_location_id,
        receiver_practitioner_id,
        dosage_instruction,
        note,
        created_at,
        updated_at
      FROM medication_dispenses
      WHERE patient_id = $1
      ORDER BY COALESCE(when_handed_over, when_prepared, updated_at) DESC`,
      [patientId]
    );

    return result.rows.map(rowToMedicationDispense);
  }

  async findById(id: string): Promise<MedicationDispense | undefined> {
    const result = await this.pool.query<MedicationDispenseRow>(
      `SELECT
        id,
        patient_id,
        encounter_id,
        medication_request_id,
        status,
        status_reason,
        category,
        medication_code,
        quantity,
        days_supply,
        when_prepared,
        when_handed_over,
        dispenser_practitioner_id,
        destination_location_id,
        receiver_practitioner_id,
        dosage_instruction,
        note,
        created_at,
        updated_at
      FROM medication_dispenses
      WHERE id = $1`,
      [id]
    );

    const row = result.rows[0];
    return row ? rowToMedicationDispense(row) : undefined;
  }

  async save(medicationDispense: MedicationDispense): Promise<void> {
    const snapshot = medicationDispense.toSnapshot();

    await this.pool.query(
      `INSERT INTO medication_dispenses (
        id,
        patient_id,
        encounter_id,
        medication_request_id,
        status,
        status_reason,
        category,
        medication_code,
        quantity,
        days_supply,
        when_prepared,
        when_handed_over,
        dispenser_practitioner_id,
        destination_location_id,
        receiver_practitioner_id,
        dosage_instruction,
        note,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8::jsonb, $9::jsonb, $10::jsonb, $11, $12, $13, $14, $15, $16::jsonb, $17, $18, $19)
      ON CONFLICT (id) DO UPDATE SET
        patient_id = EXCLUDED.patient_id,
        encounter_id = EXCLUDED.encounter_id,
        medication_request_id = EXCLUDED.medication_request_id,
        status = EXCLUDED.status,
        status_reason = EXCLUDED.status_reason,
        category = EXCLUDED.category,
        medication_code = EXCLUDED.medication_code,
        quantity = EXCLUDED.quantity,
        days_supply = EXCLUDED.days_supply,
        when_prepared = EXCLUDED.when_prepared,
        when_handed_over = EXCLUDED.when_handed_over,
        dispenser_practitioner_id = EXCLUDED.dispenser_practitioner_id,
        destination_location_id = EXCLUDED.destination_location_id,
        receiver_practitioner_id = EXCLUDED.receiver_practitioner_id,
        dosage_instruction = EXCLUDED.dosage_instruction,
        note = EXCLUDED.note,
        updated_at = EXCLUDED.updated_at`,
      [
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
      ]
    );
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

export async function seedMedicationDispensesIfEmpty(
  repository: MedicationDispenseRepository,
  seedMedicationDispenses: readonly MedicationDispense[]
): Promise<void> {
  const firstPatientId = seedMedicationDispenses[0]?.patientId;

  if (!firstPatientId) {
    return;
  }

  const medicationDispenses = await repository.findByPatientId(firstPatientId);

  if (medicationDispenses.length > 0) {
    return;
  }

  for (const medicationDispense of seedMedicationDispenses) {
    await repository.save(medicationDispense);
  }
}

function rowToMedicationDispense(row: MedicationDispenseRow): MedicationDispense {
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
    quantity: row.quantity
      ? parseJson<MedicationQuantity>(row.quantity)
      : undefined,
    daysSupply: row.days_supply
      ? parseJson<MedicationQuantity>(row.days_supply)
      : undefined,
    whenPrepared: row.when_prepared ? toIsoString(row.when_prepared) : undefined,
    whenHandedOver: row.when_handed_over
      ? toIsoString(row.when_handed_over)
      : undefined,
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

function parseJson<T>(value: T | string): T {
  return typeof value === "string" ? (JSON.parse(value) as T) : value;
}

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

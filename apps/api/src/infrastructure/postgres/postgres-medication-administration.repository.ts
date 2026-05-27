import pg from "pg";
import { MedicationAdministration } from "@benh-vien-so/domain";
import type {
  MedicationAdministrationCategory,
  MedicationAdministrationDosage,
  MedicationAdministrationEffectivePeriod,
  MedicationAdministrationPerformer,
  MedicationAdministrationRepository,
  MedicationAdministrationSnapshot,
  MedicationAdministrationStatus,
  MedicationCode
} from "@benh-vien-so/domain";

const { Pool } = pg;

type MedicationAdministrationRow = {
  id: string;
  patient_id: string;
  encounter_id: string | null;
  medication_request_id: string | null;
  reason_condition_id: string | null;
  status: MedicationAdministrationStatus;
  status_reason: MedicationCode | string | null;
  category: MedicationAdministrationCategory;
  medication_code: MedicationCode | string;
  effective_period: MedicationAdministrationEffectivePeriod | string;
  performers: MedicationAdministrationPerformer[] | string;
  dosage: MedicationAdministrationDosage | string | null;
  note: string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

export class PostgresMedicationAdministrationRepository
  implements MedicationAdministrationRepository
{
  private readonly pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
      max: 10
    });
  }

  async findByPatientId(patientId: string): Promise<MedicationAdministration[]> {
    const result = await this.pool.query<MedicationAdministrationRow>(
      `SELECT
        id,
        patient_id,
        encounter_id,
        medication_request_id,
        reason_condition_id,
        status,
        status_reason,
        category,
        medication_code,
        effective_period,
        performers,
        dosage,
        note,
        created_at,
        updated_at
      FROM medication_administrations
      WHERE patient_id = $1
      ORDER BY COALESCE(effective_period->>'start', updated_at::text) DESC`,
      [patientId]
    );

    return result.rows.map(rowToMedicationAdministration);
  }

  async findById(id: string): Promise<MedicationAdministration | undefined> {
    const result = await this.pool.query<MedicationAdministrationRow>(
      `SELECT
        id,
        patient_id,
        encounter_id,
        medication_request_id,
        reason_condition_id,
        status,
        status_reason,
        category,
        medication_code,
        effective_period,
        performers,
        dosage,
        note,
        created_at,
        updated_at
      FROM medication_administrations
      WHERE id = $1`,
      [id]
    );

    const row = result.rows[0];
    return row ? rowToMedicationAdministration(row) : undefined;
  }

  async save(medicationAdministration: MedicationAdministration): Promise<void> {
    const snapshot = medicationAdministration.toSnapshot();

    await this.pool.query(
      `INSERT INTO medication_administrations (
        id,
        patient_id,
        encounter_id,
        medication_request_id,
        reason_condition_id,
        status,
        status_reason,
        category,
        medication_code,
        effective_period,
        performers,
        dosage,
        note,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9::jsonb, $10::jsonb, $11::jsonb, $12::jsonb, $13, $14, $15)
      ON CONFLICT (id) DO UPDATE SET
        patient_id = EXCLUDED.patient_id,
        encounter_id = EXCLUDED.encounter_id,
        medication_request_id = EXCLUDED.medication_request_id,
        reason_condition_id = EXCLUDED.reason_condition_id,
        status = EXCLUDED.status,
        status_reason = EXCLUDED.status_reason,
        category = EXCLUDED.category,
        medication_code = EXCLUDED.medication_code,
        effective_period = EXCLUDED.effective_period,
        performers = EXCLUDED.performers,
        dosage = EXCLUDED.dosage,
        note = EXCLUDED.note,
        updated_at = EXCLUDED.updated_at`,
      [
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
      ]
    );
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

export async function seedMedicationAdministrationsIfEmpty(
  repository: MedicationAdministrationRepository,
  seedMedicationAdministrations: readonly MedicationAdministration[]
): Promise<void> {
  const firstPatientId = seedMedicationAdministrations[0]?.patientId;

  if (!firstPatientId) {
    return;
  }

  const medicationAdministrations = await repository.findByPatientId(firstPatientId);

  if (medicationAdministrations.length > 0) {
    return;
  }

  for (const medicationAdministration of seedMedicationAdministrations) {
    await repository.save(medicationAdministration);
  }
}

function rowToMedicationAdministration(
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

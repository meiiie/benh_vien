import pg from "pg";
import { Procedure } from "@benh-vien-so/domain";
import type {
  ProcedureCategory,
  ProcedureCoding,
  ProcedurePerformedPeriod,
  ProcedurePerformer,
  ProcedureReportReference,
  ProcedureRepository,
  ProcedureSnapshot,
  ProcedureStatus
} from "@benh-vien-so/domain";

const { Pool } = pg;

type ProcedureRow = {
  id: string;
  patient_id: string;
  encounter_id: string | null;
  based_on_service_request_id: string | null;
  part_of_procedure_id: string | null;
  status: ProcedureStatus;
  status_reason: ProcedureCoding | string | null;
  category: ProcedureCategory;
  code: ProcedureCoding | string;
  performed_period: ProcedurePerformedPeriod | string | null;
  recorder_practitioner_id: string | null;
  asserter_practitioner_id: string | null;
  performers: ProcedurePerformer[] | string;
  reason_condition_id: string | null;
  body_site: ProcedureCoding | string | null;
  outcome: ProcedureCoding | string | null;
  report_references: ProcedureReportReference[] | string;
  note: string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

export class PostgresProcedureRepository implements ProcedureRepository {
  private readonly pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
      max: 10
    });
  }

  async findByPatientId(patientId: string): Promise<Procedure[]> {
    const result = await this.pool.query<ProcedureRow>(
      `SELECT
        id,
        patient_id,
        encounter_id,
        based_on_service_request_id,
        part_of_procedure_id,
        status,
        status_reason,
        category,
        code,
        performed_period,
        recorder_practitioner_id,
        asserter_practitioner_id,
        performers,
        reason_condition_id,
        body_site,
        outcome,
        report_references,
        note,
        created_at,
        updated_at
      FROM procedures
      WHERE patient_id = $1
      ORDER BY COALESCE(performed_period->>'start', updated_at::text) DESC`,
      [patientId]
    );

    return result.rows.map(rowToProcedure);
  }

  async findById(id: string): Promise<Procedure | undefined> {
    const result = await this.pool.query<ProcedureRow>(
      `SELECT
        id,
        patient_id,
        encounter_id,
        based_on_service_request_id,
        part_of_procedure_id,
        status,
        status_reason,
        category,
        code,
        performed_period,
        recorder_practitioner_id,
        asserter_practitioner_id,
        performers,
        reason_condition_id,
        body_site,
        outcome,
        report_references,
        note,
        created_at,
        updated_at
      FROM procedures
      WHERE id = $1`,
      [id]
    );

    const row = result.rows[0];
    return row ? rowToProcedure(row) : undefined;
  }

  async save(procedure: Procedure): Promise<void> {
    const snapshot = procedure.toSnapshot();

    await this.pool.query(
      `INSERT INTO procedures (
        id,
        patient_id,
        encounter_id,
        based_on_service_request_id,
        part_of_procedure_id,
        status,
        status_reason,
        category,
        code,
        performed_period,
        recorder_practitioner_id,
        asserter_practitioner_id,
        performers,
        reason_condition_id,
        body_site,
        outcome,
        report_references,
        note,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9::jsonb, $10::jsonb, $11, $12, $13::jsonb, $14, $15::jsonb, $16::jsonb, $17::jsonb, $18, $19, $20)
      ON CONFLICT (id) DO UPDATE SET
        patient_id = EXCLUDED.patient_id,
        encounter_id = EXCLUDED.encounter_id,
        based_on_service_request_id = EXCLUDED.based_on_service_request_id,
        part_of_procedure_id = EXCLUDED.part_of_procedure_id,
        status = EXCLUDED.status,
        status_reason = EXCLUDED.status_reason,
        category = EXCLUDED.category,
        code = EXCLUDED.code,
        performed_period = EXCLUDED.performed_period,
        recorder_practitioner_id = EXCLUDED.recorder_practitioner_id,
        asserter_practitioner_id = EXCLUDED.asserter_practitioner_id,
        performers = EXCLUDED.performers,
        reason_condition_id = EXCLUDED.reason_condition_id,
        body_site = EXCLUDED.body_site,
        outcome = EXCLUDED.outcome,
        report_references = EXCLUDED.report_references,
        note = EXCLUDED.note,
        updated_at = EXCLUDED.updated_at`,
      [
        snapshot.id,
        snapshot.patientId,
        snapshot.encounterId ?? null,
        snapshot.basedOnServiceRequestId ?? null,
        snapshot.partOfProcedureId ?? null,
        snapshot.status,
        snapshot.statusReason ? JSON.stringify(snapshot.statusReason) : null,
        snapshot.category,
        JSON.stringify(snapshot.code),
        snapshot.performedPeriod ? JSON.stringify(snapshot.performedPeriod) : null,
        snapshot.recorderPractitionerId ?? null,
        snapshot.asserterPractitionerId ?? null,
        JSON.stringify(snapshot.performers),
        snapshot.reasonConditionId ?? null,
        snapshot.bodySite ? JSON.stringify(snapshot.bodySite) : null,
        snapshot.outcome ? JSON.stringify(snapshot.outcome) : null,
        JSON.stringify(snapshot.reportReferences),
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

export async function seedProceduresIfEmpty(
  repository: ProcedureRepository,
  seedProcedures: readonly Procedure[]
): Promise<void> {
  const firstPatientId = seedProcedures[0]?.patientId;

  if (!firstPatientId) {
    return;
  }

  const procedures = await repository.findByPatientId(firstPatientId);

  if (procedures.length > 0) {
    return;
  }

  for (const procedure of seedProcedures) {
    await repository.save(procedure);
  }
}

function rowToProcedure(row: ProcedureRow): Procedure {
  const snapshot: ProcedureSnapshot = {
    id: row.id,
    patientId: row.patient_id,
    encounterId: row.encounter_id ?? undefined,
    basedOnServiceRequestId: row.based_on_service_request_id ?? undefined,
    partOfProcedureId: row.part_of_procedure_id ?? undefined,
    status: row.status,
    statusReason: row.status_reason ? parseJson<ProcedureCoding>(row.status_reason) : undefined,
    category: row.category,
    code: parseJson<ProcedureCoding>(row.code),
    performedPeriod: row.performed_period
      ? normalizePerformedPeriod(parseJson<ProcedurePerformedPeriod>(row.performed_period))
      : undefined,
    recorderPractitionerId: row.recorder_practitioner_id ?? undefined,
    asserterPractitionerId: row.asserter_practitioner_id ?? undefined,
    performers: parseJson<ProcedurePerformer[]>(row.performers),
    reasonConditionId: row.reason_condition_id ?? undefined,
    bodySite: row.body_site ? parseJson<ProcedureCoding>(row.body_site) : undefined,
    outcome: row.outcome ? parseJson<ProcedureCoding>(row.outcome) : undefined,
    reportReferences: parseJson<ProcedureReportReference[]>(row.report_references),
    note: row.note ?? undefined,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at)
  };

  return Procedure.rehydrate(snapshot);
}

function parseJson<T>(value: T | string): T {
  return typeof value === "string" ? (JSON.parse(value) as T) : value;
}

function normalizePerformedPeriod(
  value: ProcedurePerformedPeriod
): ProcedurePerformedPeriod {
  return {
    start: value.start ? toIsoString(value.start) : undefined,
    end: value.end ? toIsoString(value.end) : undefined
  };
}

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

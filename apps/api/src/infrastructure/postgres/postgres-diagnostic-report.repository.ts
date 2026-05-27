import pg from "pg";
import { DiagnosticReport } from "@benh-vien-so/domain";
import type {
  DiagnosticReportCategory,
  DiagnosticReportCode,
  DiagnosticReportRepository,
  DiagnosticReportSnapshot,
  DiagnosticReportStatus
} from "@benh-vien-so/domain";

const { Pool } = pg;

type DiagnosticReportRow = {
  id: string;
  patient_id: string;
  encounter_id: string | null;
  based_on_service_request_id: string | null;
  status: DiagnosticReportStatus;
  category: DiagnosticReportCategory;
  code: DiagnosticReportCode | string;
  effective_at: Date | string;
  issued_at: Date | string;
  performer_organization_id: string | null;
  results_interpreter_practitioner_id: string | null;
  result_observation_ids: string[] | string;
  conclusion: string | null;
  presented_form_url: string | null;
  presented_form_title: string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

export class PostgresDiagnosticReportRepository implements DiagnosticReportRepository {
  private readonly pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
      max: 10
    });
  }

  async findByPatientId(patientId: string): Promise<DiagnosticReport[]> {
    const result = await this.pool.query<DiagnosticReportRow>(
      `SELECT
        id,
        patient_id,
        encounter_id,
        based_on_service_request_id,
        status,
        category,
        code,
        effective_at,
        issued_at,
        performer_organization_id,
        results_interpreter_practitioner_id,
        result_observation_ids,
        conclusion,
        presented_form_url,
        presented_form_title,
        created_at,
        updated_at
      FROM diagnostic_reports
      WHERE patient_id = $1
      ORDER BY issued_at DESC`,
      [patientId]
    );

    return result.rows.map(rowToDiagnosticReport);
  }

  async findById(id: string): Promise<DiagnosticReport | undefined> {
    const result = await this.pool.query<DiagnosticReportRow>(
      `SELECT
        id,
        patient_id,
        encounter_id,
        based_on_service_request_id,
        status,
        category,
        code,
        effective_at,
        issued_at,
        performer_organization_id,
        results_interpreter_practitioner_id,
        result_observation_ids,
        conclusion,
        presented_form_url,
        presented_form_title,
        created_at,
        updated_at
      FROM diagnostic_reports
      WHERE id = $1`,
      [id]
    );

    const row = result.rows[0];
    return row ? rowToDiagnosticReport(row) : undefined;
  }

  async save(diagnosticReport: DiagnosticReport): Promise<void> {
    const snapshot = diagnosticReport.toSnapshot();

    await this.pool.query(
      `INSERT INTO diagnostic_reports (
        id,
        patient_id,
        encounter_id,
        based_on_service_request_id,
        status,
        category,
        code,
        effective_at,
        issued_at,
        performer_organization_id,
        results_interpreter_practitioner_id,
        result_observation_ids,
        conclusion,
        presented_form_url,
        presented_form_title,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10, $11, $12::jsonb, $13, $14, $15, $16, $17)
      ON CONFLICT (id) DO UPDATE SET
        patient_id = EXCLUDED.patient_id,
        encounter_id = EXCLUDED.encounter_id,
        based_on_service_request_id = EXCLUDED.based_on_service_request_id,
        status = EXCLUDED.status,
        category = EXCLUDED.category,
        code = EXCLUDED.code,
        effective_at = EXCLUDED.effective_at,
        issued_at = EXCLUDED.issued_at,
        performer_organization_id = EXCLUDED.performer_organization_id,
        results_interpreter_practitioner_id = EXCLUDED.results_interpreter_practitioner_id,
        result_observation_ids = EXCLUDED.result_observation_ids,
        conclusion = EXCLUDED.conclusion,
        presented_form_url = EXCLUDED.presented_form_url,
        presented_form_title = EXCLUDED.presented_form_title,
        updated_at = EXCLUDED.updated_at`,
      [
        snapshot.id,
        snapshot.patientId,
        snapshot.encounterId ?? null,
        snapshot.basedOnServiceRequestId ?? null,
        snapshot.status,
        snapshot.category,
        JSON.stringify(snapshot.code),
        snapshot.effectiveAt,
        snapshot.issuedAt,
        snapshot.performerOrganizationId ?? null,
        snapshot.resultsInterpreterPractitionerId ?? null,
        JSON.stringify(snapshot.resultObservationIds),
        snapshot.conclusion ?? null,
        snapshot.presentedFormUrl ?? null,
        snapshot.presentedFormTitle ?? null,
        snapshot.createdAt,
        snapshot.updatedAt
      ]
    );
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

export async function seedDiagnosticReportsIfEmpty(
  repository: DiagnosticReportRepository,
  seedDiagnosticReports: readonly DiagnosticReport[]
): Promise<void> {
  const firstPatientId = seedDiagnosticReports[0]?.patientId;

  if (!firstPatientId) {
    return;
  }

  const diagnosticReports = await repository.findByPatientId(firstPatientId);

  if (diagnosticReports.length > 0) {
    return;
  }

  for (const diagnosticReport of seedDiagnosticReports) {
    await repository.save(diagnosticReport);
  }
}

function rowToDiagnosticReport(row: DiagnosticReportRow): DiagnosticReport {
  const code =
    typeof row.code === "string" ? (JSON.parse(row.code) as DiagnosticReportCode) : row.code;
  const resultObservationIds =
    typeof row.result_observation_ids === "string"
      ? (JSON.parse(row.result_observation_ids) as string[])
      : row.result_observation_ids;

  const snapshot: DiagnosticReportSnapshot = {
    id: row.id,
    patientId: row.patient_id,
    encounterId: row.encounter_id ?? undefined,
    basedOnServiceRequestId: row.based_on_service_request_id ?? undefined,
    status: row.status,
    category: row.category,
    code,
    effectiveAt: toIsoString(row.effective_at),
    issuedAt: toIsoString(row.issued_at),
    performerOrganizationId: row.performer_organization_id ?? undefined,
    resultsInterpreterPractitionerId: row.results_interpreter_practitioner_id ?? undefined,
    resultObservationIds,
    conclusion: row.conclusion ?? undefined,
    presentedFormUrl: row.presented_form_url ?? undefined,
    presentedFormTitle: row.presented_form_title ?? undefined,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at)
  };

  return DiagnosticReport.rehydrate(snapshot);
}

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

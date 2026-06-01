import pg from "pg";
import { createPostgresRepositoryPool } from "./postgres-pool.js";
import type {
  DiagnosticReport,
  DiagnosticReportRepository,
} from "@benh-vien-so/domain";
import { rowToDiagnosticReport } from "./postgres-diagnostic-report.mapper.js";
import { upsertDiagnosticReport } from "./postgres-diagnostic-report.persistence.js";
import { selectDiagnosticReportSql } from "./postgres-diagnostic-report.sql.js";
import type { DiagnosticReportRow } from "./postgres-diagnostic-report.types.js";

export class PostgresDiagnosticReportRepository implements DiagnosticReportRepository {
  private readonly pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = createPostgresRepositoryPool(connectionString);
  }

  async findByPatientId(patientId: string): Promise<DiagnosticReport[]> {
    const result = await this.pool.query<DiagnosticReportRow>(
      `${selectDiagnosticReportSql}
      WHERE patient_id = $1
      ORDER BY issued_at DESC`,
      [patientId]
    );

    return result.rows.map(rowToDiagnosticReport);
  }

  async findById(id: string): Promise<DiagnosticReport | undefined> {
    const result = await this.pool.query<DiagnosticReportRow>(
      `${selectDiagnosticReportSql}
      WHERE id = $1`,
      [id]
    );

    const row = result.rows[0];
    return row ? rowToDiagnosticReport(row) : undefined;
  }

  async save(diagnosticReport: DiagnosticReport): Promise<void> {
    await upsertDiagnosticReport(this.pool, diagnosticReport);
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

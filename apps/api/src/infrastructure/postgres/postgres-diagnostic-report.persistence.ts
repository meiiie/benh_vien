import type pg from "pg";
import type { DiagnosticReport } from "@benh-vien-so/domain";
import { diagnosticReportToUpsertValues } from "./postgres-diagnostic-report.mapper.js";
import { upsertDiagnosticReportSql } from "./postgres-diagnostic-report.sql.js";

export async function upsertDiagnosticReport(
  queryable: Pick<pg.Pool | pg.PoolClient, "query">,
  diagnosticReport: DiagnosticReport
): Promise<void> {
  await queryable.query(
    upsertDiagnosticReportSql,
    diagnosticReportToUpsertValues(diagnosticReport)
  );
}

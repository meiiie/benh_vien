import type { DiagnosticReportRepository } from "@benh-vien-so/domain";
import {
  InMemoryDiagnosticReportRepository,
  createSeedDiagnosticReports
} from "./in-memory-diagnostic-report.repository.js";
import {
  PostgresDiagnosticReportRepository,
  seedDiagnosticReportsIfEmpty
} from "../../infrastructure/postgres/postgres-diagnostic-report.repository.js";

export async function createDiagnosticReportRepository(): Promise<DiagnosticReportRepository> {
  const seedDiagnosticReports = createSeedDiagnosticReports();

  if (process.env.BVS_REPOSITORY === "postgres") {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error("DATABASE_URL is required when BVS_REPOSITORY=postgres.");
    }

    const repository = new PostgresDiagnosticReportRepository(databaseUrl);
    await seedDiagnosticReportsIfEmpty(repository, seedDiagnosticReports);
    return repository;
  }

  return new InMemoryDiagnosticReportRepository(seedDiagnosticReports);
}

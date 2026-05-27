import type { DiagnosticReport } from "./diagnostic-report.js";

export interface DiagnosticReportRepository {
  findByPatientId(patientId: string): Promise<DiagnosticReport[]>;
  findById(id: string): Promise<DiagnosticReport | undefined>;
  save(diagnosticReport: DiagnosticReport): Promise<void>;
}

import { DiagnosticReport } from "./diagnostic-report.js";
import type {
  CreateDiagnosticReportInput,
  DiagnosticReportSnapshot
} from "./diagnostic-report.types.js";

type CreateDiagnosticReportOverrides = Partial<CreateDiagnosticReportInput>;

export function createLaboratoryDiagnosticReportInput(
  overrides: CreateDiagnosticReportOverrides = {}
): CreateDiagnosticReportInput {
  return {
    id: "diagnostic-report-test-fixture",
    patientId: "patient-001",
    encounterId: "encounter-001",
    basedOnServiceRequestId: "service-request-001",
    category: "laboratory",
    code: {
      system: "http://loinc.org",
      code: "58410-2",
      display: "Complete blood count panel"
    },
    effectiveAt: "2026-05-28T02:30:00.000Z",
    issuedAt: "2026-05-28T03:00:00.000Z",
    performerOrganizationId: "department-laboratory",
    resultsInterpreterPractitionerId: "practitioner-001",
    resultObservationIds: ["observation-001", "observation-001", " observation-002 "],
    conclusion: "Các chỉ số trong giới hạn theo bối cảnh lâm sàng.",
    ...overrides
  };
}

export function createLaboratoryDiagnosticReportSnapshot(
  overrides: CreateDiagnosticReportOverrides = {}
): DiagnosticReportSnapshot {
  return DiagnosticReport.issue(createLaboratoryDiagnosticReportInput(overrides)).toSnapshot();
}

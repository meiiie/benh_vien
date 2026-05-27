import { DiagnosticReport } from "@benh-vien-so/domain";
import type { DiagnosticReportRepository } from "@benh-vien-so/domain";

export class InMemoryDiagnosticReportRepository implements DiagnosticReportRepository {
  private readonly diagnosticReports = new Map<string, DiagnosticReport>();

  constructor(seedDiagnosticReports: readonly DiagnosticReport[] = []) {
    for (const diagnosticReport of seedDiagnosticReports) {
      this.diagnosticReports.set(diagnosticReport.id, cloneDiagnosticReport(diagnosticReport));
    }
  }

  async findByPatientId(patientId: string): Promise<DiagnosticReport[]> {
    return [...this.diagnosticReports.values()]
      .filter((diagnosticReport) => diagnosticReport.patientId === patientId)
      .sort((left, right) => right.toSnapshot().issuedAt.localeCompare(left.toSnapshot().issuedAt))
      .map(cloneDiagnosticReport);
  }

  async findById(id: string): Promise<DiagnosticReport | undefined> {
    const diagnosticReport = this.diagnosticReports.get(id);
    return diagnosticReport ? cloneDiagnosticReport(diagnosticReport) : undefined;
  }

  async save(diagnosticReport: DiagnosticReport): Promise<void> {
    this.diagnosticReports.set(diagnosticReport.id, cloneDiagnosticReport(diagnosticReport));
  }
}

export function createSeedDiagnosticReports(): DiagnosticReport[] {
  return [
    DiagnosticReport.issue({
      id: "diagnostic-report-demo-001",
      patientId: "patient-demo-001",
      encounterId: "encounter-demo-001",
      basedOnServiceRequestId: "service-request-demo-001",
      category: "laboratory",
      code: {
        system: "http://loinc.org",
        code: "58410-2",
        display: "Complete blood count panel"
      },
      effectiveAt: "2026-05-26T04:20:00.000Z",
      issuedAt: "2026-05-26T04:45:00.000Z",
      performerOrganizationId: "department-laboratory",
      resultsInterpreterPractitionerId: "practitioner-demo-002",
      resultObservationIds: ["observation-demo-001"],
      conclusion: "Hemoglobin trong giới hạn tham chiếu của lát cắt demo."
    }),
    DiagnosticReport.issue({
      id: "diagnostic-report-demo-002",
      patientId: "patient-demo-001",
      encounterId: "encounter-demo-002",
      basedOnServiceRequestId: "service-request-demo-002",
      category: "imaging",
      code: {
        system: "http://loinc.org",
        code: "30746-2",
        display: "Chest X-ray report"
      },
      effectiveAt: "2026-05-27T05:00:00.000Z",
      issuedAt: "2026-05-27T05:35:00.000Z",
      performerOrganizationId: "department-diagnostic-imaging",
      resultsInterpreterPractitionerId: "practitioner-demo-001",
      resultObservationIds: [],
      conclusion: "Không ghi nhận tổn thương cấp tính trên phim X-quang ngực demo.",
      presentedFormUrl: "wiiicare://reports/diagnostic-report-demo-002.pdf",
      presentedFormTitle: "Báo cáo X-quang ngực demo"
    })
  ];
}

function cloneDiagnosticReport(diagnosticReport: DiagnosticReport): DiagnosticReport {
  return DiagnosticReport.rehydrate(diagnosticReport.toSnapshot());
}

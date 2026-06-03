import { describe, expect, it } from "vitest";
import { DiagnosticReport } from "./diagnostic-report.js";
import { createLaboratoryDiagnosticReportInput } from "./diagnostic-report.test-support.js";

describe("DiagnosticReport issuing", () => {
  it("issues a result report linked to a service request and observations", () => {
    const diagnosticReport = DiagnosticReport.issue(
      createLaboratoryDiagnosticReportInput({
        id: "diagnostic-report-001"
      })
    );

    expect(diagnosticReport.toSnapshot()).toMatchObject({
      id: "diagnostic-report-001",
      patientId: "patient-001",
      encounterId: "encounter-001",
      basedOnServiceRequestId: "service-request-001",
      status: "final",
      category: "laboratory",
      effectiveAt: "2026-05-28T02:30:00.000Z",
      issuedAt: "2026-05-28T03:00:00.000Z",
      resultObservationIds: ["observation-001", "observation-002"]
    });
  });
});

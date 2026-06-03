import { describe, expect, it } from "vitest";
import { DomainError } from "../shared/domain-error.js";
import { DiagnosticReport } from "./diagnostic-report.js";
import { createLaboratoryDiagnosticReportInput } from "./diagnostic-report.test-support.js";

describe("DiagnosticReport validation", () => {
  it("rejects reports without atomic results, conclusion or attachment", () => {
    expect(() =>
      DiagnosticReport.issue(
        createLaboratoryDiagnosticReportInput({
          id: "diagnostic-report-003",
          resultObservationIds: [],
          conclusion: " "
        })
      )
    ).toThrow(DomainError);
  });

  it("rejects invalid effective date", () => {
    expect(() =>
      DiagnosticReport.issue(
        createLaboratoryDiagnosticReportInput({
          id: "diagnostic-report-004",
          category: "pathology",
          code: {
            system: "http://loinc.org",
            code: "60568-3",
            display: "Pathology report"
          },
          effectiveAt: "not-a-date",
          conclusion: "Cần kiểm tra lại."
        })
      )
    ).toThrow(DomainError);
  });

  it("rejects reports issued before their effective time", () => {
    expect(() =>
      DiagnosticReport.issue(
        createLaboratoryDiagnosticReportInput({
          id: "diagnostic-report-invalid-timeline-001",
          effectiveAt: "2026-05-28T03:00:00.000Z",
          issuedAt: "2026-05-28T02:59:59.000Z",
          resultObservationIds: ["observation-001"]
        })
      )
    ).toThrow(DomainError);
  });
});

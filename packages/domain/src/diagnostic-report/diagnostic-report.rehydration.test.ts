import { describe, expect, it } from "vitest";
import { DomainError } from "../shared/domain-error.js";
import { DiagnosticReport } from "./diagnostic-report.js";
import { createLaboratoryDiagnosticReportSnapshot } from "./diagnostic-report.test-support.js";
import type { DiagnosticReportSnapshot } from "./diagnostic-report.types.js";

describe("DiagnosticReport rehydration", () => {
  it("rejects invalid rehydrated diagnostic report metadata", () => {
    const snapshot = createLaboratoryDiagnosticReportSnapshot({
      id: "diagnostic-report-005",
      resultObservationIds: ["observation-001"],
      conclusion: "Within expected range for the clinical context."
    });

    const invalidOverrides: Array<Partial<DiagnosticReportSnapshot>> = [
      { status: "signed" as never },
      { category: "microbiology" as never },
      {
        code: {
          ...snapshot.code,
          code: " "
        }
      },
      { effectiveAt: "not-a-date" },
      { resultObservationIds: [], conclusion: " " },
      { presentedFormTitle: "Signed PDF" },
      { patientId: " " },
      { createdAt: "not-a-date" },
      { issuedAt: "2026-05-28T02:29:59.000Z" },
      { updatedAt: "1999-01-01T00:00:00.000Z" }
    ];

    for (const invalidOverride of invalidOverrides) {
      expect(() =>
        DiagnosticReport.rehydrate({
          ...snapshot,
          ...invalidOverride
        })
      ).toThrow(DomainError);
    }
  });
});

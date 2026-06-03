import { describe, expect, it } from "vitest";
import { mapDiagnosticReportToFhir } from "../fhir/map-diagnostic-report-to-fhir.js";
import { DiagnosticReport } from "./diagnostic-report.js";
import { createLaboratoryDiagnosticReportInput } from "./diagnostic-report.test-support.js";

describe("DiagnosticReport FHIR mapping", () => {
  it("maps report category, order and atomic results to FHIR", () => {
    const diagnosticReport = DiagnosticReport.issue(
      createLaboratoryDiagnosticReportInput({
        id: "diagnostic-report-002",
        category: "imaging",
        code: {
          system: "http://loinc.org",
          code: "30746-2",
          display: "Chest X-ray report"
        },
        resultObservationIds: ["observation-001"],
        conclusion: "Không thấy tổn thương cấp tính."
      })
    );

    expect(mapDiagnosticReportToFhir(diagnosticReport)).toMatchObject({
      resourceType: "DiagnosticReport",
      basedOn: [{ reference: "ServiceRequest/service-request-001" }],
      category: [
        {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/v2-0074",
              code: "RAD",
              display: "Radiology"
            }
          ]
        }
      ],
      result: [{ reference: "Observation/observation-001" }]
    });
  });
});

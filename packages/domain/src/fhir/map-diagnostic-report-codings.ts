import type {
  DiagnosticReportCategory,
  DiagnosticReportCode
} from "../diagnostic-report/diagnostic-report.types.js";
import type { FhirDiagnosticReport } from "./fhir-types.js";

const diagnosticServiceSectionSystem = "http://terminology.hl7.org/CodeSystem/v2-0074";

const categoryCodings: Record<
  DiagnosticReportCategory,
  { readonly code: string; readonly display: string }
> = {
  imaging: {
    code: "RAD",
    display: "Radiology"
  },
  laboratory: {
    code: "LAB",
    display: "Laboratory"
  },
  other: {
    code: "OTH",
    display: "Other"
  },
  pathology: {
    code: "PAT",
    display: "Pathology"
  }
};

export const diagnosticReportFhirProfile =
  "http://hl7.org/fhir/StructureDefinition/DiagnosticReport";

function codeableConcept(system: string, code: string, display: string) {
  return {
    coding: [{ system, code, display }],
    text: display
  };
}

export function toDiagnosticReportCategory(
  category: DiagnosticReportCategory
): NonNullable<FhirDiagnosticReport["category"]>[number] {
  const coding = categoryCodings[category];

  return codeableConcept(diagnosticServiceSectionSystem, coding.code, coding.display);
}

export function toDiagnosticReportCodeableConcept(
  code: DiagnosticReportCode
): FhirDiagnosticReport["code"] {
  return codeableConcept(code.system, code.code, code.display);
}

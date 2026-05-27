import type {
  DiagnosticReport,
  DiagnosticReportCategory
} from "../diagnostic-report/diagnostic-report.js";
import type { FhirDiagnosticReport } from "./fhir-types.js";

const categoryCodings: Record<DiagnosticReportCategory, { code: string; display: string }> = {
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

export function mapDiagnosticReportToFhir(
  diagnosticReport: DiagnosticReport
): FhirDiagnosticReport {
  const snapshot = diagnosticReport.toSnapshot();
  const categoryCoding = categoryCodings[snapshot.category];

  return {
    resourceType: "DiagnosticReport",
    id: snapshot.id,
    meta: {
      profile: ["http://hl7.org/fhir/StructureDefinition/DiagnosticReport"]
    },
    basedOn: snapshot.basedOnServiceRequestId
      ? [
          {
            reference: `ServiceRequest/${snapshot.basedOnServiceRequestId}`
          }
        ]
      : undefined,
    status: snapshot.status,
    category: [
      {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/v2-0074",
            code: categoryCoding.code,
            display: categoryCoding.display
          }
        ],
        text: categoryCoding.display
      }
    ],
    code: {
      coding: [
        {
          system: snapshot.code.system,
          code: snapshot.code.code,
          display: snapshot.code.display
        }
      ],
      text: snapshot.code.display
    },
    subject: {
      reference: `Patient/${snapshot.patientId}`
    },
    encounter: snapshot.encounterId
      ? {
          reference: `Encounter/${snapshot.encounterId}`
        }
      : undefined,
    effectiveDateTime: snapshot.effectiveAt,
    issued: snapshot.issuedAt,
    performer: snapshot.performerOrganizationId
      ? [
          {
            reference: `Organization/${snapshot.performerOrganizationId}`
          }
        ]
      : undefined,
    resultsInterpreter: snapshot.resultsInterpreterPractitionerId
      ? [
          {
            reference: `Practitioner/${snapshot.resultsInterpreterPractitionerId}`
          }
        ]
      : undefined,
    result:
      snapshot.resultObservationIds.length > 0
        ? snapshot.resultObservationIds.map((observationId) => ({
            reference: `Observation/${observationId}`
          }))
        : undefined,
    conclusion: snapshot.conclusion,
    presentedForm: snapshot.presentedFormUrl
      ? [
          {
            url: snapshot.presentedFormUrl,
            title: snapshot.presentedFormTitle ?? snapshot.code.display
          }
        ]
      : undefined
  };
}

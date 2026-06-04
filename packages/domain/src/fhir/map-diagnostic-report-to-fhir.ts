import type { DiagnosticReport } from "../diagnostic-report/diagnostic-report.js";
import type { FhirDiagnosticReport } from "./fhir-types.js";
import {
  diagnosticReportFhirProfile,
  toDiagnosticReportCategory,
  toDiagnosticReportCodeableConcept
} from "./map-diagnostic-report-codings.js";

export function mapDiagnosticReportToFhir(
  diagnosticReport: DiagnosticReport
): FhirDiagnosticReport {
  const snapshot = diagnosticReport.toSnapshot();

  return {
    resourceType: "DiagnosticReport",
    id: snapshot.id,
    meta: {
      profile: [diagnosticReportFhirProfile]
    },
    basedOn: snapshot.basedOnServiceRequestId
      ? [
          {
            reference: `ServiceRequest/${snapshot.basedOnServiceRequestId}`
          }
        ]
      : undefined,
    status: snapshot.status,
    category: [toDiagnosticReportCategory(snapshot.category)],
    code: toDiagnosticReportCodeableConcept(snapshot.code),
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

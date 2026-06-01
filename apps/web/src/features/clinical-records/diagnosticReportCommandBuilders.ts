import { toApiDateTime } from "../../lib/clinicalFormatters.js";
import type { NewDiagnosticReportForm } from "../../types/diagnosticResults.js";
import type { createDiagnosticReport } from "./clinicalRecordApi.js";

type CreateDiagnosticReportCommand = Parameters<typeof createDiagnosticReport>[2];

export function buildDiagnosticReportCommand(
  form: NewDiagnosticReportForm
): CreateDiagnosticReportCommand {
  return {
    encounterId: form.encounterId || undefined,
    basedOnServiceRequestId: form.basedOnServiceRequestId || undefined,
    category: form.category,
    code: {
      system: form.codeSystem,
      code: form.code,
      display: form.codeDisplay
    },
    effectiveAt: toApiDateTime(form.effectiveAt),
    issuedAt: form.issuedAt ? toApiDateTime(form.issuedAt) : undefined,
    performerOrganizationId: form.performerOrganizationId || undefined,
    resultsInterpreterPractitionerId:
      form.resultsInterpreterPractitionerId || undefined,
    resultObservationIds: form.resultObservationIds,
    conclusion: form.conclusion || undefined,
    presentedFormUrl: form.presentedFormUrl || undefined,
    presentedFormTitle: form.presentedFormTitle || undefined
  };
}

import { toApiDateTime } from "../../lib/clinicalFormatters.js";
import type {
  NewDiagnosticReportForm,
  NewImagingStudyForm,
  NewProcedureForm,
  NewServiceRequestForm
} from "../../types/clinical.js";
import type {
  createDiagnosticReport,
  createImagingStudy,
  createProcedure,
  createServiceRequest
} from "./clinicalRecordApi.js";

type CreateServiceRequestCommand = Parameters<typeof createServiceRequest>[2];
type CreateProcedureCommand = Parameters<typeof createProcedure>[2];
type CreateDiagnosticReportCommand = Parameters<typeof createDiagnosticReport>[2];
type CreateImagingStudyCommand = Parameters<typeof createImagingStudy>[2];

export function buildServiceRequestCommand(
  form: NewServiceRequestForm
): CreateServiceRequestCommand {
  return {
    encounterId: form.encounterId || undefined,
    reasonConditionId: form.reasonConditionId || undefined,
    category: form.category,
    priority: form.priority,
    code: {
      system: form.codeSystem,
      code: form.code,
      display: form.codeDisplay
    },
    occurrenceAt: form.occurrenceAt ? toApiDateTime(form.occurrenceAt) : undefined,
    authoredOn: form.authoredOn ? toApiDateTime(form.authoredOn) : undefined,
    requesterPractitionerId: form.requesterPractitionerId,
    performerOrganizationId: form.performerOrganizationId || undefined,
    patientInstruction: form.patientInstruction || undefined,
    note: form.note || undefined
  };
}

export function buildProcedureCommand(form: NewProcedureForm): CreateProcedureCommand {
  const reportReferences =
    form.reportReferenceId.trim().length > 0
      ? [
          {
            resourceType: form.reportReferenceType,
            id: form.reportReferenceId
          }
        ]
      : [];

  return {
    encounterId: form.encounterId || undefined,
    basedOnServiceRequestId: form.basedOnServiceRequestId || undefined,
    reasonConditionId: form.reasonConditionId || undefined,
    category: form.category,
    status: form.status,
    code: {
      system: form.codeSystem,
      code: form.code,
      display: form.codeDisplay
    },
    performedPeriod:
      form.performedStart || form.performedEnd
        ? {
            start: form.performedStart ? toApiDateTime(form.performedStart) : undefined,
            end: form.performedEnd ? toApiDateTime(form.performedEnd) : undefined
          }
        : undefined,
    performers: form.performerActorId
      ? [
          {
            actorType: form.performerActorType,
            actorId: form.performerActorId,
            function:
              form.performerFunctionCode && form.performerFunctionDisplay
                ? {
                    system: form.performerFunctionSystem,
                    code: form.performerFunctionCode,
                    display: form.performerFunctionDisplay
                  }
                : undefined,
            onBehalfOfOrganizationId: form.onBehalfOfOrganizationId || undefined
          }
        ]
      : [],
    recorderPractitionerId: form.recorderPractitionerId || undefined,
    asserterPractitionerId: form.asserterPractitionerId || undefined,
    bodySite:
      form.bodySiteCode && form.bodySiteDisplay
        ? {
            system: form.bodySiteSystem,
            code: form.bodySiteCode,
            display: form.bodySiteDisplay
          }
        : undefined,
    outcome:
      form.outcomeCode && form.outcomeDisplay
        ? {
            system: form.outcomeSystem,
            code: form.outcomeCode,
            display: form.outcomeDisplay
          }
        : undefined,
    reportReferences,
    note: form.note || undefined
  };
}

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

export function buildImagingStudyCommand(
  form: NewImagingStudyForm
): CreateImagingStudyCommand {
  return {
    encounterId: form.encounterId || undefined,
    basedOnServiceRequestId: form.basedOnServiceRequestId || undefined,
    diagnosticReportId: form.diagnosticReportId || undefined,
    studyInstanceUid: form.studyInstanceUid,
    accessionNumber: form.accessionNumber || undefined,
    description: form.description || undefined,
    startedAt: form.startedAt ? toApiDateTime(form.startedAt) : undefined,
    referrerPractitionerId: form.referrerPractitionerId || undefined,
    interpreterPractitionerId: form.interpreterPractitionerId || undefined,
    endpointId: form.endpointId || undefined,
    series: [
      {
        uid: form.seriesUid,
        number: form.seriesNumber
          ? Number.parseInt(form.seriesNumber, 10)
          : undefined,
        modality: {
          system: form.modalitySystem,
          code: form.modalityCode,
          display: form.modalityDisplay
        },
        description: form.seriesDescription || undefined,
        numberOfInstances: form.numberOfInstances
          ? Number.parseInt(form.numberOfInstances, 10)
          : undefined,
        bodySite:
          form.bodySiteCode || form.bodySiteDisplay
            ? {
                system: form.bodySiteSystem,
                code: form.bodySiteCode,
                display: form.bodySiteDisplay
              }
            : undefined
      }
    ]
  };
}

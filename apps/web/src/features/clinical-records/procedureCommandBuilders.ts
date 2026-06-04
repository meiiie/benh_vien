import { toApiDateTime } from "../../lib/clinicalFormatters.js";
import type { NewProcedureForm } from "../../types/careWorkflow.js";
import type { createProcedure } from "./clinicalRecordApi.js";

type CreateProcedureCommand = Parameters<typeof createProcedure>[2];

export function buildProcedureCommand(
  form: NewProcedureForm
): CreateProcedureCommand {
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
            start: form.performedStart
              ? toApiDateTime(form.performedStart)
              : undefined,
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

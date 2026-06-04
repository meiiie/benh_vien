import { toApiDateTime } from "../../lib/clinicalFormatters.js";
import type { NewServiceRequestForm } from "../../types/careWorkflow.js";
import type { createServiceRequest } from "./clinicalRecordApi.js";

type CreateServiceRequestCommand = Parameters<typeof createServiceRequest>[2];

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
    occurrenceAt: form.occurrenceAt
      ? toApiDateTime(form.occurrenceAt)
      : undefined,
    authoredOn: form.authoredOn ? toApiDateTime(form.authoredOn) : undefined,
    requesterPractitionerId: form.requesterPractitionerId,
    performerOrganizationId: form.performerOrganizationId || undefined,
    patientInstruction: form.patientInstruction || undefined,
    note: form.note || undefined
  };
}

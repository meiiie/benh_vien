import { toApiDateTime } from "../../lib/clinicalFormatters.js";
import type { CommandDraft } from "../../lib/commandDrafts.js";
import { parseOptionalFhirUnsignedInt } from "../../lib/commandDrafts.js";
import type { NewClinicalDocumentForm } from "../../types/clinicalDocuments.js";
import type { CreateClinicalDocumentCommand } from "./clinicalDocumentApi.js";

export function buildCreateClinicalDocumentCommandDraft(
  form: NewClinicalDocumentForm,
  patientId: string
): CommandDraft<CreateClinicalDocumentCommand> {
  const attachmentSizeBytes = parseOptionalFhirUnsignedInt(
    form.attachmentSizeBytes,
    "Kích thước tệp đính kèm phải là số nguyên FHIR unsignedInt hợp lệ."
  );

  if (!attachmentSizeBytes.ok) {
    return attachmentSizeBytes;
  }

  return {
    ok: true,
    command: buildCreateClinicalDocumentCommand(form, patientId, {
      attachmentSizeBytes: attachmentSizeBytes.value
    })
  };
}

export function buildCreateClinicalDocumentCommand(
  form: NewClinicalDocumentForm,
  patientId: string,
  options: { readonly attachmentSizeBytes?: number } = {}
): CreateClinicalDocumentCommand {
  return {
    encounterId: form.encounterId || undefined,
    type: form.type,
    title: form.title,
    storageUri: form.storageUri.replace("/current/", `/${patientId}/`),
    attachmentContentType: form.attachmentContentType || undefined,
    attachmentSizeBytes: options.attachmentSizeBytes,
    attachmentHashSha1Base64: form.attachmentHashSha1Base64 || undefined,
    attachmentCreatedAt: form.attachmentCreatedAt
      ? toApiDateTime(form.attachmentCreatedAt)
      : undefined,
    authorPractitionerId: form.authorPractitionerId
  };
}

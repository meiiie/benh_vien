import { toApiDateTime } from "../../lib/clinicalFormatters.js";
import type { NewClinicalDocumentForm } from "../../types/clinical.js";
import type { CreateClinicalDocumentCommand } from "./clinicalDocumentApi.js";

export function buildCreateClinicalDocumentCommand(
  form: NewClinicalDocumentForm,
  patientId: string
): CreateClinicalDocumentCommand {
  return {
    encounterId: form.encounterId || undefined,
    type: form.type,
    title: form.title,
    storageUri: form.storageUri.replace("/current/", `/${patientId}/`),
    attachmentContentType: form.attachmentContentType || undefined,
    attachmentSizeBytes: form.attachmentSizeBytes
      ? Number(form.attachmentSizeBytes)
      : undefined,
    attachmentHashSha1Base64: form.attachmentHashSha1Base64 || undefined,
    attachmentCreatedAt: form.attachmentCreatedAt
      ? toApiDateTime(form.attachmentCreatedAt)
      : undefined,
    authorPractitionerId: form.authorPractitionerId
  };
}

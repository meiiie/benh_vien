import { ClinicalDocument } from "@benh-vien-so/domain";
import type { ClinicalDocumentSnapshot } from "@benh-vien-so/domain";
import type { ClinicalDocumentRow } from "./postgres-clinical-document.types.js";

export function rowToClinicalDocument(row: ClinicalDocumentRow): ClinicalDocument {
  const snapshot: ClinicalDocumentSnapshot = {
    id: row.id,
    patientId: row.patient_id,
    encounterId: row.encounter_id ?? undefined,
    type: row.document_type,
    title: row.title,
    status: row.status,
    storageUri: row.storage_uri,
    attachmentContentType: row.attachment_content_type ?? undefined,
    attachmentSizeBytes:
      row.attachment_size_bytes === null ? undefined : Number(row.attachment_size_bytes),
    attachmentHashSha1Base64: row.attachment_hash_sha1_base64 ?? undefined,
    attachmentCreatedAt: row.attachment_created_at
      ? toIsoString(row.attachment_created_at)
      : undefined,
    authorPractitionerId: row.author_practitioner_id,
    signedAt: row.signed_at ? toIsoString(row.signed_at) : undefined,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at)
  };

  return ClinicalDocument.rehydrate(snapshot);
}

export function clinicalDocumentToUpsertValues(
  document: ClinicalDocument
): unknown[] {
  const snapshot = document.toSnapshot();

  return [
    snapshot.id,
    snapshot.patientId,
    snapshot.encounterId ?? null,
    snapshot.type,
    snapshot.title,
    snapshot.status,
    snapshot.storageUri,
    snapshot.attachmentContentType ?? null,
    snapshot.attachmentSizeBytes ?? null,
    snapshot.attachmentHashSha1Base64 ?? null,
    snapshot.attachmentCreatedAt ?? null,
    snapshot.authorPractitionerId,
    snapshot.signedAt ?? null,
    snapshot.createdAt,
    snapshot.updatedAt
  ];
}

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

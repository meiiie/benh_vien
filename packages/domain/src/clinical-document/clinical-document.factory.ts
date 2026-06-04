import { DomainError } from "../shared/domain-error.js";
import {
  normalizeAttachmentContentType,
  normalizeAttachmentHash,
  normalizeAttachmentSize,
  normalizeStatus,
  parseOptionalDate,
  parseRequiredDate,
  validateTimeline
} from "./clinical-document.validation.js";
import type {
  ClinicalDocumentProps,
  ClinicalDocumentSnapshot,
  CreateClinicalDocumentInput
} from "./clinical-document.types.js";

export function buildClinicalDocumentProps(
  input: CreateClinicalDocumentInput,
  now = new Date()
): ClinicalDocumentProps {
  if (!input.patientId.trim()) {
    throw new DomainError("Tài liệu lâm sàng phải gắn với một bệnh nhân.");
  }

  if (!input.storageUri.trim()) {
    throw new DomainError("Tài liệu lâm sàng phải có vị trí lưu trữ.");
  }

  const attachmentContentType = normalizeAttachmentContentType(
    input.attachmentContentType
  );
  const attachmentHashSha1Base64 = normalizeAttachmentHash(
    input.attachmentHashSha1Base64
  );

  return {
    ...input,
    id: input.id.trim(),
    patientId: input.patientId.trim(),
    encounterId: input.encounterId?.trim() || undefined,
    title: input.title.trim(),
    storageUri: input.storageUri.trim(),
    attachmentContentType,
    attachmentSizeBytes: normalizeAttachmentSize(input.attachmentSizeBytes),
    attachmentHashSha1Base64,
    attachmentCreatedAt: parseOptionalDate(
      input.attachmentCreatedAt,
      "Thời điểm tạo tệp đính kèm không hợp lệ."
    ),
    authorPractitionerId: input.authorPractitionerId.trim(),
    status: "draft",
    createdAt: now,
    updatedAt: now
  };
}

export function buildRehydratedClinicalDocumentProps(
  snapshot: ClinicalDocumentSnapshot
): ClinicalDocumentProps {
  const signedAt = parseOptionalDate(
    snapshot.signedAt,
    "Thời điểm ký tài liệu không hợp lệ."
  );
  const createdAt = parseRequiredDate(
    snapshot.createdAt,
    "Thời điểm tạo tài liệu không hợp lệ."
  );
  const updatedAt = parseRequiredDate(
    snapshot.updatedAt,
    "Thời điểm cập nhật tài liệu không hợp lệ."
  );

  validateTimeline({ createdAt, updatedAt, signedAt });

  return {
    id: snapshot.id,
    patientId: snapshot.patientId,
    encounterId: snapshot.encounterId,
    type: snapshot.type,
    title: snapshot.title,
    status: normalizeStatus(snapshot.status, signedAt),
    storageUri: snapshot.storageUri,
    attachmentContentType: normalizeAttachmentContentType(
      snapshot.attachmentContentType
    ),
    attachmentSizeBytes: normalizeAttachmentSize(snapshot.attachmentSizeBytes),
    attachmentHashSha1Base64: normalizeAttachmentHash(
      snapshot.attachmentHashSha1Base64
    ),
    attachmentCreatedAt: parseOptionalDate(
      snapshot.attachmentCreatedAt,
      "Thời điểm tạo tệp đính kèm không hợp lệ."
    ),
    authorPractitionerId: snapshot.authorPractitionerId,
    signedAt,
    createdAt,
    updatedAt
  };
}

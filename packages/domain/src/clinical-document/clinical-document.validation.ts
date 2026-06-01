import { DomainError } from "../shared/domain-error.js";
import { normalizeFhirUnsignedInt } from "../shared/fhir-primitives.js";
import { clinicalDocumentStatuses } from "./clinical-document.types.js";
import type { ClinicalDocumentStatus } from "./clinical-document.types.js";

const mimeTypePattern =
  /^[A-Za-z0-9!#$&^_.+-]+\/[A-Za-z0-9!#$&^_.+-]+(?:\s*;\s*[A-Za-z0-9!#$&^_.+-]+=(?:"[^"]+"|[A-Za-z0-9!#$&^_.+-]+))*$/;
const sha1Base64Pattern = /^[A-Za-z0-9+/]{27}=$/;

export function normalizeAttachmentSize(value: number | undefined): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  return normalizeFhirUnsignedInt(
    value,
    "Dung lượng tài liệu phải là số nguyên FHIR unsignedInt hợp lệ."
  );
}

export function normalizeAttachmentContentType(value: string | undefined): string | undefined {
  const normalized = value?.trim() || undefined;

  if (normalized && !mimeTypePattern.test(normalized)) {
    throw new DomainError("Định dạng MIME của tài liệu không hợp lệ.");
  }

  return normalized;
}

export function normalizeAttachmentHash(value: string | undefined): string | undefined {
  const normalized = value?.trim() || undefined;

  if (normalized && !sha1Base64Pattern.test(normalized)) {
    throw new DomainError("Hash SHA-1 Base64 của tài liệu không hợp lệ.");
  }

  return normalized;
}

export function normalizeStatus(
  status: ClinicalDocumentStatus,
  signedAt: Date | undefined
): ClinicalDocumentStatus {
  if (!clinicalDocumentStatuses.has(status)) {
    throw new DomainError("Trạng thái tài liệu lâm sàng không hợp lệ.");
  }

  if (status === "signed" && !signedAt) {
    throw new DomainError("Tài liệu đã ký phải có thời điểm ký.");
  }

  return status;
}

export function validateTimeline(input: {
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly signedAt?: Date;
}): void {
  if (input.updatedAt < input.createdAt) {
    throw new DomainError("Thời điểm cập nhật tài liệu không được trước thời điểm tạo tài liệu.");
  }

  if (input.signedAt && input.signedAt < input.createdAt) {
    throw new DomainError("Thời điểm ký tài liệu không được trước thời điểm tạo tài liệu.");
  }
}

export function parseOptionalDate(value: string | undefined, message: string): Date | undefined {
  return value ? parseRequiredDate(value, message) : undefined;
}

export function parseRequiredDate(value: string, message: string): Date {
  const date = new Date(value);

  return normalizeDate(date, message);
}

export function normalizeDate(value: Date, message: string): Date {
  if (Number.isNaN(value.getTime())) {
    throw new DomainError(message);
  }

  return value;
}

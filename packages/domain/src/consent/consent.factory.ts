import { DomainError } from "../shared/domain-error.js";
import {
  assertPersistenceTimeline,
  assertRevocationWithinPeriod,
  assertValidCategory,
  assertValidPeriod,
  assertValidStatus,
  normalizeOptional,
  normalizeRequired,
  parseDate
} from "./consent.validation.js";
import type {
  ConsentSnapshot,
  CreateConsentInput
} from "./consent.types.js";

export type ConsentProps = {
  -readonly [Key in keyof ConsentSnapshot]: ConsentSnapshot[Key];
};

export function buildConsentSnapshot(
  input: CreateConsentInput,
  now = new Date()
): ConsentProps {
  const validFrom = parseDate(input.validFrom, "Thời điểm hiệu lực consent không hợp lệ.");
  const validUntil = input.validUntil
    ? parseDate(input.validUntil, "Thời điểm hết hiệu lực consent không hợp lệ.")
    : undefined;

  assertValidPeriod(validFrom, validUntil);
  assertValidCategory(input.category);

  return {
    id: normalizeRequired(input.id, "Mã consent không được để trống."),
    patientId: normalizeRequired(input.patientId, "Consent phải gắn với một bệnh nhân."),
    status: "active",
    category: input.category,
    granteeOrganizationId: normalizeRequired(
      input.granteeOrganizationId,
      "Consent phải có đơn vị nhận dữ liệu."
    ),
    grantorActorId: normalizeRequired(
      input.grantorActorId,
      "Consent phải có người/cơ chế ghi nhận."
    ),
    evidenceDocumentId: normalizeOptional(input.evidenceDocumentId),
    validFrom: validFrom.toISOString(),
    validUntil: validUntil?.toISOString(),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };
}

export function normalizePersistedConsentSnapshot(
  snapshot: ConsentSnapshot
): ConsentProps {
  const validFrom = parseDate(snapshot.validFrom, "Thời điểm hiệu lực consent không hợp lệ.");
  const validUntil = snapshot.validUntil
    ? parseDate(snapshot.validUntil, "Thời điểm hết hiệu lực consent không hợp lệ.")
    : undefined;
  const createdAt = parseDate(snapshot.createdAt, "Thời điểm tạo consent không hợp lệ.");
  const updatedAt = parseDate(snapshot.updatedAt, "Thời điểm cập nhật consent không hợp lệ.");
  const revokedByActorId = normalizeOptional(snapshot.revokedByActorId);
  const revokedAt = snapshot.revokedAt
    ? parseDate(snapshot.revokedAt, "Thời điểm thu hồi consent không hợp lệ.")
    : undefined;
  const revocationReason = normalizeOptional(snapshot.revocationReason);

  assertValidPeriod(validFrom, validUntil);
  assertValidStatus(snapshot.status);
  assertValidCategory(snapshot.category);
  assertPersistenceTimeline(createdAt, updatedAt);

  if (snapshot.status === "revoked" && (!revokedByActorId || !revokedAt)) {
    throw new DomainError("Consent đã thu hồi phải có người thu hồi và thời điểm thu hồi.");
  }

  if (snapshot.status !== "revoked" && (revokedByActorId || revokedAt || revocationReason)) {
    throw new DomainError("Consent chưa thu hồi không được có siêu dữ liệu thu hồi.");
  }

  if (revokedAt) {
    assertRevocationWithinPeriod(validFrom, validUntil, revokedAt);
  }

  return {
    ...snapshot,
    id: normalizeRequired(snapshot.id, "Mã consent không được để trống."),
    patientId: normalizeRequired(snapshot.patientId, "Consent phải gắn với một bệnh nhân."),
    granteeOrganizationId: normalizeRequired(
      snapshot.granteeOrganizationId,
      "Consent phải có đơn vị nhận dữ liệu."
    ),
    grantorActorId: normalizeRequired(
      snapshot.grantorActorId,
      "Consent phải có người/cơ chế ghi nhận."
    ),
    evidenceDocumentId: normalizeOptional(snapshot.evidenceDocumentId),
    revokedByActorId,
    revokedAt: revokedAt?.toISOString(),
    revocationReason,
    validFrom: validFrom.toISOString(),
    validUntil: validUntil?.toISOString(),
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString()
  };
}

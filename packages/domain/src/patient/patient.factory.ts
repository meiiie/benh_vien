import { DomainError } from "../shared/domain-error.js";
import {
  assertMergeState,
  assertUniqueIdentifiers,
  normalizeBirthDate,
  normalizeGender,
  normalizeIdentifier,
  normalizeOptionalText,
  normalizeRequiredText,
  normalizeStatus,
  normalizeText,
  parseDate,
  validateTimeline
} from "./patient.validation.js";
import type { PatientProps, PatientSnapshot, RegisterPatientInput } from "./patient.types.js";

export function buildRegisteredPatientProps(input: RegisterPatientInput): PatientProps {
  const now = new Date();
  const fullName = normalizeText(input.fullName);

  if (!input.id.trim()) {
    throw new DomainError("Mã hồ sơ bệnh nhân không được để trống.");
  }

  if (!fullName) {
    throw new DomainError("Họ tên bệnh nhân không được để trống.");
  }

  if (input.identifiers.length === 0) {
    throw new DomainError("Bệnh nhân cần ít nhất một định danh.");
  }

  if (!input.managingOrganizationId.trim()) {
    throw new DomainError("Cơ sở quản lý hồ sơ không được để trống.");
  }

  const identifiers = input.identifiers.map(normalizeIdentifier);
  assertUniqueIdentifiers(identifiers);

  return {
    id: input.id.trim(),
    identifiers,
    fullName,
    birthDate: input.birthDate ? normalizeBirthDate(input.birthDate) : undefined,
    gender: normalizeGender(input.gender ?? "unknown"),
    address: normalizeOptionalText(input.address),
    phone: normalizeOptionalText(input.phone),
    managingOrganizationId: input.managingOrganizationId.trim(),
    status: "active",
    createdAt: now,
    updatedAt: now
  };
}

export function buildRehydratedPatientProps(snapshot: PatientSnapshot): PatientProps {
  const id = normalizeRequiredText(snapshot.id, "Mã hồ sơ bệnh nhân không được để trống.");
  const identifiers = snapshot.identifiers.map(normalizeIdentifier);

  if (identifiers.length === 0) {
    throw new DomainError("Bệnh nhân cần ít nhất một định danh.");
  }

  assertUniqueIdentifiers(identifiers);
  const fullName = normalizeRequiredText(
    snapshot.fullName,
    "Họ tên bệnh nhân không được để trống."
  );
  const status = normalizeStatus(snapshot.status);
  const mergedAt = snapshot.mergedAt
    ? parseDate(snapshot.mergedAt, "Thời điểm merge hồ sơ không hợp lệ.")
    : undefined;
  const createdAt = parseDate(
    snapshot.createdAt,
    "Thời điểm tạo hồ sơ bệnh nhân không hợp lệ."
  );
  const updatedAt = parseDate(
    snapshot.updatedAt,
    "Thời điểm cập nhật hồ sơ bệnh nhân không hợp lệ."
  );

  assertMergeState({
    id,
    status,
    mergedIntoPatientId: snapshot.mergedIntoPatientId,
    mergedAt,
    mergedByActorId: snapshot.mergedByActorId,
    mergeReason: snapshot.mergeReason
  });
  validateTimeline({ createdAt, updatedAt, mergedAt });

  return {
    id,
    identifiers,
    fullName,
    birthDate: snapshot.birthDate ? normalizeBirthDate(snapshot.birthDate) : undefined,
    gender: normalizeGender(snapshot.gender),
    address: normalizeOptionalText(snapshot.address),
    phone: normalizeOptionalText(snapshot.phone),
    managingOrganizationId: normalizeRequiredText(
      snapshot.managingOrganizationId,
      "Cơ sở quản lý hồ sơ không được để trống."
    ),
    status,
    mergedIntoPatientId: normalizeOptionalText(snapshot.mergedIntoPatientId),
    mergedAt,
    mergedByActorId: normalizeOptionalText(snapshot.mergedByActorId),
    mergeReason: normalizeOptionalText(snapshot.mergeReason),
    createdAt,
    updatedAt
  };
}

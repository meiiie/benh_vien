import { DomainError } from "../shared/domain-error.js";
import {
  medicationAdministrationCategories,
  medicationAdministrationPerformerActorTypes,
  medicationAdministrationStatuses
} from "./medication-administration.types.js";
import type {
  MedicationAdministrationCategory,
  MedicationAdministrationPerformerActorType,
  MedicationAdministrationStatus
} from "./medication-administration.types.js";

export function normalizeStatus(
  value: MedicationAdministrationStatus
): MedicationAdministrationStatus {
  if (!medicationAdministrationStatuses.has(value)) {
    throw new DomainError("Trạng thái dùng thuốc không hợp lệ.");
  }

  return value;
}

export function normalizeCategory(
  value: MedicationAdministrationCategory
): MedicationAdministrationCategory {
  if (!medicationAdministrationCategories.has(value)) {
    throw new DomainError("Nhóm dùng thuốc không hợp lệ.");
  }

  return value;
}

export function normalizePerformerActorType(
  value: MedicationAdministrationPerformerActorType
): MedicationAdministrationPerformerActorType {
  if (!medicationAdministrationPerformerActorTypes.has(value)) {
    throw new DomainError("Loại chủ thể thực hiện dùng thuốc không hợp lệ.");
  }

  return value;
}

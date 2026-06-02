import { formatDateTime } from "../../lib/clinicalFormatters.js";
import {
  formatQuantity,
  labelOf,
  type QuantityLike
} from "./medicationFormatterPrimitives.js";

type MedicationAdministrationPeriodLike = {
  readonly start?: string;
  readonly end?: string;
};

type MedicationAdministrationDosageLike = {
  readonly text?: string;
  readonly doseQuantity?: QuantityLike;
  readonly route?: {
    readonly display: string;
  };
};

type MedicationAdministrationPerformerLike = {
  readonly actorId: string;
  readonly function?: {
    readonly display: string;
  };
};

export function formatMedicationAdministrationCategory(category: string): string {
  return labelOf(
    {
      community: "Cộng đồng",
      inpatient: "Nội trú",
      outpatient: "Ngoại trú",
      "patient-specified": "Bệnh nhân tự khai"
    },
    category
  );
}

export function formatMedicationAdministrationStatus(status: string): string {
  return labelOf(
    {
      completed: "Đã dùng",
      "entered-in-error": "Nhập lỗi",
      "in-progress": "Đang dùng",
      "not-done": "Không dùng",
      "on-hold": "Tạm giữ",
      stopped: "Đã dừng",
      unknown: "Chưa rõ"
    },
    status
  );
}

export function formatMedicationAdministrationPeriod(
  period: MedicationAdministrationPeriodLike
): string {
  if (period.start && period.end) {
    return `${formatDateTime(period.start)} - ${formatDateTime(period.end)}`;
  }

  if (period.start) {
    return formatDateTime(period.start);
  }

  if (period.end) {
    return formatDateTime(period.end);
  }

  return "Chưa có";
}

export function formatMedicationAdministrationDose(
  dosage: MedicationAdministrationDosageLike | undefined
): string {
  if (!dosage) {
    return "Chưa có";
  }

  const dose = dosage.doseQuantity
    ? formatQuantity(dosage.doseQuantity)
    : undefined;
  const route = dosage.route?.display;

  return [dosage.text, dose, route].filter(Boolean).join(" · ") || "Chưa có";
}

export function formatMedicationAdministrationPerformers(
  performers: readonly MedicationAdministrationPerformerLike[]
): string {
  if (performers.length === 0) {
    return "Chưa có";
  }

  return performers
    .map((performer) =>
      performer.function?.display
        ? `${performer.actorId} (${performer.function.display})`
        : performer.actorId
    )
    .join(", ");
}

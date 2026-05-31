import { formatDateTime } from "../../lib/clinicalFormatters.js";

type LabeledValue = string;

type QuantityLike = {
  readonly value: number;
  readonly unit: string;
};

type DosageInstructionLike = {
  readonly text?: string;
  readonly doseQuantity?: QuantityLike;
  readonly frequency?: number;
  readonly period?: number;
  readonly periodUnit?: string;
};

type MedicationDispenseLike = {
  readonly whenPrepared?: string;
  readonly whenHandedOver?: string;
};

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

function labelOf<T extends string>(
  labels: Readonly<Record<T, string>>,
  value: LabeledValue
): string {
  return labels[value as T] ?? value;
}

export function formatMedicationRequestCategory(category: string): string {
  return labelOf(
    {
      community: "Cộng đồng",
      discharge: "Ra viện",
      inpatient: "Nội trú",
      outpatient: "Ngoại trú"
    },
    category
  );
}

export function formatMedicationRequestStatus(status: string): string {
  return labelOf(
    {
      active: "Đang hiệu lực",
      cancelled: "Đã hủy",
      completed: "Đã hoàn tất",
      draft: "Bản nháp",
      "entered-in-error": "Nhập lỗi",
      "on-hold": "Tạm giữ",
      stopped: "Đã dừng",
      unknown: "Chưa rõ"
    },
    status
  );
}

export function formatMedicationRequestIntent(intent: string): string {
  return labelOf(
    {
      "filler-order": "Lệnh thực hiện",
      "instance-order": "Lệnh dùng cụ thể",
      option: "Tùy chọn",
      order: "Chỉ định",
      "original-order": "Chỉ định gốc",
      plan: "Kế hoạch",
      proposal: "Đề xuất",
      "reflex-order": "Chỉ định phản xạ"
    },
    intent
  );
}

export function formatMedicationRequestPriority(priority: string): string {
  return labelOf(
    {
      asap: "Càng sớm càng tốt",
      routine: "Thường quy",
      stat: "Ngay lập tức",
      urgent: "Khẩn"
    },
    priority
  );
}

export function formatDosageInstruction(dosageInstruction: DosageInstructionLike): string {
  const dose = dosageInstruction.doseQuantity
    ? `${dosageInstruction.doseQuantity.value} ${dosageInstruction.doseQuantity.unit}`
    : undefined;
  const timing =
    dosageInstruction.frequency && dosageInstruction.period && dosageInstruction.periodUnit
      ? `${dosageInstruction.frequency} lần/${dosageInstruction.period}${dosageInstruction.periodUnit}`
      : undefined;

  return [dosageInstruction.text, dose, timing].filter(Boolean).join(" · ");
}

export function formatMedicationDispenseCategory(category: string): string {
  return labelOf(
    {
      community: "Cộng đồng",
      discharge: "Ra viện",
      inpatient: "Nội trú",
      outpatient: "Ngoại trú"
    },
    category
  );
}

export function formatMedicationDispenseStatus(status: string): string {
  return labelOf(
    {
      cancelled: "Đã hủy",
      completed: "Đã cấp phát",
      declined: "Từ chối cấp phát",
      "entered-in-error": "Nhập lỗi",
      "in-progress": "Đang cấp phát",
      "on-hold": "Tạm giữ",
      preparation: "Đang chuẩn bị",
      stopped: "Đã dừng",
      unknown: "Chưa rõ"
    },
    status
  );
}

export function formatMedicationDispenseQuantity(quantity: QuantityLike | undefined): string {
  if (!quantity) {
    return "Chưa có";
  }

  return `${quantity.value} ${quantity.unit}`;
}

export function formatMedicationDispenseTime(dispense: MedicationDispenseLike): string {
  if (dispense.whenPrepared && dispense.whenHandedOver) {
    return `${formatDateTime(dispense.whenPrepared)} → ${formatDateTime(dispense.whenHandedOver)}`;
  }

  if (dispense.whenHandedOver) {
    return formatDateTime(dispense.whenHandedOver);
  }

  if (dispense.whenPrepared) {
    return `Chuẩn bị ${formatDateTime(dispense.whenPrepared)}`;
  }

  return "Chưa có";
}

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
    ? `${dosage.doseQuantity.value} ${dosage.doseQuantity.unit}`
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

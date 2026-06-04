import {
  formatQuantity,
  labelOf,
  type QuantityLike
} from "./medicationFormatterPrimitives.js";

type DosageInstructionLike = {
  readonly text?: string;
  readonly doseQuantity?: QuantityLike;
  readonly frequency?: number;
  readonly period?: number;
  readonly periodUnit?: string;
};

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

export function formatDosageInstruction(
  dosageInstruction: DosageInstructionLike
): string {
  const dose = dosageInstruction.doseQuantity
    ? formatQuantity(dosageInstruction.doseQuantity)
    : undefined;
  const timing =
    dosageInstruction.frequency &&
    dosageInstruction.period &&
    dosageInstruction.periodUnit
      ? `${dosageInstruction.frequency} lần/${dosageInstruction.period}${dosageInstruction.periodUnit}`
      : undefined;

  return [dosageInstruction.text, dose, timing].filter(Boolean).join(" · ");
}

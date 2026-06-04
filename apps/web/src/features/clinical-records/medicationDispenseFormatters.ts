import { formatDateTime } from "../../lib/clinicalFormatters.js";
import {
  formatQuantity,
  labelOf,
  type QuantityLike
} from "./medicationFormatterPrimitives.js";

type MedicationDispenseLike = {
  readonly whenPrepared?: string;
  readonly whenHandedOver?: string;
};

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

export function formatMedicationDispenseQuantity(
  quantity: QuantityLike | undefined
): string {
  return formatQuantity(quantity);
}

export function formatMedicationDispenseTime(
  dispense: MedicationDispenseLike
): string {
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

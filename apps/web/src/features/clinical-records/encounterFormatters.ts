type LabeledValue = string;

function labelOf<T extends string>(
  labels: Readonly<Record<T, string>>,
  value: LabeledValue
): string {
  return labels[value as T] ?? value;
}

export function formatEncounterClass(value: string): string {
  return labelOf(
    {
      ambulatory: "Ngoại trú",
      inpatient: "Nội trú",
      emergency: "Cấp cứu",
      virtual: "Khám từ xa"
    },
    value
  );
}

export function formatEncounterStatus(status: string): string {
  return labelOf(
    {
      planned: "Đã hẹn",
      "in-progress": "Đang mở",
      finished: "Đã kết thúc",
      cancelled: "Đã hủy",
      "entered-in-error": "Nhập lỗi"
    },
    status
  );
}

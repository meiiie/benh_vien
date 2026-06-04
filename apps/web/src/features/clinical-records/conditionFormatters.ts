type LabeledValue = string;

function labelOf<T extends string>(
  labels: Readonly<Record<T, string>>,
  value: LabeledValue
): string {
  return labels[value as T] ?? value;
}

export function formatConditionCategory(category: string): string {
  return labelOf(
    {
      "encounter-diagnosis": "Chẩn đoán theo lượt khám",
      "problem-list-item": "Vấn đề sức khỏe dài hạn"
    },
    category
  );
}

export function formatConditionClinicalStatus(status: string): string {
  return labelOf(
    {
      active: "Đang hoạt động",
      inactive: "Không hoạt động",
      recurrence: "Tái phát",
      relapse: "Diễn tiến lại",
      remission: "Thuyên giảm",
      resolved: "Đã giải quyết"
    },
    status
  );
}

export function formatConditionVerificationStatus(status: string): string {
  return labelOf(
    {
      confirmed: "Đã xác nhận",
      differential: "Chẩn đoán phân biệt",
      "entered-in-error": "Nhập lỗi",
      provisional: "Tạm thời",
      refuted: "Đã loại trừ",
      unconfirmed: "Chưa xác nhận"
    },
    status
  );
}

export function formatConditionSeverity(severity: string): string {
  return labelOf(
    {
      mild: "Nhẹ",
      moderate: "Trung bình",
      severe: "Nặng"
    },
    severity
  );
}

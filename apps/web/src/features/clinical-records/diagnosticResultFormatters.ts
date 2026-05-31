type LabeledValue = string;

function labelOf<T extends string>(
  labels: Readonly<Record<T, string>>,
  value: LabeledValue
): string {
  return labels[value as T] ?? value;
}

type QuantityLike = {
  readonly value: number;
  readonly unit: string;
};

type ObservationLike = {
  readonly valueQuantity?: QuantityLike;
  readonly valueText?: string;
};

export function formatObservationCategory(category: string): string {
  return labelOf(
    {
      laboratory: "Xét nghiệm",
      "vital-signs": "Sinh hiệu"
    },
    category
  );
}

export function formatObservationStatus(status: string): string {
  return labelOf(
    {
      registered: "Đã đăng ký",
      preliminary: "Sơ bộ",
      final: "Chính thức",
      amended: "Đã hiệu chỉnh",
      cancelled: "Đã hủy",
      "entered-in-error": "Nhập lỗi"
    },
    status
  );
}

export function formatObservationValue(observation: ObservationLike): string {
  if (observation.valueQuantity) {
    return `${observation.valueQuantity.value} ${observation.valueQuantity.unit}`;
  }

  return observation.valueText ?? "Chưa có giá trị";
}

export function formatDiagnosticReportCategory(category: string): string {
  return labelOf(
    {
      imaging: "Chẩn đoán hình ảnh",
      laboratory: "Xét nghiệm",
      other: "Khác",
      pathology: "Giải phẫu bệnh"
    },
    category
  );
}

export function formatDiagnosticReportStatus(status: string): string {
  return labelOf(
    {
      amended: "Đã hiệu chỉnh",
      appended: "Đã bổ sung",
      cancelled: "Đã hủy",
      corrected: "Đã sửa",
      "entered-in-error": "Nhập lỗi",
      final: "Chính thức",
      partial: "Một phần",
      preliminary: "Sơ bộ",
      registered: "Đã đăng ký",
      unknown: "Chưa rõ"
    },
    status
  );
}

export function formatImagingStudyStatus(status: string): string {
  return labelOf(
    {
      available: "Sẵn sàng",
      cancelled: "Đã hủy",
      "entered-in-error": "Nhập lỗi",
      registered: "Đã đăng ký",
      unknown: "Chưa rõ"
    },
    status
  );
}

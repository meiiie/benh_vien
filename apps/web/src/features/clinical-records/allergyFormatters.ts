type LabeledValue = string;

function labelOf<T extends string>(
  labels: Readonly<Record<T, string>>,
  value: LabeledValue
): string {
  return labels[value as T] ?? value;
}

export function formatAllergyType(type: string): string {
  return labelOf(
    {
      allergy: "Dị ứng",
      intolerance: "Không dung nạp"
    },
    type
  );
}

export function formatAllergyCategory(category: string): string {
  return labelOf(
    {
      biologic: "Sinh phẩm",
      environment: "Môi trường",
      food: "Thực phẩm",
      medication: "Thuốc"
    },
    category
  );
}

export function formatAllergyCriticality(criticality: string | undefined): string {
  if (!criticality) {
    return "Chưa đánh giá";
  }

  return labelOf(
    {
      high: "Nguy cơ cao",
      low: "Nguy cơ thấp",
      "unable-to-assess": "Chưa thể đánh giá"
    },
    criticality
  );
}

export function formatAllergyClinicalStatus(status: string): string {
  return labelOf(
    {
      active: "Đang hoạt động",
      inactive: "Không hoạt động",
      resolved: "Đã giải quyết"
    },
    status
  );
}

export function formatAllergyVerificationStatus(status: string): string {
  return labelOf(
    {
      confirmed: "Đã xác nhận",
      "entered-in-error": "Nhập lỗi",
      refuted: "Đã loại trừ",
      unconfirmed: "Chưa xác nhận"
    },
    status
  );
}

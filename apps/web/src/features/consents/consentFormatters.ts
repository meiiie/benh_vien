type LabeledValue = string;

function labelOf<T extends string>(
  labels: Readonly<Record<T, string>>,
  value: LabeledValue
): string {
  return labels[value as T] ?? value;
}

export function formatConsentStatus(status: string): string {
  return labelOf(
    {
      active: "Đang hiệu lực",
      revoked: "Đã thu hồi",
      expired: "Hết hiệu lực"
    },
    status
  );
}

export function formatConsentCategory(category: string): string {
  return labelOf(
    {
      "record-sharing": "Chia sẻ hồ sơ"
    },
    category
  );
}

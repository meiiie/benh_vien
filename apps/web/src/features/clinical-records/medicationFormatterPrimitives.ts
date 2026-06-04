export type QuantityLike = {
  readonly value: number;
  readonly unit: string;
};

type LabeledValue = string;

export function labelOf<T extends string>(
  labels: Readonly<Record<T, string>>,
  value: LabeledValue
): string {
  return labels[value as T] ?? value;
}

export function formatQuantity(
  quantity: QuantityLike | undefined,
  emptyValue = "Chưa có"
): string {
  if (!quantity) {
    return emptyValue;
  }

  return `${quantity.value} ${quantity.unit}`;
}

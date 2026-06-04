export function formatRuntimeFlag(
  value: boolean | null | undefined,
  trueLabel: string,
  falseLabel: string
): string {
  if (value === true) {
    return trueLabel;
  }

  if (value === false) {
    return falseLabel;
  }

  return "Chỉ dành cho vận hành";
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function toApiDateTime(value: string): string {
  return new Date(value).toISOString();
}

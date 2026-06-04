type RecordTransferLike = {
  readonly id: string;
};

export function resolveSelectedRecordTransferId(input: {
  readonly items: readonly RecordTransferLike[];
  readonly preferredId?: string;
  readonly currentId?: string;
}): string | undefined {
  const preferredId = input.preferredId?.trim();
  const currentId = input.currentId?.trim();

  if (preferredId && input.items.some((item) => item.id === preferredId)) {
    return preferredId;
  }

  if (currentId && input.items.some((item) => item.id === currentId)) {
    return currentId;
  }

  return input.items[0]?.id;
}

export function isMissingRecordTransferDeliveryAttemptsRoute(
  payload: unknown
): boolean {
  const message = (payload as { readonly message?: unknown } | undefined)?.message;

  return (
    typeof message === "string" &&
    message.includes("Route GET:") &&
    message.includes("/record-transfers/") &&
    message.includes("/delivery-attempts")
  );
}

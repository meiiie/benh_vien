export const defaultLimit = 10;
export const defaultTimeoutMs = 15_000;
export const defaultRetryDelayMs = 5 * 60_000;
export const defaultIntervalMs = 60_000;
export const defaultWorkerActorId = "system:record-transfer-delivery-worker";
export const maxResponseBodyPreviewLength = 2_000;

export function normalizeDate(value: Date, name: string): Date {
  if (Number.isNaN(value.getTime())) {
    throw new Error(`${name} must be a valid Date.`);
  }

  return value;
}

export function normalizePositiveInteger(value: number, name: string): number {
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${name} must be a positive integer.`);
  }

  return value;
}

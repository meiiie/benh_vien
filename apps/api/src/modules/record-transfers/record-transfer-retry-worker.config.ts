export const defaultRetryLimit = 25;
export const defaultMaxRetryCount = 3;
export const defaultRetryIntervalMs = 60_000;
export const defaultRetryWorkerActorId = "system:record-transfer-retry-worker";

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

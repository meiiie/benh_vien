export type RecordTransferDeliveryAttemptStatus = "queued" | "succeeded" | "failed";

export type RecordTransferDeliveryAttemptBundleType = "collection" | "document";

export const deliveryAttemptStatuses = new Set<RecordTransferDeliveryAttemptStatus>([
  "queued",
  "succeeded",
  "failed"
]);

export const deliveryAttemptBundleTypes = new Set<RecordTransferDeliveryAttemptBundleType>([
  "collection",
  "document"
]);

export type RecordTransferDeliveryAttemptSnapshot = {
  readonly id: string;
  readonly recordTransferId: string;
  readonly patientId: string;
  readonly targetEndpointId: string;
  readonly targetEndpointAddress: string;
  readonly bundleId: string;
  readonly bundleType: RecordTransferDeliveryAttemptBundleType;
  readonly idempotencyKey: string;
  readonly attemptNumber: number;
  readonly status: RecordTransferDeliveryAttemptStatus;
  readonly queuedAt: string;
  readonly completedAt?: string;
  readonly httpStatus?: number;
  readonly responseBodyPreview?: string;
  readonly errorMessage?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type QueueRecordTransferDeliveryAttemptInput = Omit<
  RecordTransferDeliveryAttemptSnapshot,
  | "status"
  | "queuedAt"
  | "completedAt"
  | "httpStatus"
  | "responseBodyPreview"
  | "errorMessage"
  | "createdAt"
  | "updatedAt"
> & {
  readonly queuedAt?: string;
};

export type MarkRecordTransferDeliveryAttemptSucceededInput = {
  readonly completedAt?: string;
  readonly httpStatus: number;
  readonly responseBodyPreview?: string;
};

export type MarkRecordTransferDeliveryAttemptFailedInput = {
  readonly completedAt?: string;
  readonly httpStatus?: number;
  readonly responseBodyPreview?: string;
  readonly errorMessage: string;
};

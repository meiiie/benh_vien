export type RecordTransferStatus =
  | "draft"
  | "requested"
  | "ready"
  | "in-progress"
  | "completed"
  | "cancelled"
  | "failed"
  | "dead-lettered";

export type RecordTransferPriority = "routine" | "urgent" | "asap" | "stat";
export type RecordTransferBundleType = "collection" | "document";

export const recordTransferStatuses = new Set<RecordTransferStatus>([
  "draft",
  "requested",
  "ready",
  "in-progress",
  "completed",
  "cancelled",
  "failed",
  "dead-lettered"
]);

export const recordTransferPriorities = new Set<RecordTransferPriority>([
  "routine",
  "urgent",
  "asap",
  "stat"
]);

export const recordTransferBundleTypes = new Set<RecordTransferBundleType>([
  "collection",
  "document"
]);

export type RecordTransferSnapshot = {
  readonly id: string;
  readonly patientId: string;
  readonly status: RecordTransferStatus;
  readonly priority: RecordTransferPriority;
  readonly bundleType: RecordTransferBundleType;
  readonly bundleId: string;
  readonly sourceOrganizationId: string;
  readonly recipientOrganizationId: string;
  readonly consentReference: string;
  readonly requestedByActorId: string;
  readonly reason: string;
  readonly requestedAt: string;
  readonly sentAt?: string;
  readonly receivedAt?: string;
  readonly receivedByActorId?: string;
  readonly acknowledgementReference?: string;
  readonly failedAt?: string;
  readonly failureReason?: string;
  readonly nextRetryAt?: string;
  readonly retryCount: number;
  readonly deadLetteredAt?: string;
  readonly note?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type CreateRecordTransferInput = Omit<
  RecordTransferSnapshot,
  | "status"
  | "priority"
  | "requestedAt"
  | "sentAt"
  | "receivedAt"
  | "receivedByActorId"
  | "acknowledgementReference"
  | "failedAt"
  | "failureReason"
  | "nextRetryAt"
  | "retryCount"
  | "deadLetteredAt"
  | "createdAt"
  | "updatedAt"
> & {
  readonly status?: RecordTransferStatus;
  readonly priority?: RecordTransferPriority;
  readonly requestedAt?: string;
  readonly sentAt?: string;
  readonly receivedAt?: string;
  readonly receivedByActorId?: string;
  readonly acknowledgementReference?: string;
  readonly failedAt?: string;
  readonly failureReason?: string;
  readonly nextRetryAt?: string;
  readonly retryCount?: number;
  readonly deadLetteredAt?: string;
};

export type MarkRecordTransferSentInput = {
  readonly sentAt?: string;
  readonly note?: string;
};

export type MarkRecordTransferReceivedInput = {
  readonly receivedAt?: string;
  readonly receivedByActorId?: string;
  readonly acknowledgementReference?: string;
  readonly note?: string;
};

export type MarkRecordTransferFailedInput = {
  readonly failedAt?: string;
  readonly failureReason: string;
  readonly nextRetryAt?: string;
  readonly note?: string;
};

export type RetryRecordTransferInput = {
  readonly retryAt?: string;
  readonly note?: string;
};

export type MarkRecordTransferDeadLetteredInput = {
  readonly deadLetteredAt?: string;
  readonly note?: string;
};

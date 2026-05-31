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
export type RecordTransferDeliveryAttemptStatus = "queued" | "succeeded" | "failed";

export type RecordTransfer = {
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
  readonly retryCount?: number;
  readonly deadLetteredAt?: string;
  readonly note?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type RecordTransferDeliveryAttempt = {
  readonly id: string;
  readonly recordTransferId: string;
  readonly patientId: string;
  readonly targetEndpointId: string;
  readonly targetEndpointAddress: string;
  readonly bundleId: string;
  readonly bundleType: RecordTransferBundleType;
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

export type RecordTransferOperationalSeverity = "info" | "success" | "warning" | "danger";

export type RecordTransferOperationalSummary = {
  readonly severity: RecordTransferOperationalSeverity;
  readonly title: string;
  readonly description: string;
  readonly nextAction: string;
  readonly technicalSignal: string;
  readonly attemptCount: number;
  readonly failedAttemptCount: number;
  readonly lastHttpStatus: string;
  readonly nextRetry: string;
};

export type RecordTransfersResponse = {
  readonly items: readonly RecordTransfer[];
};

export type RecordTransferDeliveryAttemptsResponse = {
  readonly items: readonly RecordTransferDeliveryAttempt[];
};

export type NewRecordTransferForm = {
  priority: RecordTransferPriority;
  bundleType: RecordTransferBundleType;
  sourceOrganizationId: string;
  recipientOrganizationId: string;
  consentReference: string;
  reason: string;
  note: string;
};

export type GatewayAcknowledgementForm = {
  recordTransferId: string;
  recipientOrganizationId: string;
  acknowledgementReference: string;
  receivedAt: string;
  receivedByActorId: string;
  targetEndpointId: string;
  deliveryIdempotencyKey: string;
  note: string;
};

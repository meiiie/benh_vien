export type RecordTransferLike = {
  readonly id: string;
  readonly status: string;
  readonly receivedAt?: string;
  readonly failureReason?: string;
  readonly nextRetryAt?: string;
};

export type RecordTransferDeliveryAttemptLike = {
  readonly status: string;
  readonly attemptNumber: number;
  readonly updatedAt: string;
  readonly httpStatus?: number;
  readonly errorMessage?: string;
};

export type RecordTransferOperationalSummaryLike = {
  readonly severity: "info" | "success" | "warning" | "danger";
  readonly title: string;
  readonly description: string;
  readonly nextAction: string;
  readonly attemptCount: number;
  readonly failedAttemptCount: number;
  readonly lastHttpStatus: string;
  readonly nextRetry: string;
  readonly technicalSignal: string;
};

export type RecordTransferOperationalSummaryBaseMetrics = Pick<
  RecordTransferOperationalSummaryLike,
  "attemptCount" | "failedAttemptCount" | "lastHttpStatus" | "nextRetry" | "technicalSignal"
>;

export type RecordTransferOperationalSummaryContext = {
  readonly baseMetrics: RecordTransferOperationalSummaryBaseMetrics;
  readonly latestAttempt?: RecordTransferDeliveryAttemptLike;
};

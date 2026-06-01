import type {
  AuditEventRepository,
  FhirBundle,
  RecordTransferDeliveryAttempt,
  RecordTransferDeliveryAttemptRepository,
  RecordTransferRepository
} from "@benh-vien-so/domain";
import type {
  RecordTransferFhirBundleRepositories
} from "./build-record-transfer-fhir-bundle.js";

export type RecordTransferFhirBundleSendInput = {
  readonly attempt: RecordTransferDeliveryAttempt;
  readonly bundle: FhirBundle;
  readonly timeoutMs: number;
};

export type RecordTransferFhirBundleSendResult = {
  readonly httpStatus?: number;
  readonly responseBodyPreview?: string;
  readonly errorMessage?: string;
};

export type RecordTransferFhirBundleSender = {
  send(input: RecordTransferFhirBundleSendInput): Promise<RecordTransferFhirBundleSendResult>;
};

export type RecordTransferDeliveryWorkerDependencies =
  RecordTransferFhirBundleRepositories & {
    readonly recordTransferRepository: RecordTransferRepository;
    readonly deliveryAttemptRepository: RecordTransferDeliveryAttemptRepository;
    readonly auditRepository: AuditEventRepository;
    readonly sender?: RecordTransferFhirBundleSender;
  };

export type RecordTransferDeliveryWorkerRunContext = {
  readonly checkedAt: Date;
  readonly limit: number;
  readonly timeoutMs: number;
  readonly retryDelayMs: number;
  readonly actorId: string;
  readonly sender: RecordTransferFhirBundleSender;
};

export type ProcessRecordTransferDeliveryAttemptResult = {
  readonly attemptId: string;
  readonly status: "delivered" | "failed";
};

export type ProcessQueuedRecordTransferDeliveriesInput = {
  readonly checkedAt?: Date;
  readonly limit?: number;
  readonly timeoutMs?: number;
  readonly retryDelayMs?: number;
  readonly actorId?: string;
};

export type ProcessQueuedRecordTransferDeliveriesResult = {
  readonly status: "ok";
  readonly checkedAt: string;
  readonly queuedCount: number;
  readonly deliveredCount: number;
  readonly failedCount: number;
  readonly deliveredAttemptIds: readonly string[];
  readonly failedAttemptIds: readonly string[];
};

export type RecordTransferDeliveryWorkerLogger = {
  info?(payload: Record<string, unknown>, message: string): void;
  error?(payload: Record<string, unknown>, message: string): void;
};

export type StartRecordTransferDeliveryWorkerInput =
  ProcessQueuedRecordTransferDeliveriesInput & {
    readonly intervalMs?: number;
    readonly runImmediately?: boolean;
    readonly logger?: RecordTransferDeliveryWorkerLogger;
  };

export type StartedRecordTransferDeliveryWorker = {
  close(): void;
};

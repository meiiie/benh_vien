import type {
  AuditEventRepository,
  RecordTransferRepository
} from "@benh-vien-so/domain";

export type RecordTransferRetryWorkerDependencies = {
  readonly recordTransferRepository: RecordTransferRepository;
  readonly auditRepository: AuditEventRepository;
};

export type ProcessDueRecordTransferRetriesInput = {
  readonly dueAt?: Date;
  readonly limit?: number;
  readonly maxRetryCount?: number;
  readonly actorId?: string;
};

export type ProcessDueRecordTransferRetriesResult = {
  readonly status: "ok";
  readonly checkedAt: string;
  readonly dueCount: number;
  readonly retriedCount: number;
  readonly deadLetteredCount: number;
  readonly skippedCount: number;
  readonly retriedTransferIds: readonly string[];
  readonly deadLetteredTransferIds: readonly string[];
  readonly skippedTransferIds: readonly string[];
};

export type RecordTransferRetryWorkerLogger = {
  info?(payload: Record<string, unknown>, message: string): void;
  error?(payload: Record<string, unknown>, message: string): void;
};

export type StartRecordTransferRetryWorkerInput =
  ProcessDueRecordTransferRetriesInput & {
    readonly intervalMs?: number;
    readonly runImmediately?: boolean;
    readonly logger?: RecordTransferRetryWorkerLogger;
  };

export type StartedRecordTransferRetryWorker = {
  close(): void;
};

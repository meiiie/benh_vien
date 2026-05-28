import { AuditEvent, DomainError } from "@benh-vien-so/domain";
import type {
  AuditEventRepository,
  FhirBundle,
  RecordTransfer,
  RecordTransferDeliveryAttempt,
  RecordTransferDeliveryAttemptRepository,
  RecordTransferRepository
} from "@benh-vien-so/domain";
import {
  buildRecordTransferFhirBundle,
  type RecordTransferFhirBundleRepositories
} from "./build-record-transfer-fhir-bundle.js";
import { validateRecordTransferEndpointForDelivery } from "../record-transfers/record-transfer-endpoint-policy.js";

export type RecordTransferDeliveryWorkerDependencies =
  RecordTransferFhirBundleRepositories & {
    readonly recordTransferRepository: RecordTransferRepository;
    readonly deliveryAttemptRepository: RecordTransferDeliveryAttemptRepository;
    readonly auditRepository: AuditEventRepository;
    readonly sender?: RecordTransferFhirBundleSender;
  };

export type RecordTransferFhirBundleSender = {
  send(input: RecordTransferFhirBundleSendInput): Promise<RecordTransferFhirBundleSendResult>;
};

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

export type StartRecordTransferDeliveryWorkerInput =
  ProcessQueuedRecordTransferDeliveriesInput & {
    readonly intervalMs?: number;
    readonly runImmediately?: boolean;
    readonly logger?: RecordTransferDeliveryWorkerLogger;
  };

export type StartedRecordTransferDeliveryWorker = {
  close(): void;
};

type RecordTransferDeliveryWorkerLogger = {
  info?(payload: Record<string, unknown>, message: string): void;
  error?(payload: Record<string, unknown>, message: string): void;
};

const defaultLimit = 10;
const defaultTimeoutMs = 15_000;
const defaultRetryDelayMs = 5 * 60_000;
const defaultIntervalMs = 60_000;
const defaultWorkerActorId = "system:record-transfer-delivery-worker";
const maxResponseBodyPreviewLength = 2_000;

export async function processQueuedRecordTransferDeliveries(
  dependencies: RecordTransferDeliveryWorkerDependencies,
  input: ProcessQueuedRecordTransferDeliveriesInput = {}
): Promise<ProcessQueuedRecordTransferDeliveriesResult> {
  const checkedAt = normalizeDate(input.checkedAt ?? new Date(), "checkedAt");
  const limit = normalizePositiveInteger(input.limit ?? defaultLimit, "limit");
  const timeoutMs = normalizePositiveInteger(input.timeoutMs ?? defaultTimeoutMs, "timeoutMs");
  const retryDelayMs = normalizePositiveInteger(
    input.retryDelayMs ?? defaultRetryDelayMs,
    "retryDelayMs"
  );
  const actorId = input.actorId?.trim() || defaultWorkerActorId;
  const queuedAttempts = await dependencies.deliveryAttemptRepository.findQueued({
    limit
  });
  const sender = dependencies.sender ?? defaultRecordTransferFhirBundleSender;
  const deliveredAttemptIds: string[] = [];
  const failedAttemptIds: string[] = [];

  for (const attempt of queuedAttempts) {
    const attemptSnapshot = attempt.toSnapshot();
    const recordTransfer = await dependencies.recordTransferRepository.findById(
      attemptSnapshot.recordTransferId
    );

    if (!recordTransfer) {
      await failAttemptOnly(dependencies, attempt, checkedAt, {
        errorMessage: "Không tìm thấy RecordTransfer của lần gửi hồ sơ."
      });
      failedAttemptIds.push(attemptSnapshot.id);
      continue;
    }

    const transferSnapshot = recordTransfer.toSnapshot();

    if (transferSnapshot.status !== "in-progress") {
      await failAttemptOnly(dependencies, attempt, checkedAt, {
        errorMessage:
          "RecordTransfer không còn ở trạng thái in-progress nên worker không gửi ra endpoint."
      });
      failedAttemptIds.push(attemptSnapshot.id);
      continue;
    }

    try {
      const endpointPolicy = validateRecordTransferEndpointForDelivery({
        endpointAddress: attemptSnapshot.targetEndpointAddress
      });

      if (!endpointPolicy.allowed) {
        await failAttemptAndTransfer(dependencies, recordTransfer, attempt, checkedAt, actorId, {
          errorMessage: endpointPolicy.message,
          retryDelayMs
        });
        failedAttemptIds.push(attemptSnapshot.id);
        continue;
      }

      const bundle = await buildRecordTransferFhirBundle(
        dependencies,
        recordTransfer,
        checkedAt
      );
      const sendResult = await sender.send({
        attempt,
        bundle,
        timeoutMs
      });

      if (isSuccessfulHttpStatus(sendResult.httpStatus)) {
        attempt.markSucceeded({
          completedAt: checkedAt.toISOString(),
          httpStatus: sendResult.httpStatus,
          responseBodyPreview: truncatePreview(sendResult.responseBodyPreview)
        });
        await dependencies.deliveryAttemptRepository.save(attempt);
        await recordDeliveryAuditEvent(dependencies, recordTransfer, attempt, checkedAt, actorId, {
          deliveryStatus: "succeeded",
          httpStatus: sendResult.httpStatus
        });
        deliveredAttemptIds.push(attemptSnapshot.id);
        continue;
      }

      const errorMessage =
        sendResult.errorMessage ??
        `FHIR endpoint returned HTTP ${sendResult.httpStatus ?? "unknown"}.`;

      await failAttemptAndTransfer(dependencies, recordTransfer, attempt, checkedAt, actorId, {
        errorMessage,
        httpStatus: sendResult.httpStatus,
        responseBodyPreview: sendResult.responseBodyPreview,
        retryDelayMs
      });
      failedAttemptIds.push(attemptSnapshot.id);
    } catch (error) {
      const errorMessage = formatErrorMessage(error);
      await failAttemptAndTransfer(dependencies, recordTransfer, attempt, checkedAt, actorId, {
        errorMessage,
        retryDelayMs
      });
      failedAttemptIds.push(attemptSnapshot.id);
    }
  }

  return {
    status: "ok",
    checkedAt: checkedAt.toISOString(),
    queuedCount: queuedAttempts.length,
    deliveredCount: deliveredAttemptIds.length,
    failedCount: failedAttemptIds.length,
    deliveredAttemptIds,
    failedAttemptIds
  };
}

export function startRecordTransferDeliveryWorker(
  dependencies: RecordTransferDeliveryWorkerDependencies,
  input: StartRecordTransferDeliveryWorkerInput = {}
): StartedRecordTransferDeliveryWorker {
  const intervalMs = normalizePositiveInteger(
    input.intervalMs ?? defaultIntervalMs,
    "intervalMs"
  );
  let isRunning = false;

  const runOnce = async () => {
    if (isRunning) {
      return;
    }

    isRunning = true;

    try {
      const result = await processQueuedRecordTransferDeliveries(dependencies, input);

      if (result.deliveredCount > 0 || result.failedCount > 0) {
        input.logger?.info?.(
          { result },
          "Record transfer delivery worker processed queued attempts."
        );
      }
    } catch (error) {
      input.logger?.error?.(
        { err: error },
        "Record transfer delivery worker failed to process queued attempts."
      );
    } finally {
      isRunning = false;
    }
  };

  const timer = setInterval(() => {
    void runOnce();
  }, intervalMs);

  timer.unref?.();

  if (input.runImmediately) {
    void runOnce();
  }

  return {
    close() {
      clearInterval(timer);
    }
  };
}

export const defaultRecordTransferFhirBundleSender: RecordTransferFhirBundleSender = {
  async send(input) {
    const attemptSnapshot = input.attempt.toSnapshot();
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
    }, input.timeoutMs);

    try {
      const endpointPolicy = validateRecordTransferEndpointForDelivery({
        endpointAddress: attemptSnapshot.targetEndpointAddress
      });

      if (!endpointPolicy.allowed) {
        return {
          errorMessage: endpointPolicy.message
        };
      }

      const response = await fetch(attemptSnapshot.targetEndpointAddress, {
        method: "POST",
        headers: {
          Accept: "application/fhir+json, application/json",
          "Content-Type": "application/fhir+json",
          "Idempotency-Key": attemptSnapshot.idempotencyKey,
          "X-WiiiCare-Record-Transfer-Id": attemptSnapshot.recordTransferId,
          "X-WiiiCare-Delivery-Attempt-Id": attemptSnapshot.id
        },
        body: JSON.stringify(input.bundle),
        signal: controller.signal
      });

      return {
        httpStatus: response.status,
        responseBodyPreview: await readResponseBodyPreview(response)
      };
    } catch (error) {
      return {
        errorMessage: formatErrorMessage(error)
      };
    } finally {
      clearTimeout(timer);
    }
  }
};

async function failAttemptOnly(
  dependencies: RecordTransferDeliveryWorkerDependencies,
  attempt: RecordTransferDeliveryAttempt,
  completedAt: Date,
  input: {
    readonly errorMessage: string;
    readonly httpStatus?: number;
    readonly responseBodyPreview?: string;
  }
): Promise<void> {
  attempt.markFailed({
    completedAt: completedAt.toISOString(),
    httpStatus: input.httpStatus,
    responseBodyPreview: truncatePreview(input.responseBodyPreview),
    errorMessage: input.errorMessage
  });
  await dependencies.deliveryAttemptRepository.save(attempt);
}

async function failAttemptAndTransfer(
  dependencies: RecordTransferDeliveryWorkerDependencies,
  recordTransfer: RecordTransfer,
  attempt: RecordTransferDeliveryAttempt,
  completedAt: Date,
  actorId: string,
  input: {
    readonly errorMessage: string;
    readonly httpStatus?: number;
    readonly responseBodyPreview?: string;
    readonly retryDelayMs: number;
  }
): Promise<void> {
  await failAttemptOnly(dependencies, attempt, completedAt, input);

  const nextRetryAt = new Date(completedAt.getTime() + input.retryDelayMs).toISOString();
  recordTransfer.markFailed({
    failedAt: completedAt.toISOString(),
    failureReason: input.errorMessage,
    nextRetryAt,
    note: "Delivery worker ghi nhận lỗi khi gửi FHIR Bundle sang endpoint đích."
  });
  await dependencies.recordTransferRepository.save(recordTransfer);
  await recordDeliveryAuditEvent(dependencies, recordTransfer, attempt, completedAt, actorId, {
    deliveryStatus: "failed",
    httpStatus: input.httpStatus,
    nextRetryAt,
    errorMessage: input.errorMessage
  });
}

async function recordDeliveryAuditEvent(
  dependencies: RecordTransferDeliveryWorkerDependencies,
  recordTransfer: RecordTransfer,
  attempt: RecordTransferDeliveryAttempt,
  occurredAt: Date,
  actorId: string,
  metadata: Record<string, unknown>
): Promise<void> {
  const transferSnapshot = recordTransfer.toSnapshot();
  const attemptSnapshot = attempt.toSnapshot();

  await dependencies.auditRepository.save(
    AuditEvent.record({
      occurredAt,
      actorId,
      action: metadata.deliveryStatus === "failed" ? "record-transfer.fail" : "record-transfer.send",
      resourceType: "RecordTransfer",
      resourceId: transferSnapshot.id,
      patientId: transferSnapshot.patientId,
      purposeOfUse: "OPERATIONS",
      metadata: {
        actorRole: "system",
        worker: "record-transfer-delivery-worker",
        deliveryAttemptId: attemptSnapshot.id,
        deliveryAttemptNumber: attemptSnapshot.attemptNumber,
        targetEndpointId: attemptSnapshot.targetEndpointId,
        targetEndpointAddress: attemptSnapshot.targetEndpointAddress,
        bundleId: attemptSnapshot.bundleId,
        bundleType: attemptSnapshot.bundleType,
        idempotencyKey: attemptSnapshot.idempotencyKey,
        ...metadata
      }
    })
  );
}

function isSuccessfulHttpStatus(value: number | undefined): value is number {
  return typeof value === "number" && value >= 200 && value <= 299;
}

function normalizeDate(value: Date, name: string): Date {
  if (Number.isNaN(value.getTime())) {
    throw new Error(`${name} must be a valid Date.`);
  }

  return value;
}

function normalizePositiveInteger(value: number, name: string): number {
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${name} must be a positive integer.`);
  }

  return value;
}

function truncatePreview(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  return value.slice(0, maxResponseBodyPreviewLength);
}

async function readResponseBodyPreview(response: Response): Promise<string | undefined> {
  try {
    return truncatePreview(await response.text());
  } catch {
    return undefined;
  }
}

function formatErrorMessage(error: unknown): string {
  if (error instanceof DomainError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Không thể gửi FHIR Bundle sang endpoint đích.";
}

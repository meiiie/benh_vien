import { buildRecordTransferFhirBundle } from "./build-record-transfer-fhir-bundle.js";
import { validateRecordTransferEndpointForDelivery } from "../record-transfers/record-transfer-endpoint-policy.js";
import { formatErrorMessage } from "./record-transfer-delivery-format.js";
import {
  failDeliveryAttemptAndTransfer,
  failDeliveryAttemptOnly,
  isSuccessfulHttpStatus,
  markDeliveryAttemptSucceeded
} from "./record-transfer-delivery-outcomes.js";
import {
  defaultLimit,
  defaultRetryDelayMs,
  defaultTimeoutMs,
  defaultWorkerActorId,
  normalizeDate,
  normalizePositiveInteger
} from "./record-transfer-delivery-worker.config.js";
import { defaultRecordTransferFhirBundleSender } from "./record-transfer-fhir-bundle-sender.js";
import type {
  ProcessQueuedRecordTransferDeliveriesInput,
  ProcessQueuedRecordTransferDeliveriesResult,
  RecordTransferDeliveryWorkerDependencies
} from "./record-transfer-delivery-worker.types.js";

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
      await failDeliveryAttemptOnly(dependencies, attempt, checkedAt, {
        errorMessage: "Không tìm thấy RecordTransfer của lần gửi hồ sơ."
      });
      failedAttemptIds.push(attemptSnapshot.id);
      continue;
    }

    const transferSnapshot = recordTransfer.toSnapshot();

    if (transferSnapshot.status !== "in-progress") {
      await failDeliveryAttemptOnly(dependencies, attempt, checkedAt, {
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
        await failDeliveryAttemptAndTransfer(
          dependencies,
          recordTransfer,
          attempt,
          checkedAt,
          actorId,
          {
            errorMessage: endpointPolicy.message,
            retryDelayMs
          }
        );
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
        await markDeliveryAttemptSucceeded(
          dependencies,
          recordTransfer,
          attempt,
          checkedAt,
          actorId,
          {
            httpStatus: sendResult.httpStatus,
            responseBodyPreview: sendResult.responseBodyPreview
          }
        );
        deliveredAttemptIds.push(attemptSnapshot.id);
        continue;
      }

      const errorMessage =
        sendResult.errorMessage ??
        `FHIR endpoint returned HTTP ${sendResult.httpStatus ?? "unknown"}.`;

      await failDeliveryAttemptAndTransfer(
        dependencies,
        recordTransfer,
        attempt,
        checkedAt,
        actorId,
        {
          errorMessage,
          httpStatus: sendResult.httpStatus,
          responseBodyPreview: sendResult.responseBodyPreview,
          retryDelayMs
        }
      );
      failedAttemptIds.push(attemptSnapshot.id);
    } catch (error) {
      const errorMessage = formatErrorMessage(error);
      await failDeliveryAttemptAndTransfer(
        dependencies,
        recordTransfer,
        attempt,
        checkedAt,
        actorId,
        {
          errorMessage,
          retryDelayMs
        }
      );
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

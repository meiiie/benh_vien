import type { RecordTransferDeliveryAttempt } from "@benh-vien-so/domain";
import { validateRecordTransferEndpointForDelivery } from "../record-transfers/record-transfer-endpoint-policy.js";
import { buildRecordTransferFhirBundle } from "./build-record-transfer-fhir-bundle.js";
import { formatErrorMessage } from "./record-transfer-delivery-format.js";
import {
  failDeliveryAttemptAndTransfer,
  failDeliveryAttemptOnly,
  isSuccessfulHttpStatus,
  markDeliveryAttemptSucceeded
} from "./record-transfer-delivery-outcomes.js";
import type {
  ProcessRecordTransferDeliveryAttemptResult,
  RecordTransferDeliveryWorkerDependencies,
  RecordTransferDeliveryWorkerRunContext
} from "./record-transfer-delivery-worker.types.js";

export async function processRecordTransferDeliveryAttempt(
  dependencies: RecordTransferDeliveryWorkerDependencies,
  attempt: RecordTransferDeliveryAttempt,
  context: RecordTransferDeliveryWorkerRunContext
): Promise<ProcessRecordTransferDeliveryAttemptResult> {
  const attemptSnapshot = attempt.toSnapshot();
  const recordTransfer = await dependencies.recordTransferRepository.findById(
    attemptSnapshot.recordTransferId
  );

  if (!recordTransfer) {
    await failDeliveryAttemptOnly(dependencies, attempt, context.checkedAt, {
      errorMessage: "Không tìm thấy RecordTransfer của lần gửi hồ sơ."
    });
    return { attemptId: attemptSnapshot.id, status: "failed" };
  }

  const transferSnapshot = recordTransfer.toSnapshot();

  if (transferSnapshot.status !== "in-progress") {
    await failDeliveryAttemptOnly(dependencies, attempt, context.checkedAt, {
      errorMessage:
        "RecordTransfer không còn ở trạng thái in-progress nên worker không gửi ra endpoint."
    });
    return { attemptId: attemptSnapshot.id, status: "failed" };
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
        context.checkedAt,
        context.actorId,
        {
          errorMessage: endpointPolicy.message,
          retryDelayMs: context.retryDelayMs
        }
      );
      return { attemptId: attemptSnapshot.id, status: "failed" };
    }

    const bundle = await buildRecordTransferFhirBundle(
      dependencies,
      recordTransfer,
      context.checkedAt
    );
    const sendResult = await context.sender.send({
      attempt,
      bundle,
      timeoutMs: context.timeoutMs
    });

    if (isSuccessfulHttpStatus(sendResult.httpStatus)) {
      await markDeliveryAttemptSucceeded(
        dependencies,
        recordTransfer,
        attempt,
        context.checkedAt,
        context.actorId,
        {
          httpStatus: sendResult.httpStatus,
          responseBodyPreview: sendResult.responseBodyPreview
        }
      );
      return { attemptId: attemptSnapshot.id, status: "delivered" };
    }

    await failDeliveryAttemptAndTransfer(
      dependencies,
      recordTransfer,
      attempt,
      context.checkedAt,
      context.actorId,
      {
        errorMessage:
          sendResult.errorMessage ??
          `FHIR endpoint returned HTTP ${sendResult.httpStatus ?? "unknown"}.`,
        httpStatus: sendResult.httpStatus,
        responseBodyPreview: sendResult.responseBodyPreview,
        retryDelayMs: context.retryDelayMs
      }
    );
    return { attemptId: attemptSnapshot.id, status: "failed" };
  } catch (error) {
    await failDeliveryAttemptAndTransfer(
      dependencies,
      recordTransfer,
      attempt,
      context.checkedAt,
      context.actorId,
      {
        errorMessage: formatErrorMessage(error),
        retryDelayMs: context.retryDelayMs
      }
    );
    return { attemptId: attemptSnapshot.id, status: "failed" };
  }
}

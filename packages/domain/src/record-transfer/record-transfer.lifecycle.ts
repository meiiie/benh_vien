import { DomainError } from "../shared/domain-error.js";
import type { RecordTransferStatus } from "./record-transfer.types.js";

export function assertCanMarkSent(status: RecordTransferStatus, sentAt?: string): void {
  if (status === "completed") {
    throw new DomainError("Hồ sơ đã được tiếp nhận, không thể gửi lại.");
  }

  if (status === "cancelled" || status === "failed" || status === "dead-lettered") {
    throw new DomainError(
      "Không thể gửi hồ sơ khi yêu cầu đã hủy, thất bại hoặc đã vào hàng lỗi cuối."
    );
  }

  if (sentAt) {
    throw new DomainError("Hồ sơ đã có thời điểm gửi.");
  }
}

export function assertCanMarkReceived(status: RecordTransferStatus, sentAt?: string): string {
  if (status === "completed") {
    throw new DomainError("Hồ sơ đã được ghi nhận tiếp nhận.");
  }

  if (status === "cancelled" || status === "failed" || status === "dead-lettered") {
    throw new DomainError(
      "Không thể tiếp nhận hồ sơ khi yêu cầu đã hủy, thất bại hoặc đã vào hàng lỗi cuối."
    );
  }

  if (!sentAt) {
    throw new DomainError("Hồ sơ chỉ được tiếp nhận sau khi đã có thời điểm gửi.");
  }

  return sentAt;
}

export function assertCanMarkFailed(status: RecordTransferStatus): void {
  if (status === "completed") {
    throw new DomainError("Hồ sơ đã được tiếp nhận, không thể đánh dấu lỗi gửi.");
  }

  if (status === "cancelled") {
    throw new DomainError("Không thể đánh dấu lỗi cho yêu cầu chuyển hồ sơ đã hủy.");
  }

  if (status === "dead-lettered") {
    throw new DomainError("Không thể đánh dấu lỗi cho hồ sơ đã vào hàng lỗi cuối.");
  }
}

export function assertCanRetry(status: RecordTransferStatus): void {
  if (status !== "failed") {
    throw new DomainError(
      "Chỉ có thể thử gửi lại khi yêu cầu chuyển hồ sơ đang ở trạng thái lỗi."
    );
  }
}

export function assertCanMarkDeadLettered(
  status: RecordTransferStatus,
  failedAt?: string,
  failureReason?: string
): string {
  if (status !== "failed") {
    throw new DomainError(
      "Chỉ có thể đưa vào hàng lỗi cuối khi yêu cầu chuyển hồ sơ đang ở trạng thái lỗi."
    );
  }

  if (!failedAt || !failureReason) {
    throw new DomainError("Hồ sơ vào hàng lỗi cuối cần có thời điểm lỗi và lý do lỗi trước đó.");
  }

  return failedAt;
}

import { formatDateTime } from "../../lib/clinicalFormatters.js";
import type {
  RecordTransferDeliveryAttemptLike,
  RecordTransferLike,
  RecordTransferOperationalSummaryBaseMetrics,
  RecordTransferOperationalSummaryContext,
  RecordTransferOperationalSummaryLike
} from "./recordTransferOperationalSummaryTypes.js";

export function buildRecordTransferStatusSummary(
  recordTransfer: RecordTransferLike,
  context: RecordTransferOperationalSummaryContext
): RecordTransferOperationalSummaryLike {
  if (recordTransfer.status === "completed") {
    return buildCompletedSummary(recordTransfer, context.baseMetrics);
  }

  if (recordTransfer.status === "dead-lettered") {
    return buildDeadLetteredSummary(context.baseMetrics);
  }

  if (recordTransfer.status === "failed") {
    return buildFailedSummary(recordTransfer, context.baseMetrics);
  }

  if (recordTransfer.status === "in-progress") {
    return buildInProgressSummary(context.latestAttempt, context.baseMetrics);
  }

  if (recordTransfer.status === "cancelled") {
    return buildCancelledSummary(context.baseMetrics);
  }

  return buildPendingSummary(recordTransfer, context.baseMetrics);
}

function buildCompletedSummary(
  recordTransfer: RecordTransferLike,
  baseMetrics: RecordTransferOperationalSummaryBaseMetrics
): RecordTransferOperationalSummaryLike {
  return {
    ...baseMetrics,
    severity: "success",
    title: "Đã hoàn tất tiếp nhận",
    description: recordTransfer.receivedAt
      ? `Bên nhận đã xác nhận lúc ${formatDateTime(recordTransfer.receivedAt)}.`
      : "Bên nhận đã xác nhận gói chuyển hồ sơ.",
    nextAction:
      "Đối chiếu biên nhận tiếp nhận, audit trail và FHIR Task để đóng hồ sơ vận hành."
  };
}

function buildDeadLetteredSummary(
  baseMetrics: RecordTransferOperationalSummaryBaseMetrics
): RecordTransferOperationalSummaryLike {
  return {
    ...baseMetrics,
    severity: "danger",
    title: "Cần can thiệp thủ công",
    description:
      "Gói chuyển đã vượt quá số lần thử tự động hoặc được đưa vào hàng lỗi cuối.",
    nextAction:
      "Kiểm tra endpoint FHIR, consent, mạng, chứng thư/gateway bên nhận rồi tạo quy trình xử lý lại có kiểm soát."
  };
}

function buildFailedSummary(
  recordTransfer: RecordTransferLike,
  baseMetrics: RecordTransferOperationalSummaryBaseMetrics
): RecordTransferOperationalSummaryLike {
  const retryDue = recordTransfer.nextRetryAt
    ? Date.parse(recordTransfer.nextRetryAt) <= Date.now()
    : false;

  return {
    ...baseMetrics,
    severity: retryDue ? "warning" : "info",
    title: retryDue ? "Đã đến hạn gửi lại" : "Đang chờ lịch gửi lại",
    description:
      recordTransfer.failureReason ??
      "Worker hoặc người vận hành đã ghi nhận lỗi chuyển hồ sơ.",
    nextAction: retryDue
      ? "Đưa gói về hàng đợi gửi lại hoặc kiểm tra nguyên nhân trước khi retry."
      : "Theo dõi mốc retry; nếu lỗi do cấu hình endpoint thì sửa trước khi gửi lại."
  };
}

function buildInProgressSummary(
  latestAttempt: RecordTransferDeliveryAttemptLike | undefined,
  baseMetrics: RecordTransferOperationalSummaryBaseMetrics
): RecordTransferOperationalSummaryLike {
  if (latestAttempt?.status === "queued") {
    return {
      ...baseMetrics,
      severity: "info",
      title: "Đang chờ delivery worker",
      description:
        "Gói đã được đánh dấu gửi và có delivery attempt trong outbox, nhưng chưa có kết quả POST Bundle.",
      nextAction:
        "Kiểm tra delivery worker có đang bật, hàng đợi có được xử lý và endpoint đích có sẵn sàng."
    };
  }

  if (latestAttempt?.status === "succeeded") {
    return {
      ...baseMetrics,
      severity: "success",
      title: "Đã gửi Bundle, chờ xác nhận nhận",
      description:
        "FHIR Bundle đã được endpoint đích phản hồi thành công; gói vẫn cần biên nhận hoặc mốc received để hoàn tất.",
      nextAction:
        "Chờ acknowledgement callback hoặc xác nhận tiếp nhận từ bệnh viện nhận."
    };
  }

  if (latestAttempt?.status === "failed") {
    return {
      ...baseMetrics,
      severity: "warning",
      title: "Lần gửi gần nhất bị lỗi",
      description:
        latestAttempt.errorMessage ??
        "Endpoint đích chưa nhận thành công FHIR Bundle.",
      nextAction:
        "Xem lỗi của delivery attempt, sửa nguyên nhân và đưa gói vào lịch retry."
    };
  }

  return {
    ...baseMetrics,
    severity: "info",
    title: "Đã đánh dấu gửi",
    description:
      "Gói ở trạng thái đang xử lý nhưng chưa thấy delivery attempt tương ứng trên giao diện.",
    nextAction:
      "Tải lại lịch sử gửi; nếu vẫn trống, kiểm tra bước tạo outbox/delivery attempt."
  };
}

function buildCancelledSummary(
  baseMetrics: RecordTransferOperationalSummaryBaseMetrics
): RecordTransferOperationalSummaryLike {
  return {
    ...baseMetrics,
    severity: "warning",
    title: "Gói đã hủy",
    description: "Luồng chuyển hồ sơ này không còn được tiếp tục.",
    nextAction:
      "Nếu vẫn cần liên thông, tạo gói chuyển mới với consent và endpoint hợp lệ."
  };
}

function buildPendingSummary(
  recordTransfer: RecordTransferLike,
  baseMetrics: RecordTransferOperationalSummaryBaseMetrics
): RecordTransferOperationalSummaryLike {
  return {
    ...baseMetrics,
    severity: "info",
    title:
      recordTransfer.status === "ready"
        ? "Sẵn sàng gửi"
        : "Chưa gửi sang hệ thống nhận",
    description:
      "Gói đã có consent và thông tin đơn vị nhận; chưa phát sinh POST Bundle ra endpoint FHIR.",
    nextAction:
      "Kiểm tra consent, endpoint FHIR của đơn vị nhận và bấm gửi khi đủ điều kiện vận hành."
  };
}

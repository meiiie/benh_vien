import { formatDateTime } from "../../lib/clinicalFormatters.js";

type LabeledValue = string;

type RecordTransferLike = {
  readonly id: string;
  readonly status: string;
  readonly receivedAt?: string;
  readonly failureReason?: string;
  readonly nextRetryAt?: string;
};

type RecordTransferDeliveryAttemptLike = {
  readonly status: string;
  readonly attemptNumber: number;
  readonly updatedAt: string;
  readonly httpStatus?: number;
  readonly errorMessage?: string;
};

type RecordTransferOperationalSummaryLike = {
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

function labelOf<T extends string>(
  labels: Readonly<Record<T, string>>,
  value: LabeledValue
): string {
  return labels[value as T] ?? value;
}

export function formatRecordTransferStatus(status: string): string {
  return labelOf(
    {
      cancelled: "Đã hủy",
      completed: "Đã hoàn tất",
      "dead-lettered": "Hàng lỗi cuối",
      draft: "Bản nháp",
      failed: "Lỗi chuyển",
      "in-progress": "Đang xử lý",
      ready: "Sẵn sàng gửi",
      requested: "Đã yêu cầu"
    },
    status
  );
}

export function formatRecordTransferDeliveryAttemptStatus(status: string): string {
  return labelOf(
    {
      failed: "Gửi lỗi",
      queued: "Đang chờ gửi",
      succeeded: "Gửi thành công"
    },
    status
  );
}

export function formatRecordTransferPriority(priority: string): string {
  return labelOf(
    {
      asap: "Càng sớm càng tốt",
      routine: "Thường quy",
      stat: "Cấp cứu",
      urgent: "Khẩn"
    },
    priority
  );
}

export function formatRecordTransferRetryCount(retryCount: number | undefined): string {
  return `${retryCount ?? 0} lần`;
}

export function formatRecordTransferBundleType(bundleType: string): string {
  return labelOf(
    {
      collection: "FHIR collection Bundle",
      document: "FHIR document Bundle"
    },
    bundleType
  );
}

export function buildRecordTransferOperationalSummary(
  recordTransfer: RecordTransferLike,
  attempts: readonly RecordTransferDeliveryAttemptLike[]
): RecordTransferOperationalSummaryLike {
  const latestAttempt = getLatestRecordTransferAttempt(attempts);
  const failedAttemptCount = attempts.filter((attempt) => attempt.status === "failed").length;
  const lastHttpStatus = latestAttempt?.httpStatus
    ? `HTTP ${latestAttempt.httpStatus}`
    : "Chưa có";
  const nextRetry = recordTransfer.nextRetryAt
    ? formatDateTime(recordTransfer.nextRetryAt)
    : "Chưa hẹn";
  const technicalSignal = latestAttempt
    ? `Lần #${latestAttempt.attemptNumber}: ${formatRecordTransferDeliveryAttemptStatus(latestAttempt.status)}`
    : "Chưa có delivery attempt";
  const baseMetrics = {
    attemptCount: attempts.length,
    failedAttemptCount,
    lastHttpStatus,
    nextRetry,
    technicalSignal
  };

  if (recordTransfer.status === "completed") {
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

  if (recordTransfer.status === "dead-lettered") {
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

  if (recordTransfer.status === "failed") {
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

  if (recordTransfer.status === "in-progress") {
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
        description: latestAttempt.errorMessage ?? "Endpoint đích chưa nhận thành công FHIR Bundle.",
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

  if (recordTransfer.status === "cancelled") {
    return {
      ...baseMetrics,
      severity: "warning",
      title: "Gói đã hủy",
      description: "Luồng chuyển hồ sơ này không còn được tiếp tục.",
      nextAction:
        "Nếu vẫn cần liên thông, tạo gói chuyển mới với consent và endpoint hợp lệ."
    };
  }

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

export function resolveSelectedRecordTransferId(input: {
  readonly items: readonly RecordTransferLike[];
  readonly preferredId?: string;
  readonly currentId?: string;
}): string | undefined {
  const preferredId = input.preferredId?.trim();
  const currentId = input.currentId?.trim();

  if (preferredId && input.items.some((item) => item.id === preferredId)) {
    return preferredId;
  }

  if (currentId && input.items.some((item) => item.id === currentId)) {
    return currentId;
  }

  return input.items[0]?.id;
}

export function isMissingRecordTransferDeliveryAttemptsRoute(payload: unknown): boolean {
  const message = (payload as { readonly message?: unknown } | undefined)?.message;

  return (
    typeof message === "string" &&
    message.includes("Route GET:") &&
    message.includes("/record-transfers/") &&
    message.includes("/delivery-attempts")
  );
}

function getLatestRecordTransferAttempt(
  attempts: readonly RecordTransferDeliveryAttemptLike[]
): RecordTransferDeliveryAttemptLike | undefined {
  return attempts.reduce<RecordTransferDeliveryAttemptLike | undefined>((latest, attempt) => {
    if (!latest) {
      return attempt;
    }

    if (attempt.attemptNumber !== latest.attemptNumber) {
      return attempt.attemptNumber > latest.attemptNumber ? attempt : latest;
    }

    return Date.parse(attempt.updatedAt) > Date.parse(latest.updatedAt) ? attempt : latest;
  }, undefined);
}

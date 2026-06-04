type LabeledValue = string;

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

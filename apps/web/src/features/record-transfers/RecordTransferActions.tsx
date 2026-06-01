import type { RecordTransfer } from "../../types/recordTransfers.js";

type RecordTransferActionsProps = {
  readonly isPatientMerged: boolean;
  readonly recordTransfer: RecordTransfer;
  readonly transitioningRecordTransferId?: string;
  readonly onFailRecordTransfer: (
    recordTransfer: RecordTransfer
  ) => Promise<void> | void;
  readonly onReceiveRecordTransfer: (
    recordTransfer: RecordTransfer
  ) => Promise<void> | void;
  readonly onRetryRecordTransfer: (
    recordTransfer: RecordTransfer
  ) => Promise<void> | void;
  readonly onSendRecordTransfer: (
    recordTransfer: RecordTransfer
  ) => Promise<void> | void;
};

const terminalStatuses = ["completed", "cancelled", "failed", "dead-lettered"];

export function RecordTransferActions({
  isPatientMerged,
  recordTransfer,
  transitioningRecordTransferId,
  onFailRecordTransfer,
  onReceiveRecordTransfer,
  onRetryRecordTransfer,
  onSendRecordTransfer
}: RecordTransferActionsProps) {
  const isTransitioning = transitioningRecordTransferId === recordTransfer.id;

  return (
    <div className="panel-actions">
      <button
        className="ghost-button compact-button"
        type="button"
        disabled={
          isPatientMerged ||
          Boolean(recordTransfer.sentAt) ||
          terminalStatuses.includes(recordTransfer.status) ||
          isTransitioning
        }
        onClick={() => void onSendRecordTransfer(recordTransfer)}
      >
        {isTransitioning ? "Đang cập nhật..." : "Đánh dấu đã gửi"}
      </button>
      <button
        className="ghost-button compact-button"
        type="button"
        disabled={
          isPatientMerged ||
          !recordTransfer.sentAt ||
          recordTransfer.status !== "in-progress" ||
          isTransitioning
        }
        onClick={() => void onReceiveRecordTransfer(recordTransfer)}
      >
        {isTransitioning ? "Đang cập nhật..." : "Xác nhận đã nhận"}
      </button>
      <button
        className="ghost-button compact-button"
        type="button"
        disabled={
          isPatientMerged ||
          terminalStatuses.includes(recordTransfer.status) ||
          isTransitioning
        }
        onClick={() => void onFailRecordTransfer(recordTransfer)}
      >
        {isTransitioning ? "Đang cập nhật..." : "Ghi nhận lỗi gửi"}
      </button>
      <button
        className="ghost-button compact-button"
        type="button"
        disabled={
          isPatientMerged ||
          recordTransfer.status !== "failed" ||
          isTransitioning
        }
        onClick={() => void onRetryRecordTransfer(recordTransfer)}
      >
        {isTransitioning ? "Đang cập nhật..." : "Đưa vào hàng đợi gửi lại"}
      </button>
    </div>
  );
}

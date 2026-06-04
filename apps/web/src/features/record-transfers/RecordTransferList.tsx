import { formatDateTime } from "../../lib/clinicalFormatters.js";
import type { ProviderDirectory } from "../../types/providerDirectory.js";
import type { RecordTransfer } from "../../types/recordTransfers.js";
import { resolveProviderOrganizationLabel } from "../provider-directory/providerDirectoryFormatters.js";
import {
  formatRecordTransferBundleType,
  formatRecordTransferStatus
} from "./recordTransferFormatters.js";

type RecordTransferListProps = {
  readonly providerDirectory?: ProviderDirectory;
  readonly recordTransfers: readonly RecordTransfer[];
  readonly selectedRecordTransferId?: string;
  readonly onSelectRecordTransfer: (recordTransferId: string) => void;
};

export function RecordTransferList({
  providerDirectory,
  recordTransfers,
  selectedRecordTransferId,
  onSelectRecordTransfer
}: RecordTransferListProps) {
  return (
    <div className="medication-cards">
      {recordTransfers.map((recordTransfer) => (
        <button
          className={
            recordTransfer.id === selectedRecordTransferId
              ? "medication-card selected"
              : "medication-card"
          }
          key={recordTransfer.id}
          type="button"
          onClick={() => onSelectRecordTransfer(recordTransfer.id)}
        >
          <span>{formatRecordTransferStatus(recordTransfer.status)}</span>
          <strong>{formatRecordTransferBundleType(recordTransfer.bundleType)}</strong>
          <small>
            {resolveProviderOrganizationLabel(
              providerDirectory,
              recordTransfer.recipientOrganizationId
            )}{" "}
            ·{" "}
            {formatDateTime(recordTransfer.requestedAt)}
          </small>
        </button>
      ))}
      {recordTransfers.length === 0 ? (
        <p className="empty-state">
          Chưa có gói chuyển hồ sơ. API sẽ kiểm tra consent trước khi cho tạo yêu
          cầu chuyển.
        </p>
      ) : null}
    </div>
  );
}

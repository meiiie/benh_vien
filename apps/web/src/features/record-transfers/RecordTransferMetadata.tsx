import { Info } from "../../components/AppShell.js";
import { formatDateTime } from "../../lib/clinicalFormatters.js";
import type { ProviderDirectory } from "../../types/providerDirectory.js";
import type { RecordTransfer } from "../../types/recordTransfers.js";
import { resolveProviderOrganizationLabel } from "../provider-directory/providerDirectoryFormatters.js";
import {
  formatRecordTransferBundleType,
  formatRecordTransferPriority,
  formatRecordTransferRetryCount,
  formatRecordTransferStatus
} from "./recordTransferFormatters.js";

type RecordTransferMetadataProps = {
  readonly providerDirectory?: ProviderDirectory;
  readonly recordTransfer: RecordTransfer;
};

export function RecordTransferMetadata({
  providerDirectory,
  recordTransfer
}: RecordTransferMetadataProps) {
  return (
    <div className="document-meta">
      <Info label="Trạng thái" value={formatRecordTransferStatus(recordTransfer.status)} />
      <Info label="Độ ưu tiên" value={formatRecordTransferPriority(recordTransfer.priority)} />
      <Info label="Bundle" value={recordTransfer.bundleId} />
      <Info label="Loại gói" value={formatRecordTransferBundleType(recordTransfer.bundleType)} />
      <Info
        label="Cơ sở gửi"
        value={resolveProviderOrganizationLabel(
          providerDirectory,
          recordTransfer.sourceOrganizationId
        )}
      />
      <Info
        label="Cơ sở nhận"
        value={resolveProviderOrganizationLabel(
          providerDirectory,
          recordTransfer.recipientOrganizationId
        )}
      />
      <Info label="Consent" value={recordTransfer.consentReference} />
      <Info label="Người tạo" value={recordTransfer.requestedByActorId} />
      <Info
        label="Thời điểm gửi"
        value={recordTransfer.sentAt ? formatDateTime(recordTransfer.sentAt) : "Chưa gửi"}
      />
      <Info
        label="Thời điểm nhận"
        value={
          recordTransfer.receivedAt
            ? formatDateTime(recordTransfer.receivedAt)
            : "Chưa xác nhận"
        }
      />
      <Info
        label="Người xác nhận nhận"
        value={recordTransfer.receivedByActorId ?? "Chưa xác nhận"}
      />
      <Info
        label="Biên nhận tiếp nhận"
        value={recordTransfer.acknowledgementReference ?? "Chưa phát sinh"}
      />
      <Info label="Lỗi gửi" value={recordTransfer.failureReason ?? "Chưa ghi nhận"} />
      <Info label="Thử lại" value={formatRecordTransferRetryCount(recordTransfer.retryCount)} />
      <Info
        label="Hẹn gửi lại"
        value={recordTransfer.nextRetryAt ? formatDateTime(recordTransfer.nextRetryAt) : "Chưa hẹn"}
      />
      <Info
        label="Hàng lỗi cuối"
        value={
          recordTransfer.deadLetteredAt
            ? formatDateTime(recordTransfer.deadLetteredAt)
            : "Chưa đưa vào"
        }
      />
    </div>
  );
}

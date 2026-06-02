import type { FormEvent } from "react";
import type { ProviderDirectory } from "../../types/providerDirectory.js";
import type {
  NewRecordTransferForm,
  RecordTransfer,
  RecordTransferDeliveryAttempt
} from "../../types/recordTransfers.js";
import { RecordTransferActions } from "./RecordTransferActions.js";
import { RecordTransferDeliveryAttemptList } from "./RecordTransferDeliveryAttemptList.js";
import { RecordTransferForm } from "./RecordTransferForm.js";
import { RecordTransferList } from "./RecordTransferList.js";
import { RecordTransferMetadata } from "./RecordTransferMetadata.js";
import { RecordTransferOperationalSummary } from "./RecordTransferOperationalSummary.js";

type RecordTransferInteropPanelProps = {
  readonly deliveryAttemptWarning?: string;
  readonly deliveryAttempts: readonly RecordTransferDeliveryAttempt[];
  readonly form: NewRecordTransferForm;
  readonly isLoadingDeliveryAttempts: boolean;
  readonly isLoadingRecordTransfers: boolean;
  readonly isPatientMerged: boolean;
  readonly isSubmitting: boolean;
  readonly isWriteDisabled: boolean;
  readonly providerDirectory?: ProviderDirectory;
  readonly recordTransfers: readonly RecordTransfer[];
  readonly selectedRecordTransfer?: RecordTransfer;
  readonly selectedRecordTransferId?: string;
  readonly transitioningRecordTransferId?: string;
  readonly onCreateRecordTransfer: (
    event: FormEvent<HTMLFormElement>
  ) => Promise<void> | void;
  readonly onFailRecordTransfer: (
    recordTransfer: RecordTransfer
  ) => Promise<void> | void;
  readonly onFormChange: (form: NewRecordTransferForm) => void;
  readonly onReceiveRecordTransfer: (
    recordTransfer: RecordTransfer
  ) => Promise<void> | void;
  readonly onRetryRecordTransfer: (
    recordTransfer: RecordTransfer
  ) => Promise<void> | void;
  readonly onSelectRecordTransfer: (recordTransferId: string) => void;
  readonly onSendRecordTransfer: (
    recordTransfer: RecordTransfer
  ) => Promise<void> | void;
};

export function RecordTransferInteropPanel({
  deliveryAttemptWarning,
  deliveryAttempts,
  form,
  isLoadingDeliveryAttempts,
  isLoadingRecordTransfers,
  isPatientMerged,
  isSubmitting,
  isWriteDisabled,
  providerDirectory,
  recordTransfers,
  selectedRecordTransfer,
  selectedRecordTransferId,
  transitioningRecordTransferId,
  onCreateRecordTransfer,
  onFailRecordTransfer,
  onFormChange,
  onReceiveRecordTransfer,
  onRetryRecordTransfer,
  onSelectRecordTransfer,
  onSendRecordTransfer
}: RecordTransferInteropPanelProps) {
  return (
    <article className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Chuyển hồ sơ liên viện</p>
          <h2>Gói chuyển hồ sơ</h2>
        </div>
        <span className="pill cyan">
          {isLoadingRecordTransfers ? "đang tải" : `${recordTransfers.length} gói`}
        </span>
      </div>

      <div className="document-layout">
        <RecordTransferList
          providerDirectory={providerDirectory}
          recordTransfers={recordTransfers}
          selectedRecordTransferId={selectedRecordTransferId}
          onSelectRecordTransfer={onSelectRecordTransfer}
        />

        <div className="medication-summary">
          {selectedRecordTransfer ? (
            <>
              <RecordTransferOperationalSummary
                attempts={deliveryAttempts}
                recordTransfer={selectedRecordTransfer}
              />
              <RecordTransferMetadata
                providerDirectory={providerDirectory}
                recordTransfer={selectedRecordTransfer}
              />
              <RecordTransferActions
                isPatientMerged={isPatientMerged}
                recordTransfer={selectedRecordTransfer}
                transitioningRecordTransferId={transitioningRecordTransferId}
                onFailRecordTransfer={onFailRecordTransfer}
                onReceiveRecordTransfer={onReceiveRecordTransfer}
                onRetryRecordTransfer={onRetryRecordTransfer}
                onSendRecordTransfer={onSendRecordTransfer}
              />
              <p className="empty-state">
                RecordTransfer là lớp điều phối nội bộ: sản phẩm dùng nó để theo
                dõi gửi/nhận, còn khi liên thông chuẩn sẽ xuất thành FHIR Task trỏ
                tới Bundle và consent tương ứng.
              </p>
              {selectedRecordTransfer.status === "dead-lettered" ? (
                <p className="transfer-alert">
                  Gói này đã vượt quá số lần thử gửi tự động. Cần kiểm tra endpoint
                  FHIR, consent, mạng hoặc cấu hình bên nhận trước khi tạo luồng xử
                  lý tiếp theo.
                </p>
              ) : null}
              <RecordTransferDeliveryAttemptList
                attempts={deliveryAttempts}
                isLoading={isLoadingDeliveryAttempts}
                warning={deliveryAttemptWarning}
              />
            </>
          ) : (
            <p className="empty-state">
              Chọn một gói chuyển để xem siêu dữ liệu và xuất FHIR Task.
            </p>
          )}
        </div>
      </div>

      <RecordTransferForm
        form={form}
        isSubmitting={isSubmitting}
        isWriteDisabled={isWriteDisabled}
        onCreateRecordTransfer={onCreateRecordTransfer}
        onFormChange={onFormChange}
      />
    </article>
  );
}

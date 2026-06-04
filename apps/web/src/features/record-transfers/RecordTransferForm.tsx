import type { FormEvent } from "react";
import type {
  NewRecordTransferForm,
  RecordTransferBundleType,
  RecordTransferPriority
} from "../../types/recordTransfers.js";

type RecordTransferFormProps = {
  readonly form: NewRecordTransferForm;
  readonly isSubmitting: boolean;
  readonly isWriteDisabled: boolean;
  readonly onCreateRecordTransfer: (
    event: FormEvent<HTMLFormElement>
  ) => Promise<void> | void;
  readonly onFormChange: (form: NewRecordTransferForm) => void;
};

export function RecordTransferForm({
  form,
  isSubmitting,
  isWriteDisabled,
  onCreateRecordTransfer,
  onFormChange
}: RecordTransferFormProps) {
  return (
    <form
      className="medication-form"
      onSubmit={(event) => void onCreateRecordTransfer(event)}
    >
      <label>
        Độ ưu tiên
        <select
          value={form.priority}
          onChange={(event) =>
            onFormChange({
              ...form,
              priority: event.target.value as RecordTransferPriority
            })
          }
        >
          <option value="routine">Thường quy</option>
          <option value="urgent">Khẩn</option>
          <option value="asap">Càng sớm càng tốt</option>
          <option value="stat">Cấp cứu</option>
        </select>
      </label>
      <label>
        Loại Bundle
        <select
          value={form.bundleType}
          onChange={(event) =>
            onFormChange({
              ...form,
              bundleType: event.target.value as RecordTransferBundleType
            })
          }
        >
          <option value="document">Document Bundle</option>
          <option value="collection">Collection Bundle</option>
        </select>
      </label>
      <label>
        Cơ sở gửi
        <input
          value={form.sourceOrganizationId}
          onChange={(event) =>
            onFormChange({
              ...form,
              sourceOrganizationId: event.target.value
            })
          }
        />
      </label>
      <label>
        Cơ sở nhận
        <input
          value={form.recipientOrganizationId}
          onChange={(event) =>
            onFormChange({
              ...form,
              recipientOrganizationId: event.target.value
            })
          }
        />
      </label>
      <label>
        Consent
        <input
          value={form.consentReference}
          onChange={(event) =>
            onFormChange({
              ...form,
              consentReference: event.target.value
            })
          }
        />
      </label>
      <label className="wide-field">
        Lý do chuyển hồ sơ
        <input
          value={form.reason}
          onChange={(event) =>
            onFormChange({
              ...form,
              reason: event.target.value
            })
          }
        />
      </label>
      <label className="wide-field">
        Ghi chú vận hành
        <input
          value={form.note}
          onChange={(event) =>
            onFormChange({
              ...form,
              note: event.target.value
            })
          }
        />
      </label>
      <button
        className="primary-button"
        type="submit"
        disabled={isWriteDisabled || isSubmitting}
      >
        {isSubmitting ? "Đang tạo..." : "Tạo gói chuyển hồ sơ"}
      </button>
    </form>
  );
}

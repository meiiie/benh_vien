import type { FormEvent } from "react";
import { formatDateTime } from "../../lib/clinicalFormatters.js";
import type {
  ClinicalDocumentType,
  NewClinicalDocumentForm
} from "../../types/clinicalDocuments.js";
import type { Encounter } from "../../types/encounters.js";

type ClinicalDocumentFormProps = {
  readonly encounters: readonly Encounter[];
  readonly form: NewClinicalDocumentForm;
  readonly isSubmitting: boolean;
  readonly isWriteDisabled: boolean;
  readonly onCreateDocument: (event: FormEvent<HTMLFormElement>) => Promise<void> | void;
  readonly onFormChange: (form: NewClinicalDocumentForm) => void;
};

export function ClinicalDocumentForm({
  encounters,
  form,
  isSubmitting,
  isWriteDisabled,
  onCreateDocument,
  onFormChange
}: ClinicalDocumentFormProps) {
  return (
    <form className="document-form" onSubmit={(event) => void onCreateDocument(event)}>
      <label>
        Loại tài liệu
        <select
          value={form.type}
          onChange={(event) =>
            onFormChange({
              ...form,
              type: event.target.value as ClinicalDocumentType
            })
          }
        >
          <option value="referral-letter">Giấy chuyển tuyến</option>
          <option value="discharge-summary">Tóm tắt ra viện</option>
          <option value="lab-report">Kết quả xét nghiệm</option>
          <option value="imaging-report">Kết quả chẩn đoán hình ảnh</option>
          <option value="admission-note">Phiếu nhập viện</option>
          <option value="consent-form">Phiếu đồng ý điều trị</option>
          <option value="advance-directive">Chỉ dẫn chăm sóc trước</option>
          <option value="ccda">CCDA</option>
          <option value="ccr">CCR</option>
          <option value="medical-record">Hồ sơ bệnh án</option>
          <option value="patient-information">Thông tin bệnh nhân</option>
        </select>
      </label>
      <label>
        Gắn với lượt khám
        <select
          value={form.encounterId}
          onChange={(event) => onFormChange({ ...form, encounterId: event.target.value })}
        >
          <option value="">Không gắn</option>
          {encounters.map((encounter) => (
            <option key={encounter.id} value={encounter.id}>
              {encounter.serviceType} · {formatDateTime(encounter.startedAt)}
            </option>
          ))}
        </select>
      </label>
      <label className="wide-field">
        Tiêu đề tài liệu
        <input
          value={form.title}
          onChange={(event) => onFormChange({ ...form, title: event.target.value })}
        />
      </label>
      <label className="wide-field">
        URI lưu trữ
        <input
          value={form.storageUri}
          onChange={(event) => onFormChange({ ...form, storageUri: event.target.value })}
        />
      </label>
      <label>
        Định dạng MIME
        <input
          value={form.attachmentContentType}
          onChange={(event) =>
            onFormChange({
              ...form,
              attachmentContentType: event.target.value
            })
          }
        />
      </label>
      <label>
        Dung lượng byte
        <input
          inputMode="numeric"
          min="0"
          type="number"
          value={form.attachmentSizeBytes}
          onChange={(event) =>
            onFormChange({
              ...form,
              attachmentSizeBytes: event.target.value
            })
          }
        />
      </label>
      <label className="wide-field">
        Hash SHA-1 Base64
        <input
          value={form.attachmentHashSha1Base64}
          onChange={(event) =>
            onFormChange({
              ...form,
              attachmentHashSha1Base64: event.target.value
            })
          }
        />
      </label>
      <label>
        Thời điểm tạo tệp
        <input
          type="datetime-local"
          value={form.attachmentCreatedAt}
          onChange={(event) =>
            onFormChange({
              ...form,
              attachmentCreatedAt: event.target.value
            })
          }
        />
      </label>
      <label className="wide-field">
        Mã bác sĩ/người tạo
        <input
          value={form.authorPractitionerId}
          onChange={(event) =>
            onFormChange({
              ...form,
              authorPractitionerId: event.target.value
            })
          }
        />
      </label>
      <button className="primary-button" type="submit" disabled={isWriteDisabled || isSubmitting}>
        {isSubmitting ? "Đang tạo..." : "Tạo tài liệu bệnh án"}
      </button>
    </form>
  );
}

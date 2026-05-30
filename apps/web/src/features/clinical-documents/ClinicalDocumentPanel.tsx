import type { FormEvent } from "react";
import { Info } from "../../components/AppShell.js";
import {
  formatDateTime,
  formatDocumentStatus,
  formatDocumentType
} from "../../lib/clinicalFormatters.js";
import type {
  ClinicalDocument,
  ClinicalDocumentType,
  Encounter,
  NewClinicalDocumentForm
} from "../../types/clinical.js";

type ClinicalDocumentPanelProps = {
  readonly clinicalDocuments: readonly ClinicalDocument[];
  readonly documentTaxonomy: readonly string[];
  readonly encounters: readonly Encounter[];
  readonly form: NewClinicalDocumentForm;
  readonly isLoading: boolean;
  readonly isSelectedPatientMerged: boolean;
  readonly isSigningDocument: boolean;
  readonly isSubmitting: boolean;
  readonly isWriteDisabled: boolean;
  readonly selectedDocument?: ClinicalDocument;
  readonly selectedDocumentId?: string;
  readonly onCreateDocument: (event: FormEvent<HTMLFormElement>) => Promise<void> | void;
  readonly onFormChange: (form: NewClinicalDocumentForm) => void;
  readonly onSelectDocument: (documentId: string) => void;
  readonly onSignDocument: (documentId: string) => Promise<void> | void;
};

export function ClinicalDocumentPanel({
  clinicalDocuments,
  documentTaxonomy,
  encounters,
  form,
  isLoading,
  isSelectedPatientMerged,
  isSigningDocument,
  isSubmitting,
  isWriteDisabled,
  selectedDocument,
  selectedDocumentId,
  onCreateDocument,
  onFormChange,
  onSelectDocument,
  onSignDocument
}: ClinicalDocumentPanelProps) {
  return (
    <article className="panel document-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">FHIR DocumentReference</p>
          <h2>Tài liệu bệnh án</h2>
        </div>
        <span className="pill cyan">
          {isLoading ? "đang tải" : `${clinicalDocuments.length} tài liệu`}
        </span>
      </div>

      <div
        className="taxonomy-strip"
        aria-label="Phân loại tài liệu tham chiếu OpenEMR"
      >
        {documentTaxonomy.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>

      <div className="document-layout">
        <div className="document-cards">
          {clinicalDocuments.map((document) => (
            <button
              className={
                document.id === selectedDocumentId
                  ? "document-card selected"
                  : "document-card"
              }
              key={document.id}
              type="button"
              onClick={() => onSelectDocument(document.id)}
            >
              <span>{formatDocumentType(document.type)}</span>
              <strong>{document.title}</strong>
              <small>
                {formatDocumentStatus(document.status)} ·{" "}
                {document.encounterId
                  ? `Encounter ${document.encounterId}`
                  : "Chưa gắn encounter"}
              </small>
            </button>
          ))}
          {clinicalDocuments.length === 0 ? (
            <p className="empty-state">
              Bệnh nhân này chưa có tài liệu bệnh án.
            </p>
          ) : null}
        </div>

        <div className="document-summary">
          {selectedDocument ? (
            <>
              <div className="document-meta">
                <Info
                  label="Loại tài liệu"
                  value={formatDocumentType(selectedDocument.type)}
                />
                <Info
                  label="Trạng thái"
                  value={formatDocumentStatus(selectedDocument.status)}
                />
                <Info
                  label="Encounter"
                  value={selectedDocument.encounterId ?? "Chưa gắn"}
                />
                <Info
                  label="Người tạo"
                  value={selectedDocument.authorPractitionerId}
                />
                <Info
                  label="Định dạng"
                  value={selectedDocument.attachmentContentType ?? "Chưa có"}
                />
                <Info
                  label="Dung lượng"
                  value={
                    selectedDocument.attachmentSizeBytes !== undefined
                      ? `${selectedDocument.attachmentSizeBytes.toLocaleString(
                          "vi-VN"
                        )} byte`
                      : "Chưa có"
                  }
                />
                <Info
                  label="Hash SHA-1"
                  value={selectedDocument.attachmentHashSha1Base64 ?? "Chưa có"}
                />
              </div>
              <code>{selectedDocument.storageUri}</code>
              <div className="action-row">
                <button
                  className="primary-button"
                  type="button"
                  disabled={
                    isSelectedPatientMerged ||
                    selectedDocument.status !== "draft" ||
                    isSigningDocument
                  }
                  onClick={() => void onSignDocument(selectedDocument.id)}
                >
                  {isSigningDocument ? "Đang ký..." : "Ký tài liệu nháp"}
                </button>
              </div>
            </>
          ) : (
            <p className="empty-state">
              Chọn một tài liệu để xem siêu dữ liệu và thao tác ký.
            </p>
          )}
        </div>
      </div>

      <form
        className="document-form"
        onSubmit={(event) => void onCreateDocument(event)}
      >
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
            onChange={(event) =>
              onFormChange({ ...form, encounterId: event.target.value })
            }
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
            onChange={(event) =>
              onFormChange({ ...form, title: event.target.value })
            }
          />
        </label>
        <label className="wide-field">
          URI lưu trữ
          <input
            value={form.storageUri}
            onChange={(event) =>
              onFormChange({ ...form, storageUri: event.target.value })
            }
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
        <button
          className="primary-button"
          type="submit"
          disabled={isWriteDisabled || isSubmitting}
        >
          {isSubmitting ? "Đang tạo..." : "Tạo tài liệu bệnh án"}
        </button>
      </form>
    </article>
  );
}

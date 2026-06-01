import type { FormEvent } from "react";
import { Info } from "../../components/AppShell.js";
import {
  formatDocumentStatus,
  formatDocumentType
} from "./clinicalDocumentFormatters.js";
import type {
  ClinicalDocument,
  NewClinicalDocumentForm
} from "../../types/clinicalDocuments.js";
import type { Encounter } from "../../types/encounters.js";
import { ClinicalDocumentForm } from "./ClinicalDocumentForm.js";

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

      <ClinicalDocumentForm
        encounters={encounters}
        form={form}
        isSubmitting={isSubmitting}
        isWriteDisabled={isWriteDisabled}
        onCreateDocument={onCreateDocument}
        onFormChange={onFormChange}
      />
    </article>
  );
}

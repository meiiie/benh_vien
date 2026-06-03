import { Info } from "../../components/AppShell.js";
import type { ClinicalDocument } from "../../types/clinicalDocuments.js";
import {
  formatDocumentStatus,
  formatDocumentType
} from "./clinicalDocumentFormatters.js";

type ClinicalDocumentSummaryProps = {
  readonly isSelectedPatientMerged: boolean;
  readonly isSigningDocument: boolean;
  readonly selectedDocument?: ClinicalDocument;
  readonly onSignDocument: (documentId: string) => Promise<void> | void;
};

export function ClinicalDocumentSummary({
  isSelectedPatientMerged,
  isSigningDocument,
  selectedDocument,
  onSignDocument
}: ClinicalDocumentSummaryProps) {
  if (!selectedDocument) {
    return (
      <div className="document-summary">
        <p className="empty-state">
          Chọn một tài liệu để xem siêu dữ liệu và thao tác ký.
        </p>
      </div>
    );
  }

  return (
    <div className="document-summary">
      <div className="document-meta">
        <Info label="Loại tài liệu" value={formatDocumentType(selectedDocument.type)} />
        <Info label="Trạng thái" value={formatDocumentStatus(selectedDocument.status)} />
        <Info label="Lượt khám" value={selectedDocument.encounterId ?? "Chưa gắn"} />
        <Info label="Người tạo" value={selectedDocument.authorPractitionerId} />
        <Info
          label="Định dạng"
          value={selectedDocument.attachmentContentType ?? "Chưa có"}
        />
        <Info
          label="Dung lượng"
          value={
            selectedDocument.attachmentSizeBytes !== undefined
              ? `${selectedDocument.attachmentSizeBytes.toLocaleString("vi-VN")} byte`
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
    </div>
  );
}

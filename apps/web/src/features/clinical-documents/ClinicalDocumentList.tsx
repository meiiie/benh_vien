import type { ClinicalDocument } from "../../types/clinicalDocuments.js";
import {
  formatDocumentStatus,
  formatDocumentType
} from "./clinicalDocumentFormatters.js";

type ClinicalDocumentListProps = {
  readonly clinicalDocuments: readonly ClinicalDocument[];
  readonly selectedDocumentId?: string;
  readonly onSelectDocument: (documentId: string) => void;
};

export function ClinicalDocumentList({
  clinicalDocuments,
  selectedDocumentId,
  onSelectDocument
}: ClinicalDocumentListProps) {
  return (
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
              ? `Lượt khám ${document.encounterId}`
              : "Chưa gắn lượt khám"}
          </small>
        </button>
      ))}
      {clinicalDocuments.length === 0 ? (
        <p className="empty-state">Bệnh nhân này chưa có tài liệu bệnh án.</p>
      ) : null}
    </div>
  );
}

import type { FormEvent } from "react";
import type {
  ClinicalDocument,
  NewClinicalDocumentForm
} from "../../types/clinicalDocuments.js";
import type { Encounter } from "../../types/encounters.js";
import { ClinicalDocumentForm } from "./ClinicalDocumentForm.js";
import { ClinicalDocumentList } from "./ClinicalDocumentList.js";
import { ClinicalDocumentSummary } from "./ClinicalDocumentSummary.js";

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
        <ClinicalDocumentList
          clinicalDocuments={clinicalDocuments}
          selectedDocumentId={selectedDocumentId}
          onSelectDocument={onSelectDocument}
        />
        <ClinicalDocumentSummary
          isSelectedPatientMerged={isSelectedPatientMerged}
          isSigningDocument={isSigningDocument}
          selectedDocument={selectedDocument}
          onSignDocument={onSignDocument}
        />
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

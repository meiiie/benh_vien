import type { FormEvent, ReactNode } from "react";
import type {
  ClinicalDocument,
  Encounter,
  NewClinicalDocumentForm
} from "../../types/clinical.js";
import { ClinicalDocumentPanel } from "./ClinicalDocumentPanel.js";

type ClinicalDocumentSubmitHandler = (event: FormEvent<HTMLFormElement>) => Promise<void> | void;

type BuildClinicalDocumentPanelRenderersOptions = {
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
  readonly onCreateDocument: ClinicalDocumentSubmitHandler;
  readonly onDocumentFormChange: (form: NewClinicalDocumentForm) => void;
  readonly onSelectDocument: (documentId: string) => void;
  readonly onSignDocument: (documentId: string) => Promise<void> | void;
};

export type ClinicalDocumentPanelRenderers = {
  readonly clinicalDocument: () => ReactNode;
};

export function buildClinicalDocumentPanelRenderers({
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
  onDocumentFormChange,
  onSelectDocument,
  onSignDocument
}: BuildClinicalDocumentPanelRenderersOptions): ClinicalDocumentPanelRenderers {
  return {
    clinicalDocument: () => (
      <ClinicalDocumentPanel
        clinicalDocuments={clinicalDocuments}
        documentTaxonomy={documentTaxonomy}
        encounters={encounters}
        form={form}
        isLoading={isLoading}
        isSelectedPatientMerged={isSelectedPatientMerged}
        isSigningDocument={isSigningDocument}
        isSubmitting={isSubmitting}
        isWriteDisabled={isWriteDisabled}
        selectedDocument={selectedDocument}
        selectedDocumentId={selectedDocumentId}
        onCreateDocument={onCreateDocument}
        onFormChange={onDocumentFormChange}
        onSelectDocument={onSelectDocument}
        onSignDocument={onSignDocument}
      />
    )
  };
}

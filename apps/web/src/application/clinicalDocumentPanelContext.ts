import { documentTaxonomy } from "../config/demoClinicalDefaults.js";
import { buildClinicalDocumentPanelRenderers } from "../features/clinical-documents/clinicalDocumentPanelRenderers.js";
import type { useClinicalRecordState } from "../features/clinical-records/clinicalRecordState.js";
import type { buildAppWorkspaceContext } from "./appDerivedContext.js";

type ClinicalRecordState = ReturnType<typeof useClinicalRecordState>;
type AppWorkspaceContext = ReturnType<typeof buildAppWorkspaceContext>;
type ClinicalDocumentPanelOptions = Parameters<typeof buildClinicalDocumentPanelRenderers>[0];

type BuildClinicalDocumentPanelsInput = {
  readonly clinicalRecordState: ClinicalRecordState;
  readonly isSelectedPatientMerged: boolean;
  readonly isWriteDisabled: boolean;
  readonly onCreateDocument: ClinicalDocumentPanelOptions["onCreateDocument"];
  readonly onSignDocument: ClinicalDocumentPanelOptions["onSignDocument"];
  readonly workspaceSelection: AppWorkspaceContext["workspaceSelection"];
};

export function buildClinicalDocumentPanels({
  clinicalRecordState,
  isSelectedPatientMerged,
  isWriteDisabled,
  onCreateDocument,
  onSignDocument,
  workspaceSelection
}: BuildClinicalDocumentPanelsInput) {
  return buildClinicalDocumentPanelRenderers({
    clinicalDocuments: clinicalRecordState.clinicalDocuments,
    documentTaxonomy,
    encounters: clinicalRecordState.encounters,
    form: clinicalRecordState.documentForm,
    isLoading: clinicalRecordState.isLoadingDocuments,
    isSelectedPatientMerged,
    isSigningDocument: clinicalRecordState.isSigningDocument,
    isSubmitting: clinicalRecordState.isSubmittingDocument,
    isWriteDisabled,
    selectedDocument: workspaceSelection.selectedDocument,
    selectedDocumentId: clinicalRecordState.selectedDocumentId,
    onCreateDocument,
    onDocumentFormChange: clinicalRecordState.setDocumentForm,
    onSelectDocument: clinicalRecordState.setSelectedDocumentId,
    onSignDocument
  });
}

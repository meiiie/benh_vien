import { MedicationAdministrationPanel } from "./MedicationAdministrationPanel.js";
import { MedicationDispensePanel } from "./MedicationDispensePanel.js";
import { MedicationRequestPanel } from "./MedicationRequestPanel.js";
import type {
  BuildClinicalRecordPanelRenderersOptions,
  ClinicalRecordPanelRenderers
} from "./clinicalRecordPanelRendererTypes.js";

type ClinicalRecordMedicationPanelRenderers = Pick<
  ClinicalRecordPanelRenderers,
  "medicationAdministration" | "medicationDispense" | "medicationRequest"
>;

export function buildClinicalRecordMedicationPanelRenderers({
  collections,
  forms,
  handlers,
  isWriteDisabled,
  loading,
  selectedIds,
  selections,
  submitting
}: BuildClinicalRecordPanelRenderersOptions): ClinicalRecordMedicationPanelRenderers {
  return {
    medicationAdministration: () => (
      <MedicationAdministrationPanel
        conditions={collections.conditions}
        encounters={collections.encounters}
        form={forms.medicationAdministration}
        isLoading={loading.medicationAdministrations}
        isSubmitting={submitting.medicationAdministration}
        isWriteDisabled={isWriteDisabled}
        medicationAdministrations={collections.medicationAdministrations}
        medicationRequests={collections.medicationRequests}
        selectedMedicationAdministration={selections.selectedMedicationAdministration}
        selectedMedicationAdministrationId={selectedIds.medicationAdministration}
        onCreateMedicationAdministration={handlers.onCreateMedicationAdministration}
        onFormChange={handlers.onMedicationAdministrationFormChange}
        onSelectMedicationAdministration={handlers.onSelectMedicationAdministration}
      />
    ),
    medicationDispense: () => (
      <MedicationDispensePanel
        encounters={collections.encounters}
        form={forms.medicationDispense}
        isLoading={loading.medicationDispenses}
        isSubmitting={submitting.medicationDispense}
        isWriteDisabled={isWriteDisabled}
        medicationDispenses={collections.medicationDispenses}
        medicationRequests={collections.medicationRequests}
        selectedMedicationDispense={selections.selectedMedicationDispense}
        selectedMedicationDispenseId={selectedIds.medicationDispense}
        onCreateMedicationDispense={handlers.onCreateMedicationDispense}
        onFormChange={handlers.onMedicationDispenseFormChange}
        onSelectMedicationDispense={handlers.onSelectMedicationDispense}
      />
    ),
    medicationRequest: () => (
      <MedicationRequestPanel
        conditions={collections.conditions}
        encounters={collections.encounters}
        form={forms.medicationRequest}
        isLoading={loading.medicationRequests}
        isSubmitting={submitting.medicationRequest}
        isWriteDisabled={isWriteDisabled}
        medicationRequests={collections.medicationRequests}
        selectedMedicationRequest={selections.selectedMedicationRequest}
        selectedMedicationRequestId={selectedIds.medicationRequest}
        onCreateMedicationRequest={handlers.onCreateMedicationRequest}
        onFormChange={handlers.onMedicationRequestFormChange}
        onSelectMedicationRequest={handlers.onSelectMedicationRequest}
      />
    )
  };
}

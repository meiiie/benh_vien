import { AllergyIntolerancePanel } from "./AllergyIntolerancePanel.js";
import { ConditionPanel } from "./ConditionPanel.js";
import { EncounterPanel } from "./EncounterPanel.js";
import { ObservationPanel } from "./ObservationPanel.js";
import type {
  BuildClinicalRecordPanelRenderersOptions,
  ClinicalRecordPanelRenderers
} from "./clinicalRecordPanelRendererTypes.js";

type ClinicalRecordCorePanelRenderers = Pick<
  ClinicalRecordPanelRenderers,
  "allergyIntolerance" | "condition" | "encounter" | "observation"
>;

export function buildClinicalRecordCorePanelRenderers({
  collections,
  forms,
  handlers,
  isFinishingEncounter,
  isWriteDisabled,
  loading,
  selectedIds,
  selections,
  submitting
}: BuildClinicalRecordPanelRenderersOptions): ClinicalRecordCorePanelRenderers {
  return {
    allergyIntolerance: () => (
      <AllergyIntolerancePanel
        allergyIntolerances={collections.allergyIntolerances}
        encounters={collections.encounters}
        form={forms.allergyIntolerance}
        isLoading={loading.allergyIntolerances}
        isSubmitting={submitting.allergyIntolerance}
        isWriteDisabled={isWriteDisabled}
        selectedAllergyIntolerance={selections.selectedAllergyIntolerance}
        selectedAllergyIntoleranceId={selectedIds.allergyIntolerance}
        onCreateAllergyIntolerance={handlers.onCreateAllergyIntolerance}
        onFormChange={handlers.onAllergyIntoleranceFormChange}
        onSelectAllergyIntolerance={handlers.onSelectAllergyIntolerance}
      />
    ),
    condition: () => (
      <ConditionPanel
        conditions={collections.conditions}
        encounters={collections.encounters}
        form={forms.condition}
        isLoading={loading.conditions}
        isSubmitting={submitting.condition}
        isWriteDisabled={isWriteDisabled}
        selectedCondition={selections.selectedCondition}
        selectedConditionId={selectedIds.condition}
        onCreateCondition={handlers.onCreateCondition}
        onFormChange={handlers.onConditionFormChange}
        onSelectCondition={handlers.onSelectCondition}
      />
    ),
    encounter: () => (
      <EncounterPanel
        encounters={collections.encounters}
        form={forms.encounter}
        isFinishing={isFinishingEncounter}
        isLoading={loading.encounters}
        isSubmitting={submitting.encounter}
        isWriteDisabled={isWriteDisabled}
        selectedEncounter={selections.selectedEncounter}
        selectedEncounterCounts={selections.selectedEncounterCounts}
        selectedEncounterId={selectedIds.encounter}
        onCreateEncounter={handlers.onCreateEncounter}
        onFinishEncounter={handlers.onFinishEncounter}
        onFormChange={handlers.onEncounterFormChange}
        onSelectEncounter={handlers.onSelectEncounter}
      />
    ),
    observation: () => (
      <ObservationPanel
        encounters={collections.encounters}
        form={forms.observation}
        isLoading={loading.observations}
        isSubmitting={submitting.observation}
        isWriteDisabled={isWriteDisabled}
        observations={collections.observations}
        selectedObservation={selections.selectedObservation}
        selectedObservationId={selectedIds.observation}
        onCreateObservation={handlers.onCreateObservation}
        onFormChange={handlers.onObservationFormChange}
        onSelectObservation={handlers.onSelectObservation}
      />
    )
  };
}

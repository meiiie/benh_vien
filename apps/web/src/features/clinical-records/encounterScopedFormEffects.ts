import { useEffect, type Dispatch, type SetStateAction } from "react";
import type { NewAllergyIntoleranceForm } from "../../types/allergies.js";
import type {
  NewProcedureForm,
  NewServiceRequestForm
} from "../../types/careWorkflow.js";
import type { NewClinicalDocumentForm } from "../../types/clinicalDocuments.js";
import type { NewConditionForm } from "../../types/conditions.js";
import type {
  NewDiagnosticReportForm,
  NewImagingStudyForm
} from "../../types/diagnosticResults.js";
import type {
  NewMedicationAdministrationForm,
  NewMedicationDispenseForm,
  NewMedicationRequestForm
} from "../../types/medications.js";
import type { NewObservationForm } from "../../types/observations.js";
import { buildEncounterScopedFormUpdater } from "./encounterScopedFormUpdater.js";

type EncounterScopedFormEffectsConfig = {
  readonly loadEncounterFhirPreview: (encounterId: string) => Promise<void>;
  readonly selectedEncounterId: string | undefined;
  readonly setAllergyIntoleranceForm: Dispatch<SetStateAction<NewAllergyIntoleranceForm>>;
  readonly setConditionForm: Dispatch<SetStateAction<NewConditionForm>>;
  readonly setDiagnosticReportForm: Dispatch<SetStateAction<NewDiagnosticReportForm>>;
  readonly setDocumentForm: Dispatch<SetStateAction<NewClinicalDocumentForm>>;
  readonly setEncounterFhirPreview: (preview: string | undefined) => void;
  readonly setImagingStudyForm: Dispatch<SetStateAction<NewImagingStudyForm>>;
  readonly setMedicationAdministrationForm: Dispatch<
    SetStateAction<NewMedicationAdministrationForm>
  >;
  readonly setMedicationDispenseForm: Dispatch<SetStateAction<NewMedicationDispenseForm>>;
  readonly setMedicationRequestForm: Dispatch<SetStateAction<NewMedicationRequestForm>>;
  readonly setObservationForm: Dispatch<SetStateAction<NewObservationForm>>;
  readonly setProcedureForm: Dispatch<SetStateAction<NewProcedureForm>>;
  readonly setServiceRequestForm: Dispatch<SetStateAction<NewServiceRequestForm>>;
};

export function useEncounterScopedFormEffects(config: EncounterScopedFormEffectsConfig) {
  useEffect(() => {
    const updateEncounterScopedForm = buildEncounterScopedFormUpdater(
      config.selectedEncounterId
    );

    config.setDocumentForm(updateEncounterScopedForm);
    config.setAllergyIntoleranceForm(updateEncounterScopedForm);
    config.setConditionForm(updateEncounterScopedForm);
    config.setObservationForm(updateEncounterScopedForm);
    config.setMedicationRequestForm(updateEncounterScopedForm);
    config.setMedicationDispenseForm(updateEncounterScopedForm);
    config.setMedicationAdministrationForm(updateEncounterScopedForm);
    config.setServiceRequestForm(updateEncounterScopedForm);
    config.setProcedureForm(updateEncounterScopedForm);
    config.setDiagnosticReportForm(updateEncounterScopedForm);
    config.setImagingStudyForm(updateEncounterScopedForm);

    if (!config.selectedEncounterId) {
      config.setEncounterFhirPreview(undefined);
      return;
    }

    void config.loadEncounterFhirPreview(config.selectedEncounterId);
  }, [config.selectedEncounterId]);
}

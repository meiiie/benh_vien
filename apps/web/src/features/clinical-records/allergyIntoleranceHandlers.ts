import {
  buildAllergyIntoleranceCommand
} from "./clinicalEntryCommandBuilders.js";
import { createAllergyIntolerance } from "./clinicalRecordApi.js";
import type {
  ClinicalEntryHandlerConfig,
  ClinicalEntryHandlers,
  EnsureSelectedWritablePatient
} from "./clinicalEntryHandlerTypes.js";

type AllergyIntoleranceHandlerConfig = Pick<
  ClinicalEntryHandlerConfig,
  | "allergyIntoleranceForm"
  | "clinicalApi"
  | "loadAllergyIntolerances"
  | "loadAuditEvents"
  | "loadPatientFhirBundlePreview"
  | "setAppRoute"
  | "setIsSubmittingAllergyIntolerance"
  | "setStatusMessage"
> & {
  readonly ensureSelectedWritablePatient: EnsureSelectedWritablePatient;
};

export function buildAllergyIntoleranceHandlers(
  config: AllergyIntoleranceHandlerConfig
): Pick<ClinicalEntryHandlers, "handleCreateAllergyIntolerance"> {
  return {
    handleCreateAllergyIntolerance: async (event) => {
      event.preventDefault();

      const selectedPatient = config.ensureSelectedWritablePatient(
        "Cần chọn bệnh nhân trước khi ghi nhận dị ứng/cảnh báo."
      );

      if (!selectedPatient) {
        return;
      }

      config.setIsSubmittingAllergyIntolerance(true);

      try {
        const createdAllergyIntolerance = await createAllergyIntolerance(
          config.clinicalApi,
          selectedPatient.id,
          buildAllergyIntoleranceCommand(config.allergyIntoleranceForm)
        );
        await config.loadAllergyIntolerances(
          selectedPatient.id,
          createdAllergyIntolerance.id
        );
        await config.loadPatientFhirBundlePreview(selectedPatient.id);
        await config.loadAuditEvents(selectedPatient.id, { silent: true });
        config.setAppRoute("workspace");
        config.setStatusMessage(
          `Đã ghi nhận dị ứng/cảnh báo "${createdAllergyIntolerance.code.display}" cho ${selectedPatient.fullName}.`
        );
      } catch (error) {
        config.setStatusMessage(
          error instanceof Error
            ? `Không thể ghi nhận dị ứng/cảnh báo: ${error.message}`
            : "Không thể ghi nhận dị ứng/cảnh báo."
        );
      } finally {
        config.setIsSubmittingAllergyIntolerance(false);
      }
    }
  };
}

import type {
  EnsureSelectedWritablePatient,
  MedicationHandlerConfig,
  MedicationHandlers
} from "./medicationHandlerTypes.js";
import { buildMedicationAdministrationCommandDraft } from "./medicationCommandBuilders.js";
import { createMedicationAdministration } from "./clinicalRecordApi.js";

type MedicationAdministrationHandlerConfig = Pick<
  MedicationHandlerConfig,
  | "clinicalApi"
  | "loadAuditEvents"
  | "loadMedicationAdministrations"
  | "loadPatientFhirBundlePreview"
  | "loadPatientFhirDocumentBundlePreview"
  | "medicationAdministrationForm"
  | "setAppRoute"
  | "setIsSubmittingMedicationAdministration"
  | "setStatusMessage"
> & {
  readonly ensureSelectedWritablePatient: EnsureSelectedWritablePatient;
};

export function buildMedicationAdministrationHandlers(
  config: MedicationAdministrationHandlerConfig
): Pick<MedicationHandlers, "handleCreateMedicationAdministration"> {
  return {
    handleCreateMedicationAdministration: async (event) => {
      event.preventDefault();

      const selectedPatient = config.ensureSelectedWritablePatient(
        "Cần chọn bệnh nhân trước khi ghi nhận dùng thuốc thực tế."
      );

      if (!selectedPatient) {
        return;
      }

      const commandDraft = buildMedicationAdministrationCommandDraft(
        config.medicationAdministrationForm
      );

      if (!commandDraft.ok) {
        config.setStatusMessage(commandDraft.message);
        return;
      }

      config.setIsSubmittingMedicationAdministration(true);

      try {
        const createdMedicationAdministration =
          await createMedicationAdministration(
            config.clinicalApi,
            selectedPatient.id,
            commandDraft.command
          );
        await config.loadMedicationAdministrations(
          selectedPatient.id,
          createdMedicationAdministration.id
        );
        await config.loadPatientFhirBundlePreview(selectedPatient.id);
        await config.loadPatientFhirDocumentBundlePreview(selectedPatient.id);
        await config.loadAuditEvents(selectedPatient.id, { silent: true });
        config.setAppRoute("workspace");
        config.setStatusMessage(
          `Đã ghi nhận dùng thuốc "${createdMedicationAdministration.medicationCode.display}" cho ${selectedPatient.fullName}.`
        );
      } catch (error) {
        config.setStatusMessage(
          error instanceof Error
            ? `Không thể ghi nhận dùng thuốc thực tế: ${error.message}`
            : "Không thể ghi nhận dùng thuốc thực tế."
        );
      } finally {
        config.setIsSubmittingMedicationAdministration(false);
      }
    }
  };
}

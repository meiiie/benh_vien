import type {
  EnsureSelectedWritablePatient,
  MedicationHandlerConfig,
  MedicationHandlers
} from "./medicationHandlerTypes.js";
import { buildMedicationDispenseCommandDraft } from "./medicationCommandBuilders.js";
import { createMedicationDispense } from "./clinicalRecordApi.js";

type MedicationDispenseHandlerConfig = Pick<
  MedicationHandlerConfig,
  | "clinicalApi"
  | "loadAuditEvents"
  | "loadMedicationDispenses"
  | "loadPatientFhirBundlePreview"
  | "loadPatientFhirDocumentBundlePreview"
  | "medicationDispenseForm"
  | "setAppRoute"
  | "setIsSubmittingMedicationDispense"
  | "setStatusMessage"
> & {
  readonly ensureSelectedWritablePatient: EnsureSelectedWritablePatient;
};

export function buildMedicationDispenseHandlers(
  config: MedicationDispenseHandlerConfig
): Pick<MedicationHandlers, "handleCreateMedicationDispense"> {
  return {
    handleCreateMedicationDispense: async (event) => {
      event.preventDefault();

      const selectedPatient = config.ensureSelectedWritablePatient(
        "Cần chọn bệnh nhân trước khi ghi nhận cấp phát thuốc."
      );

      if (!selectedPatient) {
        return;
      }

      const commandDraft = buildMedicationDispenseCommandDraft(
        config.medicationDispenseForm
      );

      if (!commandDraft.ok) {
        config.setStatusMessage(commandDraft.message);
        return;
      }

      config.setIsSubmittingMedicationDispense(true);

      try {
        const createdMedicationDispense = await createMedicationDispense(
          config.clinicalApi,
          selectedPatient.id,
          commandDraft.command
        );
        await config.loadMedicationDispenses(
          selectedPatient.id,
          createdMedicationDispense.id
        );
        await config.loadPatientFhirBundlePreview(selectedPatient.id);
        await config.loadPatientFhirDocumentBundlePreview(selectedPatient.id);
        await config.loadAuditEvents(selectedPatient.id, { silent: true });
        config.setAppRoute("workspace");
        config.setStatusMessage(
          `Đã ghi nhận cấp phát thuốc "${createdMedicationDispense.medicationCode.display}" cho ${selectedPatient.fullName}.`
        );
      } catch (error) {
        config.setStatusMessage(
          error instanceof Error
            ? `Không thể ghi nhận cấp phát thuốc: ${error.message}`
            : "Không thể ghi nhận cấp phát thuốc."
        );
      } finally {
        config.setIsSubmittingMedicationDispense(false);
      }
    }
  };
}

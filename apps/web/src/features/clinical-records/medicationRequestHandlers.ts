import type {
  EnsureSelectedWritablePatient,
  MedicationHandlerConfig,
  MedicationHandlers
} from "./medicationHandlerTypes.js";
import { buildMedicationRequestCommandDraft } from "./medicationCommandBuilders.js";
import { createMedicationRequest } from "./clinicalRecordApi.js";

type MedicationRequestHandlerConfig = Pick<
  MedicationHandlerConfig,
  | "clinicalApi"
  | "loadAuditEvents"
  | "loadMedicationRequests"
  | "loadPatientFhirBundlePreview"
  | "medicationRequestForm"
  | "setAppRoute"
  | "setIsSubmittingMedicationRequest"
  | "setStatusMessage"
> & {
  readonly ensureSelectedWritablePatient: EnsureSelectedWritablePatient;
};

export function buildMedicationRequestHandlers(
  config: MedicationRequestHandlerConfig
): Pick<MedicationHandlers, "handleCreateMedicationRequest"> {
  return {
    handleCreateMedicationRequest: async (event) => {
      event.preventDefault();

      const selectedPatient = config.ensureSelectedWritablePatient(
        "Cần chọn bệnh nhân trước khi kê/chỉ định thuốc."
      );

      if (!selectedPatient) {
        return;
      }

      const commandDraft = buildMedicationRequestCommandDraft(
        config.medicationRequestForm
      );

      if (!commandDraft.ok) {
        config.setStatusMessage(commandDraft.message);
        return;
      }

      config.setIsSubmittingMedicationRequest(true);

      try {
        const createdMedicationRequest = await createMedicationRequest(
          config.clinicalApi,
          selectedPatient.id,
          commandDraft.command
        );
        await config.loadMedicationRequests(
          selectedPatient.id,
          createdMedicationRequest.id
        );
        await config.loadPatientFhirBundlePreview(selectedPatient.id);
        await config.loadAuditEvents(selectedPatient.id, { silent: true });
        config.setAppRoute("workspace");
        config.setStatusMessage(
          `Đã ghi nhận chỉ định thuốc "${createdMedicationRequest.medicationCode.display}" cho ${selectedPatient.fullName}.`
        );
      } catch (error) {
        config.setStatusMessage(
          error instanceof Error
            ? `Không thể ghi nhận chỉ định thuốc: ${error.message}`
            : "Không thể ghi nhận chỉ định thuốc."
        );
      } finally {
        config.setIsSubmittingMedicationRequest(false);
      }
    }
  };
}

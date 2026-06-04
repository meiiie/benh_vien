import { buildObservationCommandDraft } from "./clinicalEntryCommandBuilders.js";
import { createObservation } from "./clinicalRecordApi.js";
import type {
  ClinicalEntryHandlerConfig,
  ClinicalEntryHandlers,
  EnsureSelectedWritablePatient
} from "./clinicalEntryHandlerTypes.js";

type ObservationHandlerConfig = Pick<
  ClinicalEntryHandlerConfig,
  | "clinicalApi"
  | "loadAuditEvents"
  | "loadObservations"
  | "loadPatientFhirBundlePreview"
  | "observationForm"
  | "setAppRoute"
  | "setIsSubmittingObservation"
  | "setStatusMessage"
> & {
  readonly ensureSelectedWritablePatient: EnsureSelectedWritablePatient;
};

export function buildObservationHandlers(
  config: ObservationHandlerConfig
): Pick<ClinicalEntryHandlers, "handleCreateObservation"> {
  return {
    handleCreateObservation: async (event) => {
      event.preventDefault();

      const selectedPatient = config.ensureSelectedWritablePatient(
        "Cần chọn bệnh nhân trước khi ghi nhận chỉ số lâm sàng."
      );

      if (!selectedPatient) {
        return;
      }

      const commandDraft = buildObservationCommandDraft(config.observationForm);

      if (!commandDraft.ok) {
        config.setStatusMessage(commandDraft.message);
        return;
      }

      config.setIsSubmittingObservation(true);

      try {
        const createdObservation = await createObservation(
          config.clinicalApi,
          selectedPatient.id,
          commandDraft.command
        );
        await config.loadObservations(selectedPatient.id, createdObservation.id);
        await config.loadPatientFhirBundlePreview(selectedPatient.id);
        await config.loadAuditEvents(selectedPatient.id, { silent: true });
        config.setAppRoute("workspace");
        config.setStatusMessage(
          `Đã ghi nhận "${createdObservation.code.display}" cho ${selectedPatient.fullName}.`
        );
      } catch (error) {
        config.setStatusMessage(
          error instanceof Error
            ? `Không thể ghi nhận chỉ số lâm sàng: ${error.message}`
            : "Không thể ghi nhận chỉ số lâm sàng."
        );
      } finally {
        config.setIsSubmittingObservation(false);
      }
    }
  };
}

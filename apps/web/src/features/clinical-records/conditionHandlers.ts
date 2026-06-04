import { buildConditionCommand } from "./clinicalEntryCommandBuilders.js";
import { createCondition } from "./clinicalRecordApi.js";
import type {
  ClinicalEntryHandlerConfig,
  ClinicalEntryHandlers,
  EnsureSelectedWritablePatient
} from "./clinicalEntryHandlerTypes.js";

type ConditionHandlerConfig = Pick<
  ClinicalEntryHandlerConfig,
  | "clinicalApi"
  | "conditionForm"
  | "loadAuditEvents"
  | "loadConditions"
  | "loadPatientFhirBundlePreview"
  | "setAppRoute"
  | "setIsSubmittingCondition"
  | "setStatusMessage"
> & {
  readonly ensureSelectedWritablePatient: EnsureSelectedWritablePatient;
};

export function buildConditionHandlers(
  config: ConditionHandlerConfig
): Pick<ClinicalEntryHandlers, "handleCreateCondition"> {
  return {
    handleCreateCondition: async (event) => {
      event.preventDefault();

      const selectedPatient = config.ensureSelectedWritablePatient(
        "Cần chọn bệnh nhân trước khi ghi nhận chẩn đoán."
      );

      if (!selectedPatient) {
        return;
      }

      config.setIsSubmittingCondition(true);

      try {
        const createdCondition = await createCondition(
          config.clinicalApi,
          selectedPatient.id,
          buildConditionCommand(config.conditionForm)
        );
        await config.loadConditions(selectedPatient.id, createdCondition.id);
        await config.loadPatientFhirBundlePreview(selectedPatient.id);
        await config.loadAuditEvents(selectedPatient.id, { silent: true });
        config.setAppRoute("workspace");
        config.setStatusMessage(
          `Đã ghi nhận chẩn đoán "${createdCondition.code.display}" cho ${selectedPatient.fullName}.`
        );
      } catch (error) {
        config.setStatusMessage(
          error instanceof Error
            ? `Không thể ghi nhận chẩn đoán: ${error.message}`
            : "Không thể ghi nhận chẩn đoán."
        );
      } finally {
        config.setIsSubmittingCondition(false);
      }
    }
  };
}

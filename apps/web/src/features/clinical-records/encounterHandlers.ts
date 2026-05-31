import type { FormEvent } from "react";
import type { ClinicalApiClient } from "../../api/clinicalApi.js";
import type {
  AppRoute,
  NewEncounterForm,
  Patient
} from "../../types/clinical.js";
import {
  createEncounter,
  finishEncounter
} from "./clinicalRecordApi.js";
import { buildEncounterCommand } from "./clinicalEntryCommandBuilders.js";

type EncounterHandlerConfig = {
  readonly clinicalApi: ClinicalApiClient;
  readonly encounterForm: NewEncounterForm;
  readonly ensureSelectedPatientWritable: () => boolean;
  readonly loadAuditEvents: (
    patientId: string,
    options?: { readonly silent?: boolean }
  ) => Promise<void>;
  readonly loadEncounterFhirPreview: (encounterId: string) => Promise<void>;
  readonly loadEncounters: (
    patientId: string,
    nextSelectedEncounterId?: string
  ) => Promise<void>;
  readonly selectedPatient: Patient | undefined;
  readonly setAppRoute: (route: AppRoute) => void;
  readonly setIsFinishingEncounter: (isFinishing: boolean) => void;
  readonly setIsSubmittingEncounter: (isSubmitting: boolean) => void;
  readonly setStatusMessage: (message: string) => void;
};

export function buildEncounterHandlers(config: EncounterHandlerConfig) {
  return {
    handleCreateEncounter: async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!config.selectedPatient) {
        config.setStatusMessage(
          "Cần chọn bệnh nhân trước khi mở lượt khám."
        );
        return;
      }

      if (!config.ensureSelectedPatientWritable()) {
        return;
      }

      config.setIsSubmittingEncounter(true);

      try {
        const createdEncounter = await createEncounter(
          config.clinicalApi,
          config.selectedPatient.id,
          buildEncounterCommand(config.encounterForm)
        );
        await config.loadEncounters(config.selectedPatient.id, createdEncounter.id);
        await config.loadAuditEvents(config.selectedPatient.id, { silent: true });
        config.setAppRoute("workspace");
        config.setStatusMessage(
          `Đã mở lượt khám "${createdEncounter.serviceType}" cho ${config.selectedPatient.fullName}.`
        );
      } catch (error) {
        config.setStatusMessage(
          error instanceof Error
            ? `Không thể mở lượt khám: ${error.message}`
            : "Không thể mở lượt khám."
        );
      } finally {
        config.setIsSubmittingEncounter(false);
      }
    },
    handleFinishEncounter: async (encounterId: string) => {
      if (!config.selectedPatient) {
        return;
      }

      if (!config.ensureSelectedPatientWritable()) {
        return;
      }

      config.setIsFinishingEncounter(true);

      try {
        const finishedEncounter = await finishEncounter(
          config.clinicalApi,
          encounterId
        );
        await config.loadEncounters(config.selectedPatient.id, finishedEncounter.id);
        await config.loadEncounterFhirPreview(finishedEncounter.id);
        await config.loadAuditEvents(config.selectedPatient.id, { silent: true });
        config.setStatusMessage(
          `Đã kết thúc lượt khám "${finishedEncounter.serviceType}".`
        );
      } catch (error) {
        config.setStatusMessage(
          error instanceof Error
            ? `Không thể kết thúc lượt khám: ${error.message}`
            : "Không thể kết thúc lượt khám."
        );
      } finally {
        config.setIsFinishingEncounter(false);
      }
    }
  };
}

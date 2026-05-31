import type { FormEvent } from "react";
import type { ClinicalApiClient } from "../../api/clinicalApi.js";
import type {
  AppRoute,
  NewAllergyIntoleranceForm,
  NewConditionForm,
  NewObservationForm,
  Patient
} from "../../types/clinical.js";
import {
  createAllergyIntolerance,
  createCondition,
  createObservation
} from "./clinicalRecordApi.js";
import {
  buildAllergyIntoleranceCommand,
  buildConditionCommand,
  buildObservationCommandDraft
} from "./clinicalEntryCommandBuilders.js";

type ClinicalEntryHandlerConfig = {
  readonly allergyIntoleranceForm: NewAllergyIntoleranceForm;
  readonly clinicalApi: ClinicalApiClient;
  readonly conditionForm: NewConditionForm;
  readonly ensureSelectedPatientWritable: () => boolean;
  readonly loadAllergyIntolerances: (
    patientId: string,
    nextSelectedAllergyIntoleranceId?: string
  ) => Promise<void>;
  readonly loadAuditEvents: (
    patientId: string,
    options?: { readonly silent?: boolean }
  ) => Promise<void>;
  readonly loadConditions: (
    patientId: string,
    nextSelectedConditionId?: string
  ) => Promise<void>;
  readonly loadObservations: (
    patientId: string,
    nextSelectedObservationId?: string
  ) => Promise<void>;
  readonly loadPatientFhirBundlePreview: (patientId: string) => Promise<void>;
  readonly observationForm: NewObservationForm;
  readonly selectedPatient: Patient | undefined;
  readonly setAppRoute: (route: AppRoute) => void;
  readonly setIsSubmittingAllergyIntolerance: (isSubmitting: boolean) => void;
  readonly setIsSubmittingCondition: (isSubmitting: boolean) => void;
  readonly setIsSubmittingObservation: (isSubmitting: boolean) => void;
  readonly setStatusMessage: (message: string) => void;
};

export function buildClinicalEntryHandlers(config: ClinicalEntryHandlerConfig) {
  const ensureSelectedWritablePatient = (emptyMessage: string): Patient | undefined => {
    if (!config.selectedPatient) {
      config.setStatusMessage(emptyMessage);
      return undefined;
    }

    if (!config.ensureSelectedPatientWritable()) {
      return undefined;
    }

    return config.selectedPatient;
  };

  return {
    handleCreateAllergyIntolerance: async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const selectedPatient = ensureSelectedWritablePatient(
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
    },
    handleCreateCondition: async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const selectedPatient = ensureSelectedWritablePatient(
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
    },
    handleCreateObservation: async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const selectedPatient = ensureSelectedWritablePatient(
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

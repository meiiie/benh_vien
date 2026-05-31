import type { FormEvent } from "react";
import type { ClinicalApiClient } from "../../api/clinicalApi.js";
import type {
  AppRoute,
  NewMedicationAdministrationForm,
  NewMedicationDispenseForm,
  NewMedicationRequestForm,
  Patient
} from "../../types/clinical.js";
import {
  createMedicationAdministration,
  createMedicationDispense,
  createMedicationRequest
} from "./clinicalRecordApi.js";
import {
  buildMedicationAdministrationCommandDraft,
  buildMedicationDispenseCommandDraft,
  buildMedicationRequestCommandDraft
} from "./medicationCommandBuilders.js";

type MedicationHandlerConfig = {
  readonly clinicalApi: ClinicalApiClient;
  readonly ensureSelectedPatientWritable: () => boolean;
  readonly loadAuditEvents: (
    patientId: string,
    options?: { readonly silent?: boolean }
  ) => Promise<void>;
  readonly loadMedicationAdministrations: (
    patientId: string,
    nextSelectedMedicationAdministrationId?: string
  ) => Promise<void>;
  readonly loadMedicationDispenses: (
    patientId: string,
    nextSelectedMedicationDispenseId?: string
  ) => Promise<void>;
  readonly loadMedicationRequests: (
    patientId: string,
    nextSelectedMedicationRequestId?: string
  ) => Promise<void>;
  readonly loadPatientFhirBundlePreview: (patientId: string) => Promise<void>;
  readonly loadPatientFhirDocumentBundlePreview: (patientId: string) => Promise<void>;
  readonly medicationAdministrationForm: NewMedicationAdministrationForm;
  readonly medicationDispenseForm: NewMedicationDispenseForm;
  readonly medicationRequestForm: NewMedicationRequestForm;
  readonly selectedPatient: Patient | undefined;
  readonly setAppRoute: (route: AppRoute) => void;
  readonly setIsSubmittingMedicationAdministration: (isSubmitting: boolean) => void;
  readonly setIsSubmittingMedicationDispense: (isSubmitting: boolean) => void;
  readonly setIsSubmittingMedicationRequest: (isSubmitting: boolean) => void;
  readonly setStatusMessage: (message: string) => void;
};

export function buildMedicationHandlers(config: MedicationHandlerConfig) {
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
    handleCreateMedicationAdministration: async (
      event: FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      const selectedPatient = ensureSelectedWritablePatient(
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
        const createdMedicationAdministration = await createMedicationAdministration(
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
    },
    handleCreateMedicationDispense: async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const selectedPatient = ensureSelectedWritablePatient(
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
    },
    handleCreateMedicationRequest: async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const selectedPatient = ensureSelectedWritablePatient(
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

import type { FormEvent } from "react";
import type { ClinicalApiClient } from "../../api/clinicalApi.js";
import type {
  AppRoute,
  NewPatientForm,
  Patient,
  PatientMergeForm
} from "../../types/clinical.js";
import {
  buildCreatePatientCommand,
  buildMergePatientCommand
} from "./patientRegistryCommandBuilders.js";
import { createPatient, mergePatient } from "./patientRegistryApi.js";

type PatientRegistryHandlerConfig = {
  readonly canMergePatients: boolean;
  readonly clinicalApi: ClinicalApiClient;
  readonly isPatientMergeConfirmationValid: boolean;
  readonly loadPatients: (nextSelectedId?: string) => Promise<void>;
  readonly loadPatientWorkspace: (patientId: string) => Promise<void>;
  readonly patientForm: NewPatientForm;
  readonly patientMergeConfirmationCode: string;
  readonly patientMergeForm: PatientMergeForm;
  readonly patientMergeTargetId: string | undefined;
  readonly selectedPatient: Patient | undefined;
  readonly setAppRoute: (route: AppRoute) => void;
  readonly setIsMergingPatient: (isMerging: boolean) => void;
  readonly setIsSubmittingPatient: (isSubmitting: boolean) => void;
  readonly setPatientMergeForm: (form: PatientMergeForm) => void;
  readonly setStatusMessage: (message: string) => void;
};

export function buildPatientRegistryHandlers(config: PatientRegistryHandlerConfig) {
  return {
    handleCreatePatient: async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      config.setIsSubmittingPatient(true);

      try {
        const createdPatient = await createPatient(
          config.clinicalApi,
          buildCreatePatientCommand(config.patientForm)
        );
        await config.loadPatients(createdPatient.id);
        config.setAppRoute("workspace");
        config.setStatusMessage(
          `Đã tạo hồ sơ ${createdPatient.fullName} và chọn ngay trên workspace.`
        );
      } catch (error) {
        config.setStatusMessage(
          error instanceof Error
            ? `Không thể tạo hồ sơ bệnh nhân: ${error.message}`
            : "Không thể tạo hồ sơ bệnh nhân."
        );
      } finally {
        config.setIsSubmittingPatient(false);
      }
    },
    handleMergeSelectedPatient: async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const selectedPatient = config.selectedPatient;
      const patientMergeTargetId = config.patientMergeTargetId;

      if (!selectedPatient) {
        config.setStatusMessage("Cần chọn hồ sơ nguồn trước khi merge.");
        return;
      }

      if (!config.canMergePatients) {
        config.setStatusMessage(
          "Chỉ quản trị viên mới được merge hồ sơ bệnh nhân."
        );
        return;
      }

      if (selectedPatient.status !== "active") {
        config.setStatusMessage("Chỉ merge được hồ sơ nguồn đang hoạt động.");
        return;
      }

      if (!patientMergeTargetId) {
        config.setStatusMessage("Cần chọn hồ sơ đích trước khi merge.");
        return;
      }

      if (!config.patientMergeForm.reason.trim()) {
        config.setStatusMessage(
          "Cần nhập lý do merge để phục vụ kiểm toán/MPI."
        );
        return;
      }

      if (!config.isPatientMergeConfirmationValid) {
        config.setStatusMessage(
          `Cần nhập đúng mã xác nhận "${config.patientMergeConfirmationCode}" trước khi merge.`
        );
        return;
      }

      config.setIsMergingPatient(true);

      try {
        const mergedPatient = await mergePatient(
          config.clinicalApi,
          selectedPatient.id,
          buildMergePatientCommand(config.patientMergeForm, patientMergeTargetId)
        );
        await config.loadPatients(mergedPatient.id);
        await config.loadPatientWorkspace(mergedPatient.id);
        config.setPatientMergeForm({
          ...config.patientMergeForm,
          confirmationText: ""
        });
        config.setStatusMessage(
          `Đã merge hồ sơ ${mergedPatient.fullName} vào hồ sơ đích ${mergedPatient.mergedIntoPatientId}. Hồ sơ nguồn đã chuyển sang chế độ chỉ đọc.`
        );
      } catch (error) {
        config.setStatusMessage(
          error instanceof Error
            ? `Không thể merge hồ sơ bệnh nhân: ${error.message}`
            : "Không thể merge hồ sơ bệnh nhân."
        );
      } finally {
        config.setIsMergingPatient(false);
      }
    }
  };
}

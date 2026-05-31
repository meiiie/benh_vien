import type { ClinicalApiClient } from "../../api/clinicalApi.js";
import type { Patient, PurposeOfUse } from "../../types/clinical.js";
import { listPatients } from "./patientRegistryApi.js";

type PatientRegistryLoaderConfig = {
  readonly clinicalApi: ClinicalApiClient;
  readonly isAuditOnlySession: boolean;
  readonly selectedPatientId: string | undefined;
  readonly setIsLoadingPatients: (isLoading: boolean) => void;
  readonly setPatients: (patients: readonly Patient[]) => void;
  readonly setSelectedPatientId: (patientId: string | undefined) => void;
  readonly setStatusMessage: (message: string) => void;
};

export function buildPatientRegistryLoaders(config: PatientRegistryLoaderConfig) {
  const loadPatients = async (nextSelectedId?: string) => {
    config.setIsLoadingPatients(true);

    try {
      const purposeOfUse: PurposeOfUse = config.isAuditOnlySession
        ? "AUDIT"
        : "TREATMENT";
      const data = await listPatients(config.clinicalApi, purposeOfUse);
      config.setPatients(data.items);
      config.setSelectedPatientId(
        nextSelectedId ?? config.selectedPatientId ?? data.items[0]?.id
      );
      config.setStatusMessage(
        `Đã tải ${data.items.length} hồ sơ bệnh nhân từ backend.`
      );
    } catch (error) {
      config.setStatusMessage(
        error instanceof Error
          ? `Không thể tải dữ liệu bệnh nhân: ${error.message}`
          : "Không thể tải dữ liệu bệnh nhân."
      );
    } finally {
      config.setIsLoadingPatients(false);
    }
  };

  return {
    loadPatients
  };
}

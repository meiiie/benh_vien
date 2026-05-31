import type { ClinicalApiClient } from "../api/clinicalApi.js";
import { buildPatientRegistryLoaders } from "../features/patient-registry/patientRegistryLoaders.js";
import type { usePatientRegistryState } from "../features/patient-registry/patientRegistryState.js";

type PatientRegistryState = ReturnType<typeof usePatientRegistryState>;

type BuildAppPatientRegistryLoadersInput = {
  readonly clinicalApi: ClinicalApiClient;
  readonly isAuditOnlySession: boolean;
  readonly patientRegistryState: PatientRegistryState;
  readonly setStatusMessage: (message: string) => void;
};

export function buildAppPatientRegistryLoaders({
  clinicalApi,
  isAuditOnlySession,
  patientRegistryState,
  setStatusMessage
}: BuildAppPatientRegistryLoadersInput) {
  return buildPatientRegistryLoaders({
    clinicalApi,
    isAuditOnlySession,
    selectedPatientId: patientRegistryState.selectedPatientId,
    setIsLoadingPatients: patientRegistryState.setIsLoadingPatients,
    setPatients: patientRegistryState.setPatients,
    setSelectedPatientId: patientRegistryState.setSelectedPatientId,
    setStatusMessage
  });
}

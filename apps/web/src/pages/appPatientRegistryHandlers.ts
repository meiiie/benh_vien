import type { ClinicalApiClient } from "../api/clinicalApi.js";
import { buildPatientRegistryHandlers } from "../features/patient-registry/patientRegistryHandlers.js";
import type { usePatientRegistryState } from "../features/patient-registry/patientRegistryState.js";
import type { AppRoute, Patient } from "../types/clinical.js";

type PatientRegistryState = ReturnType<typeof usePatientRegistryState>;

type BuildAppPatientRegistryHandlersInput = {
  readonly canMergePatients: boolean;
  readonly clinicalApi: ClinicalApiClient;
  readonly isPatientMergeConfirmationValid: boolean;
  readonly loadPatients: (nextSelectedId?: string) => Promise<void>;
  readonly loadPatientWorkspace: (patientId: string) => Promise<void>;
  readonly patientMergeConfirmationCode: string;
  readonly patientMergeTargetId: string | undefined;
  readonly patientRegistryState: PatientRegistryState;
  readonly selectedPatient: Patient | undefined;
  readonly setAppRoute: (route: AppRoute) => void;
  readonly setStatusMessage: (message: string) => void;
};

export function buildAppPatientRegistryHandlers({
  canMergePatients,
  clinicalApi,
  isPatientMergeConfirmationValid,
  loadPatients,
  loadPatientWorkspace,
  patientMergeConfirmationCode,
  patientMergeTargetId,
  patientRegistryState,
  selectedPatient,
  setAppRoute,
  setStatusMessage
}: BuildAppPatientRegistryHandlersInput) {
  return buildPatientRegistryHandlers({
    canMergePatients,
    clinicalApi,
    isPatientMergeConfirmationValid,
    loadPatients,
    loadPatientWorkspace,
    patientForm: patientRegistryState.patientForm,
    patientMergeConfirmationCode,
    patientMergeForm: patientRegistryState.patientMergeForm,
    patientMergeTargetId,
    selectedPatient,
    setAppRoute,
    setIsMergingPatient: patientRegistryState.setIsMergingPatient,
    setIsSubmittingPatient: patientRegistryState.setIsSubmittingPatient,
    setPatientMergeForm: patientRegistryState.setPatientMergeForm,
    setStatusMessage
  });
}

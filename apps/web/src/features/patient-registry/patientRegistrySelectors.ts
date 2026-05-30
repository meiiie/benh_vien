import {
  formatIdentifierType,
  formatPatientRecordStatus,
  normalizeSearchText
} from "../../lib/clinicalFormatters.js";
import type {
  Patient,
  PatientMergeForm,
  PatientStatusFilter
} from "../../types/clinical.js";

type BuildPatientRegistrySelectionInput = {
  readonly patientMergeForm: PatientMergeForm;
  readonly patientSearchTerm: string;
  readonly patientStatusFilter: PatientStatusFilter;
  readonly patients: readonly Patient[];
  readonly selectedPatientId?: string;
};

export function buildPatientRegistrySelection({
  patientMergeForm,
  patientSearchTerm,
  patientStatusFilter,
  patients,
  selectedPatientId
}: BuildPatientRegistrySelectionInput) {
  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId);
  const selectedPatientMergeTarget = selectedPatient?.mergedIntoPatientId
    ? patients.find((patient) => patient.id === selectedPatient.mergedIntoPatientId)
    : undefined;
  const isSelectedPatientMerged = selectedPatient?.status === "merged";
  const selectedPatientWriteDisabled = !selectedPatient || isSelectedPatientMerged;
  const patientMergeCandidates = selectedPatient
    ? patients.filter((patient) => patient.id !== selectedPatient.id && patient.status === "active")
    : [];
  const patientMergeTargetId = patientMergeCandidates.some(
    (patient) => patient.id === patientMergeForm.targetPatientId
  )
    ? patientMergeForm.targetPatientId
    : patientMergeCandidates[0]?.id ?? "";
  const patientMergeConfirmationCode =
    selectedPatient?.identifiers[0]?.value ?? selectedPatient?.id ?? "";
  const isPatientMergeConfirmationValid =
    Boolean(selectedPatient) &&
    patientMergeForm.confirmationText.trim() === patientMergeConfirmationCode;
  const normalizedPatientSearchTerm = normalizeSearchText(patientSearchTerm);
  const visiblePatients = patients.filter((patient) => {
    if (patientStatusFilter !== "all" && patient.status !== patientStatusFilter) {
      return false;
    }

    if (!normalizedPatientSearchTerm) {
      return true;
    }

    return [
      patient.id,
      patient.fullName,
      patient.address ?? "",
      patient.phone ?? "",
      patient.managingOrganizationId,
      formatPatientRecordStatus(patient.status),
      ...patient.identifiers.flatMap((identifier) => [
        identifier.value,
        identifier.system,
        formatIdentifierType(identifier.type)
      ])
    ].some((value) => normalizeSearchText(value).includes(normalizedPatientSearchTerm));
  });

  return {
    hasPatientListFilter:
      Boolean(normalizedPatientSearchTerm) || patientStatusFilter !== "all",
    isPatientMergeConfirmationValid,
    isSelectedPatientMerged,
    patientMergeCandidates,
    patientMergeConfirmationCode,
    patientMergeTargetId,
    selectedPatient,
    selectedPatientMergeTarget,
    selectedPatientWriteDisabled,
    visiblePatients
  };
}

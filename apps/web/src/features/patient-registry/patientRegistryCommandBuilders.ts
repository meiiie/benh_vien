import type { NewPatientForm, PatientMergeForm } from "../../types/clinical.js";
import type { createPatient, mergePatient } from "./patientRegistryApi.js";

type CreatePatientCommand = Parameters<typeof createPatient>[1];
type MergePatientCommand = Parameters<typeof mergePatient>[2];

export function buildCreatePatientCommand(form: NewPatientForm): CreatePatientCommand {
  return {
    identifiers: [
      {
        system: "urn:gov:vietnam:national-id",
        value: form.nationalId,
        type: "national-id"
      },
      {
        system: "urn:benh-vien-so:mrn",
        value: form.hospitalMrn,
        type: "hospital-mrn"
      }
    ],
    fullName: form.fullName,
    birthDate: form.birthDate || undefined,
    gender: form.gender,
    address: form.address || undefined,
    phone: form.phone || undefined,
    managingOrganizationId: form.managingOrganizationId
  };
}

export function buildMergePatientCommand(
  form: PatientMergeForm,
  targetPatientId: string
): MergePatientCommand {
  return {
    targetPatientId,
    reason: form.reason.trim()
  };
}

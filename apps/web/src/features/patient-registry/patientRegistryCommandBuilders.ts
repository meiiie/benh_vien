import type { NewPatientForm } from "../../types/clinical.js";
import type { createPatient } from "./patientRegistryApi.js";

type CreatePatientCommand = Parameters<typeof createPatient>[1];

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

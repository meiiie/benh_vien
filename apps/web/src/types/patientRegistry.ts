export type PatientIdentifierType = "national-id" | "insurance-id" | "hospital-mrn" | "legacy-id";
export type PatientGender = "male" | "female" | "other" | "unknown";

export type PatientIdentifier = {
  readonly system: string;
  readonly value: string;
  readonly type: PatientIdentifierType;
};

export type Patient = {
  readonly id: string;
  readonly identifiers: readonly PatientIdentifier[];
  readonly fullName: string;
  readonly birthDate?: string;
  readonly gender: PatientGender;
  readonly address?: string;
  readonly phone?: string;
  readonly managingOrganizationId: string;
  readonly status: "active" | "merged" | "inactive";
  readonly mergedIntoPatientId?: string;
  readonly mergedAt?: string;
  readonly mergedByActorId?: string;
  readonly mergeReason?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type PatientStatusFilter = "all" | Patient["status"];

export type PatientsResponse = {
  readonly items: readonly Patient[];
};

export type NewPatientForm = {
  fullName: string;
  birthDate: string;
  gender: PatientGender;
  nationalId: string;
  hospitalMrn: string;
  phone: string;
  address: string;
  managingOrganizationId: string;
};

export type PatientMergeForm = {
  targetPatientId: string;
  reason: string;
  confirmationText: string;
};

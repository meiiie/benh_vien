export type AdministrativeGender = "male" | "female" | "other" | "unknown";

export type PatientIdentifierType =
  | "national-id"
  | "insurance-id"
  | "hospital-mrn"
  | "legacy-id";

export type PatientRecordStatus = "active" | "merged" | "inactive";

export const administrativeGenders = new Set<AdministrativeGender>([
  "male",
  "female",
  "other",
  "unknown"
]);

export const patientIdentifierTypes = new Set<PatientIdentifierType>([
  "national-id",
  "insurance-id",
  "hospital-mrn",
  "legacy-id"
]);

export const patientRecordStatuses = new Set<PatientRecordStatus>([
  "active",
  "merged",
  "inactive"
]);

export type PatientIdentifier = {
  readonly system: string;
  readonly value: string;
  readonly type: PatientIdentifierType;
};

export type PatientSnapshot = {
  readonly id: string;
  readonly identifiers: readonly PatientIdentifier[];
  readonly fullName: string;
  readonly birthDate?: string;
  readonly gender: AdministrativeGender;
  readonly address?: string;
  readonly phone?: string;
  readonly managingOrganizationId: string;
  readonly status: PatientRecordStatus;
  readonly mergedIntoPatientId?: string;
  readonly mergedAt?: string;
  readonly mergedByActorId?: string;
  readonly mergeReason?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type RegisterPatientInput = {
  readonly id: string;
  readonly identifiers: readonly PatientIdentifier[];
  readonly fullName: string;
  readonly birthDate?: string;
  readonly gender?: AdministrativeGender;
  readonly address?: string;
  readonly phone?: string;
  readonly managingOrganizationId: string;
};

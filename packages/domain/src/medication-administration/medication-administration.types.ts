import type {
  MedicationCode,
  MedicationQuantity
} from "../medication-request/medication-request.types.js";

export type MedicationAdministrationStatus =
  | "in-progress"
  | "not-done"
  | "on-hold"
  | "completed"
  | "entered-in-error"
  | "stopped"
  | "unknown";

export type MedicationAdministrationCategory =
  | "inpatient"
  | "outpatient"
  | "community"
  | "patient-specified";

export type MedicationAdministrationPerformerActorType =
  | "Practitioner"
  | "PractitionerRole"
  | "Patient"
  | "RelatedPerson"
  | "Device";

export const medicationAdministrationStatuses = new Set<MedicationAdministrationStatus>([
  "in-progress",
  "not-done",
  "on-hold",
  "completed",
  "entered-in-error",
  "stopped",
  "unknown"
]);

export const medicationAdministrationCategories =
  new Set<MedicationAdministrationCategory>([
    "inpatient",
    "outpatient",
    "community",
    "patient-specified"
  ]);

export const medicationAdministrationPerformerActorTypes =
  new Set<MedicationAdministrationPerformerActorType>([
    "Practitioner",
    "PractitionerRole",
    "Patient",
    "RelatedPerson",
    "Device"
  ]);

export type MedicationAdministrationPerformer = {
  readonly actorType: MedicationAdministrationPerformerActorType;
  readonly actorId: string;
  readonly function?: MedicationCode;
};

export type MedicationAdministrationEffectivePeriod = {
  readonly start?: string;
  readonly end?: string;
};

export type MedicationAdministrationDosage = {
  readonly text?: string;
  readonly route?: MedicationCode;
  readonly doseQuantity?: MedicationQuantity;
};

export type MedicationAdministrationSnapshot = {
  readonly id: string;
  readonly patientId: string;
  readonly encounterId?: string;
  readonly medicationRequestId?: string;
  readonly reasonConditionId?: string;
  readonly status: MedicationAdministrationStatus;
  readonly statusReason?: MedicationCode;
  readonly category: MedicationAdministrationCategory;
  readonly medicationCode: MedicationCode;
  readonly effectivePeriod: MedicationAdministrationEffectivePeriod;
  readonly performers: readonly MedicationAdministrationPerformer[];
  readonly dosage?: MedicationAdministrationDosage;
  readonly note?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type RecordMedicationAdministrationInput = Omit<
  MedicationAdministrationSnapshot,
  "createdAt" | "updatedAt"
>;

import type {
  DosageInstruction,
  MedicationCode,
  MedicationQuantity
} from "../medication-request/medication-request.types.js";

export type MedicationDispenseStatus =
  | "preparation"
  | "in-progress"
  | "cancelled"
  | "on-hold"
  | "completed"
  | "entered-in-error"
  | "stopped"
  | "declined"
  | "unknown";

export type MedicationDispenseCategory =
  | "inpatient"
  | "outpatient"
  | "community"
  | "discharge";

export const medicationDispenseStatuses = new Set<MedicationDispenseStatus>([
  "preparation",
  "in-progress",
  "cancelled",
  "on-hold",
  "completed",
  "entered-in-error",
  "stopped",
  "declined",
  "unknown"
]);

export const medicationDispenseCategories = new Set<MedicationDispenseCategory>([
  "inpatient",
  "outpatient",
  "community",
  "discharge"
]);

export type MedicationDispenseSnapshot = {
  readonly id: string;
  readonly patientId: string;
  readonly encounterId?: string;
  readonly medicationRequestId?: string;
  readonly status: MedicationDispenseStatus;
  readonly statusReason?: MedicationCode;
  readonly category: MedicationDispenseCategory;
  readonly medicationCode: MedicationCode;
  readonly quantity?: MedicationQuantity;
  readonly daysSupply?: MedicationQuantity;
  readonly whenPrepared?: string;
  readonly whenHandedOver?: string;
  readonly dispenserPractitionerId?: string;
  readonly destinationLocationId?: string;
  readonly receiverPractitionerId?: string;
  readonly dosageInstruction?: DosageInstruction;
  readonly note?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type RecordMedicationDispenseInput = Omit<
  MedicationDispenseSnapshot,
  "createdAt" | "updatedAt"
>;

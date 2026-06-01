export type MedicationRequestStatus =
  | "active"
  | "on-hold"
  | "cancelled"
  | "completed"
  | "entered-in-error"
  | "stopped"
  | "draft"
  | "unknown";
export type MedicationRequestIntent =
  | "proposal"
  | "plan"
  | "order"
  | "original-order"
  | "reflex-order"
  | "filler-order"
  | "instance-order"
  | "option";
export type MedicationRequestCategory = "inpatient" | "outpatient" | "community" | "discharge";
export type MedicationRequestPriority = "routine" | "urgent" | "asap" | "stat";
export type MedicationTimingUnit = "h" | "d" | "wk";
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
export type MedicationDispenseCategory = "inpatient" | "outpatient" | "community" | "discharge";
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

export type MedicationCode = {
  readonly system: string;
  readonly code: string;
  readonly display: string;
};

export type MedicationQuantity = {
  readonly value: number;
  readonly unit: string;
  readonly system?: string;
  readonly code?: string;
};

export type DosageInstruction = {
  readonly text: string;
  readonly route?: string;
  readonly doseQuantity?: MedicationQuantity;
  readonly frequency?: number;
  readonly period?: number;
  readonly periodUnit?: MedicationTimingUnit;
};

export type MedicationRequest = {
  readonly id: string;
  readonly patientId: string;
  readonly encounterId?: string;
  readonly reasonConditionId?: string;
  readonly status: MedicationRequestStatus;
  readonly intent: MedicationRequestIntent;
  readonly category: MedicationRequestCategory;
  readonly priority: MedicationRequestPriority;
  readonly medicationCode: MedicationCode;
  readonly dosageInstruction: DosageInstruction;
  readonly authoredOn: string;
  readonly requesterPractitionerId: string;
  readonly expectedSupplyDurationDays?: number;
  readonly note?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type MedicationDispense = {
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

export type MedicationAdministration = {
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

export type MedicationRequestsResponse = {
  readonly items: readonly MedicationRequest[];
};

export type MedicationDispensesResponse = {
  readonly items: readonly MedicationDispense[];
};

export type MedicationAdministrationsResponse = {
  readonly items: readonly MedicationAdministration[];
};

export type NewMedicationRequestForm = {
  encounterId: string;
  reasonConditionId: string;
  category: MedicationRequestCategory;
  priority: MedicationRequestPriority;
  medicationSystem: string;
  medicationCode: string;
  medicationDisplay: string;
  dosageText: string;
  route: string;
  doseValue: string;
  doseUnit: string;
  frequency: string;
  period: string;
  periodUnit: MedicationTimingUnit;
  authoredOn: string;
  requesterPractitionerId: string;
  expectedSupplyDurationDays: string;
  note: string;
};

export type NewMedicationDispenseForm = {
  encounterId: string;
  medicationRequestId: string;
  category: MedicationDispenseCategory;
  medicationSystem: string;
  medicationCode: string;
  medicationDisplay: string;
  quantityValue: string;
  quantityUnit: string;
  daysSupplyValue: string;
  whenPrepared: string;
  whenHandedOver: string;
  dispenserPractitionerId: string;
  receiverPractitionerId: string;
  dosageText: string;
  route: string;
  doseValue: string;
  doseUnit: string;
  frequency: string;
  period: string;
  periodUnit: MedicationTimingUnit;
  note: string;
};

export type NewMedicationAdministrationForm = {
  encounterId: string;
  medicationRequestId: string;
  reasonConditionId: string;
  category: MedicationAdministrationCategory;
  medicationSystem: string;
  medicationCode: string;
  medicationDisplay: string;
  effectiveStart: string;
  performerActorType: MedicationAdministrationPerformerActorType;
  performerActorId: string;
  performerFunctionDisplay: string;
  dosageText: string;
  routeSystem: string;
  routeCode: string;
  routeDisplay: string;
  doseValue: string;
  doseUnit: string;
  note: string;
};

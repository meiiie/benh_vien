import { toApiDateTime } from "../../lib/clinicalFormatters.js";
import type {
  NewMedicationAdministrationForm,
  NewMedicationDispenseForm,
  NewMedicationRequestForm
} from "../../types/clinical.js";
import type {
  createMedicationAdministration,
  createMedicationDispense,
  createMedicationRequest
} from "./clinicalRecordApi.js";

type CreateMedicationRequestCommand = Parameters<typeof createMedicationRequest>[2];
type CreateMedicationDispenseCommand = Parameters<typeof createMedicationDispense>[2];
type CreateMedicationAdministrationCommand = Parameters<
  typeof createMedicationAdministration
>[2];

type MedicationRequestNumericValues = {
  readonly doseValue: number;
  readonly expectedSupplyDurationDays: number;
  readonly frequency: number;
  readonly period: number;
};

type MedicationDispenseNumericValues = {
  readonly daysSupplyValue: number;
  readonly doseValue: number;
  readonly frequency: number;
  readonly period: number;
  readonly quantityValue: number;
};

type MedicationAdministrationNumericValues = {
  readonly doseValue: number;
};

export function buildMedicationRequestCommand(
  form: NewMedicationRequestForm,
  {
    doseValue,
    expectedSupplyDurationDays,
    frequency,
    period
  }: MedicationRequestNumericValues
): CreateMedicationRequestCommand {
  return {
    encounterId: form.encounterId || undefined,
    reasonConditionId: form.reasonConditionId || undefined,
    category: form.category,
    priority: form.priority,
    medicationCode: {
      system: form.medicationSystem,
      code: form.medicationCode,
      display: form.medicationDisplay
    },
    dosageInstruction: {
      text: form.dosageText,
      route: form.route || undefined,
      doseQuantity: {
        value: doseValue,
        unit: form.doseUnit,
        system: "http://unitsofmeasure.org",
        code: form.doseUnit
      },
      frequency,
      period,
      periodUnit: form.periodUnit
    },
    authoredOn: form.authoredOn ? toApiDateTime(form.authoredOn) : undefined,
    requesterPractitionerId: form.requesterPractitionerId,
    expectedSupplyDurationDays: form.expectedSupplyDurationDays
      ? expectedSupplyDurationDays
      : undefined,
    note: form.note || undefined
  };
}

export function buildMedicationDispenseCommand(
  form: NewMedicationDispenseForm,
  {
    daysSupplyValue,
    doseValue,
    frequency,
    period,
    quantityValue
  }: MedicationDispenseNumericValues
): CreateMedicationDispenseCommand {
  return {
    encounterId: form.encounterId || undefined,
    medicationRequestId: form.medicationRequestId || undefined,
    status: "completed",
    category: form.category,
    medicationCode: {
      system: form.medicationSystem,
      code: form.medicationCode,
      display: form.medicationDisplay
    },
    quantity: {
      value: quantityValue,
      unit: form.quantityUnit,
      system: "http://unitsofmeasure.org",
      code: form.quantityUnit
    },
    daysSupply: {
      value: daysSupplyValue,
      unit: "ngày",
      system: "http://unitsofmeasure.org",
      code: "d"
    },
    whenPrepared: form.whenPrepared ? toApiDateTime(form.whenPrepared) : undefined,
    whenHandedOver: toApiDateTime(form.whenHandedOver),
    dispenserPractitionerId: form.dispenserPractitionerId || undefined,
    receiverPractitionerId: form.receiverPractitionerId || undefined,
    dosageInstruction: {
      text: form.dosageText,
      route: form.route || undefined,
      doseQuantity: {
        value: doseValue,
        unit: form.doseUnit,
        system: "http://unitsofmeasure.org",
        code: form.doseUnit
      },
      frequency,
      period,
      periodUnit: form.periodUnit
    },
    note: form.note || undefined
  };
}

export function buildMedicationAdministrationCommand(
  form: NewMedicationAdministrationForm,
  { doseValue }: MedicationAdministrationNumericValues
): CreateMedicationAdministrationCommand {
  return {
    encounterId: form.encounterId || undefined,
    medicationRequestId: form.medicationRequestId || undefined,
    reasonConditionId: form.reasonConditionId || undefined,
    status: "completed",
    category: form.category,
    medicationCode: {
      system: form.medicationSystem,
      code: form.medicationCode,
      display: form.medicationDisplay
    },
    effectivePeriod: {
      start: toApiDateTime(form.effectiveStart)
    },
    performers: [
      {
        actorType: form.performerActorType,
        actorId: form.performerActorId,
        function: form.performerFunctionDisplay
          ? {
              system: "urn:wiiicare:nexus:medication-admin-performer-function",
              code: "medication-administration-recorder",
              display: form.performerFunctionDisplay
            }
          : undefined
      }
    ],
    dosage: {
      text: form.dosageText || undefined,
      route: form.routeCode
        ? {
            system: form.routeSystem,
            code: form.routeCode,
            display: form.routeDisplay
          }
        : undefined,
      doseQuantity: {
        value: doseValue,
        unit: form.doseUnit,
        system: "http://unitsofmeasure.org",
        code: form.doseUnit
      }
    },
    note: form.note || undefined
  };
}

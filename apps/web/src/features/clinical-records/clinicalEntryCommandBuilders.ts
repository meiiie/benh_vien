import { toApiDateTime } from "../../lib/clinicalFormatters.js";
import type {
  NewAllergyIntoleranceForm,
  NewConditionForm,
  NewEncounterForm,
  NewObservationForm
} from "../../types/clinical.js";
import type {
  createAllergyIntolerance,
  createCondition,
  createEncounter,
  createObservation
} from "./clinicalRecordApi.js";

type CreateEncounterCommand = Parameters<typeof createEncounter>[2];
type CreateAllergyIntoleranceCommand = Parameters<
  typeof createAllergyIntolerance
>[2];
type CreateConditionCommand = Parameters<typeof createCondition>[2];
type CreateObservationCommand = Parameters<typeof createObservation>[2];

type ObservationNumericValues = {
  readonly numericValue: number;
};

export function buildEncounterCommand(form: NewEncounterForm): CreateEncounterCommand {
  return {
    class: form.class,
    serviceType: form.serviceType,
    reasonText: form.reasonText,
    departmentId: form.departmentId || undefined,
    attendingPractitionerId: form.attendingPractitionerId,
    startedAt: toApiDateTime(form.startedAt)
  };
}

export function buildAllergyIntoleranceCommand(
  form: NewAllergyIntoleranceForm
): CreateAllergyIntoleranceCommand {
  const hasReaction =
    form.manifestationCode.trim() ||
    form.manifestationDisplay.trim() ||
    form.reactionDescription.trim();

  return {
    encounterId: form.encounterId || undefined,
    clinicalStatus: form.clinicalStatus,
    verificationStatus: form.verificationStatus,
    type: form.type,
    category: form.category,
    criticality: form.criticality || undefined,
    code: {
      system: form.codeSystem,
      code: form.code,
      display: form.codeDisplay
    },
    reaction: hasReaction
      ? {
          manifestation: {
            system: form.manifestationSystem,
            code: form.manifestationCode,
            display: form.manifestationDisplay
          },
          severity: form.reactionSeverity || undefined,
          description: form.reactionDescription || undefined
        }
      : undefined,
    recordedAt: form.recordedAt ? toApiDateTime(form.recordedAt) : undefined,
    recorderPractitionerId: form.recorderPractitionerId,
    note: form.note || undefined
  };
}

export function buildConditionCommand(form: NewConditionForm): CreateConditionCommand {
  return {
    encounterId: form.encounterId || undefined,
    clinicalStatus: form.clinicalStatus,
    verificationStatus: form.verificationStatus,
    category: form.category,
    code: {
      system: form.codeSystem,
      code: form.code,
      display: form.codeDisplay
    },
    severity: form.severity || undefined,
    onsetAt: form.onsetAt ? toApiDateTime(form.onsetAt) : undefined,
    recorderPractitionerId: form.recorderPractitionerId,
    note: form.note || undefined
  };
}

export function buildObservationCommand(
  form: NewObservationForm,
  { numericValue }: ObservationNumericValues
): CreateObservationCommand {
  return {
    encounterId: form.encounterId || undefined,
    category: form.category,
    code: {
      system: form.codeSystem,
      code: form.code,
      display: form.codeDisplay
    },
    effectiveAt: toApiDateTime(form.effectiveAt),
    valueQuantity: {
      value: numericValue,
      unit: form.unit,
      system: form.unitSystem || undefined,
      code: form.unitCode || undefined
    },
    performerPractitionerId: form.performerPractitionerId || undefined
  };
}

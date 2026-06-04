import { toApiDateTime } from "../../lib/clinicalFormatters.js";
import type { CommandDraft } from "../../lib/commandDrafts.js";
import {
  parseOptionalPositiveNumber,
  parsePositiveNumber
} from "../../lib/commandDrafts.js";
import type { NewMedicationRequestForm } from "../../types/medications.js";
import type { createMedicationRequest } from "./clinicalRecordApi.js";

type CreateMedicationRequestCommand = Parameters<typeof createMedicationRequest>[2];

type MedicationRequestNumericValues = {
  readonly doseValue: number;
  readonly expectedSupplyDurationDays?: number;
  readonly frequency: number;
  readonly period: number;
};

export function buildMedicationRequestCommandDraft(
  form: NewMedicationRequestForm
): CommandDraft<CreateMedicationRequestCommand> {
  const doseValue = parsePositiveNumber(
    form.doseValue,
    "Liều lượng thuốc phải là số lớn hơn 0."
  );
  if (!doseValue.ok) {
    return doseValue;
  }

  const frequency = parsePositiveNumber(
    form.frequency,
    "Nhịp dùng thuốc phải có tần suất và chu kỳ lớn hơn 0."
  );
  if (!frequency.ok) {
    return frequency;
  }

  const period = parsePositiveNumber(
    form.period,
    "Nhịp dùng thuốc phải có tần suất và chu kỳ lớn hơn 0."
  );
  if (!period.ok) {
    return period;
  }

  const expectedSupplyDurationDays = parseOptionalPositiveNumber(
    form.expectedSupplyDurationDays,
    "Số ngày cấp thuốc phải là số lớn hơn 0."
  );
  if (!expectedSupplyDurationDays.ok) {
    return expectedSupplyDurationDays;
  }

  return {
    ok: true,
    command: buildMedicationRequestCommand(form, {
      doseValue: doseValue.value,
      expectedSupplyDurationDays: expectedSupplyDurationDays.value,
      frequency: frequency.value,
      period: period.value
    })
  };
}

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
    expectedSupplyDurationDays,
    note: form.note || undefined
  };
}

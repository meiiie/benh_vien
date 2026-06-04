import { toApiDateTime } from "../../lib/clinicalFormatters.js";
import type { CommandDraft } from "../../lib/commandDrafts.js";
import { parsePositiveNumber } from "../../lib/commandDrafts.js";
import type { NewMedicationDispenseForm } from "../../types/medications.js";
import type { createMedicationDispense } from "./clinicalRecordApi.js";

type CreateMedicationDispenseCommand = Parameters<typeof createMedicationDispense>[2];

type MedicationDispenseNumericValues = {
  readonly daysSupplyValue: number;
  readonly doseValue: number;
  readonly frequency: number;
  readonly period: number;
  readonly quantityValue: number;
};

export function buildMedicationDispenseCommandDraft(
  form: NewMedicationDispenseForm
): CommandDraft<CreateMedicationDispenseCommand> {
  const quantityValue = parsePositiveNumber(
    form.quantityValue,
    "Số lượng thuốc cấp phát phải là số lớn hơn 0."
  );
  if (!quantityValue.ok) {
    return quantityValue;
  }

  const daysSupplyValue = parsePositiveNumber(
    form.daysSupplyValue,
    "Số ngày cấp thuốc phải là số lớn hơn 0."
  );
  if (!daysSupplyValue.ok) {
    return daysSupplyValue;
  }

  const doseValue = parsePositiveNumber(
    form.doseValue,
    "Liều hướng dẫn sau cấp phát phải là số lớn hơn 0."
  );
  if (!doseValue.ok) {
    return doseValue;
  }

  const frequency = parsePositiveNumber(
    form.frequency,
    "Nhịp dùng thuốc sau cấp phát phải có tần suất và chu kỳ lớn hơn 0."
  );
  if (!frequency.ok) {
    return frequency;
  }

  const period = parsePositiveNumber(
    form.period,
    "Nhịp dùng thuốc sau cấp phát phải có tần suất và chu kỳ lớn hơn 0."
  );
  if (!period.ok) {
    return period;
  }

  if (!form.whenHandedOver) {
    return {
      ok: false,
      message:
        "Cần nhập thời điểm bàn giao thuốc khi trạng thái là đã hoàn tất."
    };
  }

  return {
    ok: true,
    command: buildMedicationDispenseCommand(form, {
      daysSupplyValue: daysSupplyValue.value,
      doseValue: doseValue.value,
      frequency: frequency.value,
      period: period.value,
      quantityValue: quantityValue.value
    })
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
    whenPrepared: form.whenPrepared
      ? toApiDateTime(form.whenPrepared)
      : undefined,
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

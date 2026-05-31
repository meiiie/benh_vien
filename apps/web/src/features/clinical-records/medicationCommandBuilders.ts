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
import type { CommandDraft } from "./clinicalRecordCommandDrafts.js";
import {
  parseOptionalPositiveNumber,
  parsePositiveNumber
} from "./clinicalRecordCommandDrafts.js";

type CreateMedicationRequestCommand = Parameters<typeof createMedicationRequest>[2];
type CreateMedicationDispenseCommand = Parameters<typeof createMedicationDispense>[2];
type CreateMedicationAdministrationCommand = Parameters<
  typeof createMedicationAdministration
>[2];

type MedicationRequestNumericValues = {
  readonly doseValue: number;
  readonly expectedSupplyDurationDays?: number;
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
      message: "Cần nhập thời điểm bàn giao thuốc khi trạng thái là đã hoàn tất."
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

export function buildMedicationAdministrationCommandDraft(
  form: NewMedicationAdministrationForm
): CommandDraft<CreateMedicationAdministrationCommand> {
  const doseValue = parsePositiveNumber(
    form.doseValue,
    "Liều dùng thực tế phải là số lớn hơn 0."
  );
  if (!doseValue.ok) {
    return doseValue;
  }

  if (!form.effectiveStart) {
    return {
      ok: false,
      message: "Cần nhập thời điểm dùng thuốc thực tế."
    };
  }

  if (!form.performerActorId.trim()) {
    return {
      ok: false,
      message: "Cần nhập người hoặc thiết bị xác nhận dùng thuốc."
    };
  }

  return {
    ok: true,
    command: buildMedicationAdministrationCommand(form, {
      doseValue: doseValue.value
    })
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

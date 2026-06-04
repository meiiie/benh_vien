import { toApiDateTime } from "../../lib/clinicalFormatters.js";
import type { CommandDraft } from "../../lib/commandDrafts.js";
import { parsePositiveNumber } from "../../lib/commandDrafts.js";
import type { NewMedicationAdministrationForm } from "../../types/medications.js";
import type { createMedicationAdministration } from "./clinicalRecordApi.js";

type CreateMedicationAdministrationCommand = Parameters<
  typeof createMedicationAdministration
>[2];

type MedicationAdministrationNumericValues = {
  readonly doseValue: number;
};

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

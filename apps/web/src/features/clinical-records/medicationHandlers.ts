import { buildMedicationAdministrationHandlers } from "./medicationAdministrationHandlers.js";
import { buildMedicationDispenseHandlers } from "./medicationDispenseHandlers.js";
import type {
  MedicationHandlerConfig,
  MedicationHandlers
} from "./medicationHandlerTypes.js";
import { buildMedicationRequestHandlers } from "./medicationRequestHandlers.js";

export function buildMedicationHandlers(
  config: MedicationHandlerConfig
): MedicationHandlers {
  const ensureSelectedWritablePatient = (emptyMessage: string) => {
    if (!config.selectedPatient) {
      config.setStatusMessage(emptyMessage);
      return undefined;
    }

    if (!config.ensureSelectedPatientWritable()) {
      return undefined;
    }

    return config.selectedPatient;
  };

  return {
    ...buildMedicationRequestHandlers({
      ...config,
      ensureSelectedWritablePatient
    }),
    ...buildMedicationDispenseHandlers({
      ...config,
      ensureSelectedWritablePatient
    }),
    ...buildMedicationAdministrationHandlers({
      ...config,
      ensureSelectedWritablePatient
    })
  };
}

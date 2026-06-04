import { buildAllergyIntoleranceHandlers } from "./allergyIntoleranceHandlers.js";
import type {
  ClinicalEntryHandlerConfig,
  ClinicalEntryHandlers
} from "./clinicalEntryHandlerTypes.js";
import { buildConditionHandlers } from "./conditionHandlers.js";
import { buildObservationHandlers } from "./observationHandlers.js";

export function buildClinicalEntryHandlers(
  config: ClinicalEntryHandlerConfig
): ClinicalEntryHandlers {
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
    ...buildAllergyIntoleranceHandlers({
      ...config,
      ensureSelectedWritablePatient
    }),
    ...buildConditionHandlers({
      ...config,
      ensureSelectedWritablePatient
    }),
    ...buildObservationHandlers({
      ...config,
      ensureSelectedWritablePatient
    })
  };
}

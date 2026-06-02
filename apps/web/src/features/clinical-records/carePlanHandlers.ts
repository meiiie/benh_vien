import { buildCareWorkflowHandlers } from "./careWorkflowHandlers.js";
import { buildDiagnosticResultHandlers } from "./diagnosticResultHandlers.js";
import type {
  CarePlanHandlerConfig,
  CarePlanHandlers
} from "./carePlanHandlerTypes.js";

export function buildCarePlanHandlers(
  config: CarePlanHandlerConfig
): CarePlanHandlers {
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
    ...buildDiagnosticResultHandlers({
      ...config,
      ensureSelectedWritablePatient
    }),
    ...buildCareWorkflowHandlers({
      ...config,
      ensureSelectedWritablePatient
    })
  };
}

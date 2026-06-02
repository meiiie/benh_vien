import { buildClinicalRecordCorePanelRenderers } from "./clinicalRecordCorePanelRenderers.js";
import { buildClinicalRecordDiagnosticPanelRenderers } from "./clinicalRecordDiagnosticPanelRenderers.js";
import { buildClinicalRecordMedicationPanelRenderers } from "./clinicalRecordMedicationPanelRenderers.js";
import type {
  BuildClinicalRecordPanelRenderersOptions,
  ClinicalRecordPanelRenderers
} from "./clinicalRecordPanelRendererTypes.js";

export type { ClinicalRecordPanelRenderers } from "./clinicalRecordPanelRendererTypes.js";

export function buildClinicalRecordPanelRenderers(
  options: BuildClinicalRecordPanelRenderersOptions
): ClinicalRecordPanelRenderers {
  return {
    ...buildClinicalRecordCorePanelRenderers(options),
    ...buildClinicalRecordDiagnosticPanelRenderers(options),
    ...buildClinicalRecordMedicationPanelRenderers(options)
  };
}

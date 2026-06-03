import { useSelectedClinicalResourceFhirPreviewEffects } from "./selectedClinicalResourceFhirPreviewEffects.js";
import { useSelectedDocumentFhirPreviewEffect } from "./selectedDocumentFhirPreviewEffect.js";
import type { SelectedFhirPreviewEffectsConfig } from "./selectedFhirPreviewEffectTypes.js";
import { useSelectedRecordTransferFhirPreviewEffect } from "./selectedRecordTransferFhirPreviewEffect.js";

export type { SelectedFhirPreviewEffectsConfig } from "./selectedFhirPreviewEffectTypes.js";

export function useSelectedFhirPreviewEffects(
  config: SelectedFhirPreviewEffectsConfig
) {
  useSelectedDocumentFhirPreviewEffect(config);
  useSelectedClinicalResourceFhirPreviewEffects(config);
  useSelectedRecordTransferFhirPreviewEffect(config);
}

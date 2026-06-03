import { useEffect } from "react";
import type { SelectedFhirPreviewEffectsConfig } from "./selectedFhirPreviewEffectTypes.js";

export function useSelectedRecordTransferFhirPreviewEffect(
  config: SelectedFhirPreviewEffectsConfig
) {
  useEffect(() => {
    if (!config.selectedRecordTransferId) {
      clearRecordTransferPreview(config);
      return;
    }

    if (
      !config.recordTransfers.some(
        (recordTransfer) => recordTransfer.id === config.selectedRecordTransferId
      )
    ) {
      clearRecordTransferPreview(config);
      return;
    }

    void config.loadRecordTransferFhirTaskPreview(config.selectedRecordTransferId);
    void config.loadRecordTransferDeliveryAttempts(config.selectedRecordTransferId);
  }, [config.selectedRecordTransferId, config.recordTransfers]);
}

function clearRecordTransferPreview(config: SelectedFhirPreviewEffectsConfig) {
  config.setRecordTransferFhirTaskPreview(undefined);
  config.setRecordTransferDeliveryAttempts([]);
  config.setRecordTransferDeliveryAttemptWarning(undefined);
  config.setIsLoadingRecordTransferDeliveryAttempts(false);
}

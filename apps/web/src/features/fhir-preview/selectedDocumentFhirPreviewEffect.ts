import { useEffect } from "react";
import type { SelectedFhirPreviewEffectsConfig } from "./selectedFhirPreviewEffectTypes.js";

export function useSelectedDocumentFhirPreviewEffect(
  config: SelectedFhirPreviewEffectsConfig
) {
  useEffect(() => {
    if (!config.selectedDocumentId) {
      config.setDocumentFhirPreview(undefined);
      config.setDocumentProvenanceFhirPreview(undefined);
      return;
    }

    void config.loadDocumentFhirPreview(config.selectedDocumentId);
    if (config.selectedDocumentStatus === "signed") {
      void config.loadDocumentProvenanceFhirPreview(config.selectedDocumentId);
      return;
    }

    config.setDocumentProvenanceFhirPreview({
      note: "FHIR Provenance chỉ được xuất khi tài liệu đã ký/xác nhận."
    });
  }, [config.selectedDocumentId, config.selectedDocumentStatus]);
}

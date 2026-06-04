import { useEffect } from "react";

type SelectedPreviewConfig = {
  readonly clearPreview: (preview: unknown) => void;
  readonly loadPreview: (id: string) => Promise<void>;
  readonly selectedId: string | undefined;
};

export function useSelectedPreview(config: SelectedPreviewConfig) {
  useEffect(() => {
    if (!config.selectedId) {
      config.clearPreview(undefined);
      return;
    }

    void config.loadPreview(config.selectedId);
  }, [config.selectedId]);
}

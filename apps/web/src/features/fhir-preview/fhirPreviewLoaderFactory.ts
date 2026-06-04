import type { ClinicalApiClient } from "../../api/clinicalApi.js";
import { loadFhirPreview } from "../../lib/fhirPreviewLoader.js";

export type SetPreview = (preview: unknown) => void;

export type FhirPreviewExport<TId extends readonly unknown[]> = (
  clinicalApi: ClinicalApiClient,
  ...args: TId
) => Promise<unknown>;

type FhirPreviewLoaderOptions<TId extends readonly unknown[]> = {
  readonly clinicalApi: ClinicalApiClient;
  readonly errorMessage: string;
  readonly exportPreview: FhirPreviewExport<TId>;
  readonly setPreview: SetPreview;
};

export function createFhirPreviewLoader<TId extends readonly unknown[]>({
  clinicalApi,
  errorMessage,
  exportPreview,
  setPreview
}: FhirPreviewLoaderOptions<TId>) {
  return (...args: TId) =>
    loadFhirPreview({
      errorMessage,
      exportPreview: () => exportPreview(clinicalApi, ...args),
      setPreview
    });
}

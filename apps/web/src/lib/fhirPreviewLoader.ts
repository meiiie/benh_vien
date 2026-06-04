type SetFhirPreview = (preview: unknown) => void;

type LoadFhirPreviewOptions = {
  readonly errorMessage: string;
  readonly exportPreview: () => Promise<unknown>;
  readonly setPreview: SetFhirPreview;
};

export async function loadFhirPreview({
  errorMessage,
  exportPreview,
  setPreview
}: LoadFhirPreviewOptions) {
  try {
    setPreview(await exportPreview());
  } catch (error) {
    setPreview({
      error:
        error instanceof Error
          ? `${errorMessage}: ${error.message}`
          : `${errorMessage}.`
    });
  }
}

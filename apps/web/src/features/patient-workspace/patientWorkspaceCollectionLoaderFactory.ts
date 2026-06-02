import type { ClinicalApiClient } from "../../api/clinicalApi.js";
import { loadPatientScopedCollection } from "../../lib/patientScopedCollectionLoader.js";

type IdentifiedItem = {
  readonly id: string;
};

type CollectionResponse<Item extends IdentifiedItem> = {
  readonly items: readonly Item[];
};

type CreatePatientWorkspaceCollectionLoaderOptions<Item extends IdentifiedItem> = {
  readonly clinicalApi: ClinicalApiClient;
  readonly errorMessage: string;
  readonly listItems: (
    api: ClinicalApiClient,
    patientId: string
  ) => Promise<CollectionResponse<Item>>;
  readonly setItems: (items: readonly Item[]) => void;
  readonly setLoading: (isLoading: boolean) => void;
  readonly setSelectedId: (id: string | undefined) => void;
  readonly setStatusMessage: (message: string) => void;
};

export function createPatientWorkspaceCollectionLoader<
  Item extends IdentifiedItem
>({
  clinicalApi,
  errorMessage,
  listItems,
  setItems,
  setLoading,
  setSelectedId,
  setStatusMessage
}: CreatePatientWorkspaceCollectionLoaderOptions<Item>) {
  return (patientId: string, nextSelectedId?: string) =>
    loadPatientScopedCollection({
      errorMessage,
      listItems: () => listItems(clinicalApi, patientId),
      nextSelectedId,
      setItems,
      setLoading,
      setSelectedId,
      setStatusMessage
    });
}

type IdentifiedItem = {
  readonly id: string;
};

type CollectionResponse<Item extends IdentifiedItem> = {
  readonly items: readonly Item[];
};

type LoadPatientScopedCollectionOptions<Item extends IdentifiedItem> = {
  readonly errorMessage: string;
  readonly listItems: () => Promise<CollectionResponse<Item>>;
  readonly nextSelectedId?: string;
  readonly setItems: (items: readonly Item[]) => void;
  readonly setLoading: (isLoading: boolean) => void;
  readonly setSelectedId: (id: string | undefined) => void;
  readonly setStatusMessage: (message: string) => void;
};

export async function loadPatientScopedCollection<Item extends IdentifiedItem>({
  errorMessage,
  listItems,
  nextSelectedId,
  setItems,
  setLoading,
  setSelectedId,
  setStatusMessage
}: LoadPatientScopedCollectionOptions<Item>) {
  setLoading(true);

  try {
    const data = await listItems();
    setItems(data.items);
    setSelectedId(nextSelectedId ?? data.items[0]?.id);
  } catch (error) {
    setItems([]);
    setSelectedId(undefined);
    setStatusMessage(
      error instanceof Error ? `${errorMessage}: ${error.message}` : `${errorMessage}.`
    );
  } finally {
    setLoading(false);
  }
}

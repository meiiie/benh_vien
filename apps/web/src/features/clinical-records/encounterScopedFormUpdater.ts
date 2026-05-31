type EncounterScopedForm = {
  readonly encounterId: string;
};

export type EncounterScopedFormUpdater = <T extends EncounterScopedForm>(
  current: T
) => T;

export function buildEncounterScopedFormUpdater(
  encounterId: string | undefined
): EncounterScopedFormUpdater {
  const nextEncounterId = encounterId ?? "";

  return <T extends EncounterScopedForm>(current: T): T => ({
    ...current,
    encounterId: nextEncounterId
  });
}

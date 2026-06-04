export type TrackRepository = <Repository>(repository: Repository) => Repository;

type ClosableRepository = {
  close(): Promise<void>;
};

export function createRepositoryLifecycle(): {
  readonly track: TrackRepository;
  close(): Promise<void>;
} {
  const managedRepositories: ClosableRepository[] = [];

  return {
    track<Repository>(repository: Repository): Repository {
      if (isClosableRepository(repository)) {
        managedRepositories.push(repository);
      }

      return repository;
    },
    async close() {
      for (const repository of [...managedRepositories].reverse()) {
        await repository.close();
      }
    }
  };
}

function isClosableRepository(repository: unknown): repository is ClosableRepository {
  return (
    typeof repository === "object" &&
    repository !== null &&
    "close" in repository &&
    typeof (repository as { readonly close?: unknown }).close === "function"
  );
}

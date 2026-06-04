import { ProviderDirectory } from "@benh-vien-so/domain";
import type { ProviderDirectoryRepository } from "@benh-vien-so/domain";

import { createSeedProviderDirectory } from "./provider-directory-seed.js";

export class InMemoryProviderDirectoryRepository implements ProviderDirectoryRepository {
  private directory: ProviderDirectory;

  constructor(seedDirectory: ProviderDirectory = createSeedProviderDirectory()) {
    this.directory = cloneDirectory(seedDirectory);
  }

  async findDirectory(): Promise<ProviderDirectory> {
    return cloneDirectory(this.directory);
  }

  async save(directory: ProviderDirectory): Promise<void> {
    this.directory = cloneDirectory(directory);
  }
}

function cloneDirectory(directory: ProviderDirectory): ProviderDirectory {
  return ProviderDirectory.rehydrate(directory.toSnapshot());
}

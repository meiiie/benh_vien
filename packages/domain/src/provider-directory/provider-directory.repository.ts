import type { ProviderDirectory } from "./provider-directory.js";

export interface ProviderDirectoryRepository {
  findDirectory(): Promise<ProviderDirectory>;
  save(directory: ProviderDirectory): Promise<void>;
}

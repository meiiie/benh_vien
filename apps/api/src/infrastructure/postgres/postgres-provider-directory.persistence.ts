import type { ProviderDirectory } from "@benh-vien-so/domain";
import { providerDirectoryToResourceWrites } from "./postgres-provider-directory.mapper.js";
import {
  deleteProviderDirectoryResourcesSql,
  upsertProviderDirectoryResourceSql
} from "./postgres-provider-directory.sql.js";
import type { ProviderDirectoryQueryable } from "./postgres-provider-directory.types.js";

export async function replaceProviderDirectoryResources(
  queryable: ProviderDirectoryQueryable,
  directory: ProviderDirectory
): Promise<void> {
  await queryable.query(deleteProviderDirectoryResourcesSql);

  for (const resource of providerDirectoryToResourceWrites(directory)) {
    await queryable.query(upsertProviderDirectoryResourceSql, [
      resource.resourceType,
      resource.id,
      JSON.stringify(resource.snapshot)
    ]);
  }
}

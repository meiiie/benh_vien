import pg from "pg";
import { createPostgresRepositoryPool } from "./postgres-pool.js";
import type { ProviderDirectory, ProviderDirectoryRepository } from "@benh-vien-so/domain";
import { rowToProviderDirectory } from "./postgres-provider-directory.mapper.js";
import { replaceProviderDirectoryResources } from "./postgres-provider-directory.persistence.js";
import { selectProviderDirectoryResourcesSql } from "./postgres-provider-directory.sql.js";
import type { ProviderDirectoryResourceRow } from "./postgres-provider-directory.types.js";

export class PostgresProviderDirectoryRepository implements ProviderDirectoryRepository {
  private readonly pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = createPostgresRepositoryPool(connectionString);
  }

  async findDirectory(): Promise<ProviderDirectory> {
    const result = await this.pool.query<ProviderDirectoryResourceRow>(
      selectProviderDirectoryResourcesSql
    );

    return rowToProviderDirectory(result.rows);
  }

  async save(directory: ProviderDirectory): Promise<void> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");
      await replaceProviderDirectoryResources(client, directory);
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

export async function seedProviderDirectoryIfEmpty(
  repository: ProviderDirectoryRepository,
  seedDirectory: ProviderDirectory
): Promise<void> {
  const directory = await repository.findDirectory();

  if (directory.toSnapshot().organizations.length > 0) {
    return;
  }

  await repository.save(seedDirectory);
}

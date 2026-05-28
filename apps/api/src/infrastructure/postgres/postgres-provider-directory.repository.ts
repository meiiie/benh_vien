import pg from "pg";
import { createPostgresRepositoryPool } from "./postgres-pool.js";
import { ProviderDirectory } from "@benh-vien-so/domain";
import type {
  ProviderDirectoryRepository,
  ProviderDirectorySnapshot,
  ProviderEndpointSnapshot,
  ProviderOrganizationSnapshot,
  ProviderPractitionerRoleSnapshot,
  ProviderPractitionerSnapshot
} from "@benh-vien-so/domain";

type ProviderDirectoryResourceType =
  | "Organization"
  | "Practitioner"
  | "PractitionerRole"
  | "Endpoint";

type ProviderDirectoryResourceRow = {
  resource_type: ProviderDirectoryResourceType;
  id: string;
  snapshot: unknown;
};

export class PostgresProviderDirectoryRepository implements ProviderDirectoryRepository {
  private readonly pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = createPostgresRepositoryPool(connectionString);
  }

  async findDirectory(): Promise<ProviderDirectory> {
    const result = await this.pool.query<ProviderDirectoryResourceRow>(
      `SELECT resource_type, id, snapshot
      FROM provider_directory_resources
      ORDER BY resource_type, id`
    );

    const snapshot: ProviderDirectorySnapshot = {
      organizations: result.rows
        .filter((row) => row.resource_type === "Organization")
        .map((row) => row.snapshot as ProviderOrganizationSnapshot),
      practitioners: result.rows
        .filter((row) => row.resource_type === "Practitioner")
        .map((row) => row.snapshot as ProviderPractitionerSnapshot),
      practitionerRoles: result.rows
        .filter((row) => row.resource_type === "PractitionerRole")
        .map((row) => row.snapshot as ProviderPractitionerRoleSnapshot),
      endpoints: result.rows
        .filter((row) => row.resource_type === "Endpoint")
        .map((row) => row.snapshot as ProviderEndpointSnapshot),
      generatedAt: new Date().toISOString()
    };

    return ProviderDirectory.rehydrate(snapshot);
  }

  async save(directory: ProviderDirectory): Promise<void> {
    const snapshot = directory.toSnapshot();
    const resources: readonly {
      readonly resourceType: ProviderDirectoryResourceType;
      readonly id: string;
      readonly snapshot: unknown;
    }[] = [
      ...snapshot.organizations.map((organization) => ({
        resourceType: "Organization" as const,
        id: organization.id,
        snapshot: organization
      })),
      ...snapshot.practitioners.map((practitioner) => ({
        resourceType: "Practitioner" as const,
        id: practitioner.id,
        snapshot: practitioner
      })),
      ...snapshot.practitionerRoles.map((role) => ({
        resourceType: "PractitionerRole" as const,
        id: role.id,
        snapshot: role
      })),
      ...snapshot.endpoints.map((endpoint) => ({
        resourceType: "Endpoint" as const,
        id: endpoint.id,
        snapshot: endpoint
      }))
    ];

    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");
      await client.query("DELETE FROM provider_directory_resources");

      for (const resource of resources) {
        await client.query(
          `INSERT INTO provider_directory_resources (resource_type, id, snapshot, updated_at)
          VALUES ($1, $2, $3::jsonb, now())
          ON CONFLICT (resource_type, id) DO UPDATE SET
            snapshot = EXCLUDED.snapshot,
            updated_at = EXCLUDED.updated_at`,
          [resource.resourceType, resource.id, JSON.stringify(resource.snapshot)]
        );
      }

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

import type pg from "pg";

export type ProviderDirectoryResourceType =
  | "Organization"
  | "Practitioner"
  | "PractitionerRole"
  | "Endpoint";

export type ProviderDirectoryResourceRow = {
  resource_type: ProviderDirectoryResourceType;
  id: string;
  snapshot: unknown;
};

export type ProviderDirectoryResourceWrite = {
  readonly resourceType: ProviderDirectoryResourceType;
  readonly id: string;
  readonly snapshot: unknown;
};

export type ProviderDirectoryQueryable = Pick<pg.Pool | pg.PoolClient, "query">;

export const selectProviderDirectoryResourcesSql = `SELECT resource_type, id, snapshot
  FROM provider_directory_resources
  ORDER BY resource_type, id`;

export const deleteProviderDirectoryResourcesSql = `DELETE FROM provider_directory_resources`;

export const upsertProviderDirectoryResourceSql = `INSERT INTO provider_directory_resources (
  resource_type,
  id,
  snapshot,
  updated_at
)
VALUES ($1, $2, $3::jsonb, now())
ON CONFLICT (resource_type, id) DO UPDATE SET
  snapshot = EXCLUDED.snapshot,
  updated_at = EXCLUDED.updated_at`;

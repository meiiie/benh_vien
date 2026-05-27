CREATE TABLE IF NOT EXISTS provider_directory_resources (
  resource_type text NOT NULL CHECK (
    resource_type IN ('Organization', 'Practitioner', 'PractitionerRole', 'Endpoint')
  ),
  id text NOT NULL,
  snapshot jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (resource_type, id),
  CONSTRAINT provider_directory_snapshot_object CHECK (jsonb_typeof(snapshot) = 'object')
);

CREATE INDEX IF NOT EXISTS idx_provider_directory_resources_type
  ON provider_directory_resources (resource_type);

CREATE INDEX IF NOT EXISTS idx_provider_directory_resources_snapshot_gin
  ON provider_directory_resources USING gin (snapshot jsonb_path_ops);

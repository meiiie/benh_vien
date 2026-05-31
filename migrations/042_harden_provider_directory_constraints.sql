ALTER TABLE provider_directory_resources
  ADD CONSTRAINT provider_directory_resources_required_text_not_blank
  CHECK (
    length(trim(id)) > 0
    AND COALESCE(length(trim(snapshot ->> 'id')), 0) > 0
    AND snapshot ->> 'id' = id
  )
  NOT VALID;

ALTER TABLE provider_directory_resources
  VALIDATE CONSTRAINT provider_directory_resources_required_text_not_blank;

ALTER TABLE provider_directory_resources
  ADD CONSTRAINT provider_directory_resources_persistence_timeline
  CHECK (
    snapshot ? 'createdAt'
    AND snapshot ? 'updatedAt'
    AND (snapshot ->> 'updatedAt')::timestamptz >= (snapshot ->> 'createdAt')::timestamptz
  )
  NOT VALID;

ALTER TABLE provider_directory_resources
  VALIDATE CONSTRAINT provider_directory_resources_persistence_timeline;

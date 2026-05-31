ALTER TABLE observations
  ADD CONSTRAINT observations_required_text_not_blank
  CHECK (
    length(trim(id)) > 0
    AND length(trim(patient_id)) > 0
    AND (
      encounter_id IS NULL
      OR length(trim(encounter_id)) > 0
    )
    AND (
      performer_practitioner_id IS NULL
      OR length(trim(performer_practitioner_id)) > 0
    )
    AND (
      value_text IS NULL
      OR length(trim(value_text)) > 0
    )
  )
  NOT VALID;

ALTER TABLE observations
  VALIDATE CONSTRAINT observations_required_text_not_blank;

ALTER TABLE observations
  ADD CONSTRAINT observations_code_shape
  CHECK (
    jsonb_typeof(code) = 'object'
    AND COALESCE(length(trim(code ->> 'system')), 0) > 0
    AND COALESCE(length(trim(code ->> 'code')), 0) > 0
    AND COALESCE(length(trim(code ->> 'display')), 0) > 0
  )
  NOT VALID;

ALTER TABLE observations
  VALIDATE CONSTRAINT observations_code_shape;

ALTER TABLE observations
  ADD CONSTRAINT observations_quantity_shape
  CHECK (
    value_quantity IS NULL
    OR (
      jsonb_typeof(value_quantity) = 'object'
      AND jsonb_typeof(value_quantity -> 'value') = 'number'
      AND COALESCE(length(trim(value_quantity ->> 'unit')), 0) > 0
      AND (
        value_quantity ->> 'system' IS NULL
        OR length(trim(value_quantity ->> 'system')) > 0
      )
      AND (
        value_quantity ->> 'code' IS NULL
        OR length(trim(value_quantity ->> 'code')) > 0
      )
    )
  )
  NOT VALID;

ALTER TABLE observations
  VALIDATE CONSTRAINT observations_quantity_shape;

ALTER TABLE observations
  ADD CONSTRAINT observations_timeline_order
  CHECK (updated_at >= created_at)
  NOT VALID;

ALTER TABLE observations
  VALIDATE CONSTRAINT observations_timeline_order;

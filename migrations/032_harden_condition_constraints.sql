ALTER TABLE conditions
  ADD CONSTRAINT conditions_required_text_not_blank
  CHECK (
    length(trim(id)) > 0
    AND length(trim(patient_id)) > 0
    AND length(trim(recorder_practitioner_id)) > 0
    AND (
      note IS NULL
      OR length(trim(note)) > 0
    )
  )
  NOT VALID;

ALTER TABLE conditions
  VALIDATE CONSTRAINT conditions_required_text_not_blank;

ALTER TABLE conditions
  ADD CONSTRAINT conditions_code_shape
  CHECK (
    jsonb_typeof(code) = 'object'
    AND COALESCE(length(trim(code ->> 'system')), 0) > 0
    AND COALESCE(length(trim(code ->> 'code')), 0) > 0
    AND COALESCE(length(trim(code ->> 'display')), 0) > 0
  )
  NOT VALID;

ALTER TABLE conditions
  VALIDATE CONSTRAINT conditions_code_shape;

ALTER TABLE conditions
  ADD CONSTRAINT conditions_timeline_order
  CHECK (
    updated_at >= created_at
    AND (
      onset_at IS NULL
      OR onset_at <= recorded_at
    )
  )
  NOT VALID;

ALTER TABLE conditions
  VALIDATE CONSTRAINT conditions_timeline_order;

ALTER TABLE procedures
  ADD CONSTRAINT procedures_required_text_not_blank
  CHECK (
    length(trim(id)) > 0
    AND length(trim(patient_id)) > 0
    AND (
      encounter_id IS NULL
      OR length(trim(encounter_id)) > 0
    )
    AND (
      based_on_service_request_id IS NULL
      OR length(trim(based_on_service_request_id)) > 0
    )
    AND (
      part_of_procedure_id IS NULL
      OR length(trim(part_of_procedure_id)) > 0
    )
    AND (
      recorder_practitioner_id IS NULL
      OR length(trim(recorder_practitioner_id)) > 0
    )
    AND (
      asserter_practitioner_id IS NULL
      OR length(trim(asserter_practitioner_id)) > 0
    )
    AND (
      reason_condition_id IS NULL
      OR length(trim(reason_condition_id)) > 0
    )
    AND (
      note IS NULL
      OR length(trim(note)) > 0
    )
  )
  NOT VALID;

ALTER TABLE procedures
  VALIDATE CONSTRAINT procedures_required_text_not_blank;

ALTER TABLE procedures
  ADD CONSTRAINT procedures_distinct_part_of
  CHECK (
    part_of_procedure_id IS NULL
    OR part_of_procedure_id <> id
  )
  NOT VALID;

ALTER TABLE procedures
  VALIDATE CONSTRAINT procedures_distinct_part_of;

ALTER TABLE procedures
  ADD CONSTRAINT procedures_code_shape
  CHECK (
    jsonb_typeof(code) = 'object'
    AND COALESCE(length(trim(code ->> 'system')), 0) > 0
    AND COALESCE(length(trim(code ->> 'code')), 0) > 0
    AND COALESCE(length(trim(code ->> 'display')), 0) > 0
  )
  NOT VALID;

ALTER TABLE procedures
  VALIDATE CONSTRAINT procedures_code_shape;

ALTER TABLE procedures
  ADD CONSTRAINT procedures_optional_coding_shape
  CHECK (
    (
      status_reason IS NULL
      OR (
        jsonb_typeof(status_reason) = 'object'
        AND COALESCE(length(trim(status_reason ->> 'system')), 0) > 0
        AND COALESCE(length(trim(status_reason ->> 'code')), 0) > 0
        AND COALESCE(length(trim(status_reason ->> 'display')), 0) > 0
      )
    )
    AND (
      body_site IS NULL
      OR (
        jsonb_typeof(body_site) = 'object'
        AND COALESCE(length(trim(body_site ->> 'system')), 0) > 0
        AND COALESCE(length(trim(body_site ->> 'code')), 0) > 0
        AND COALESCE(length(trim(body_site ->> 'display')), 0) > 0
      )
    )
    AND (
      outcome IS NULL
      OR (
        jsonb_typeof(outcome) = 'object'
        AND COALESCE(length(trim(outcome ->> 'system')), 0) > 0
        AND COALESCE(length(trim(outcome ->> 'code')), 0) > 0
        AND COALESCE(length(trim(outcome ->> 'display')), 0) > 0
      )
    )
  )
  NOT VALID;

ALTER TABLE procedures
  VALIDATE CONSTRAINT procedures_optional_coding_shape;

ALTER TABLE procedures
  ADD CONSTRAINT procedures_timeline_order
  CHECK (
    updated_at >= created_at
    AND (
      performed_period IS NULL
      OR (
        jsonb_typeof(performed_period) = 'object'
        AND (
          performed_period ->> 'end' IS NULL
          OR performed_period ->> 'start' IS NULL
          OR (performed_period ->> 'end')::timestamptz >= (performed_period ->> 'start')::timestamptz
        )
      )
    )
  )
  NOT VALID;

ALTER TABLE procedures
  VALIDATE CONSTRAINT procedures_timeline_order;

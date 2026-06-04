ALTER TABLE service_requests
  ADD CONSTRAINT service_requests_required_text_not_blank
  CHECK (
    length(trim(id)) > 0
    AND length(trim(patient_id)) > 0
    AND length(trim(requester_practitioner_id)) > 0
    AND (
      encounter_id IS NULL
      OR length(trim(encounter_id)) > 0
    )
    AND (
      reason_condition_id IS NULL
      OR length(trim(reason_condition_id)) > 0
    )
    AND (
      performer_organization_id IS NULL
      OR length(trim(performer_organization_id)) > 0
    )
    AND (
      patient_instruction IS NULL
      OR length(trim(patient_instruction)) > 0
    )
    AND (
      note IS NULL
      OR length(trim(note)) > 0
    )
  )
  NOT VALID;

ALTER TABLE service_requests
  VALIDATE CONSTRAINT service_requests_required_text_not_blank;

ALTER TABLE service_requests
  ADD CONSTRAINT service_requests_code_shape
  CHECK (
    jsonb_typeof(code) = 'object'
    AND COALESCE(length(trim(code ->> 'system')), 0) > 0
    AND COALESCE(length(trim(code ->> 'code')), 0) > 0
    AND COALESCE(length(trim(code ->> 'display')), 0) > 0
  )
  NOT VALID;

ALTER TABLE service_requests
  VALIDATE CONSTRAINT service_requests_code_shape;

ALTER TABLE service_requests
  ADD CONSTRAINT service_requests_timeline_order
  CHECK (
    updated_at >= created_at
    AND (
      occurrence_at IS NULL
      OR occurrence_at >= authored_on
    )
  )
  NOT VALID;

ALTER TABLE service_requests
  VALIDATE CONSTRAINT service_requests_timeline_order;

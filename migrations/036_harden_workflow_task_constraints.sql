ALTER TABLE workflow_tasks
  ADD CONSTRAINT workflow_tasks_required_text_not_blank
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
      description IS NULL
      OR length(trim(description)) > 0
    )
    AND (
      requester_practitioner_id IS NULL
      OR length(trim(requester_practitioner_id)) > 0
    )
    AND (
      owner_organization_id IS NULL
      OR length(trim(owner_organization_id)) > 0
    )
    AND (
      owner_practitioner_id IS NULL
      OR length(trim(owner_practitioner_id)) > 0
    )
    AND (
      note IS NULL
      OR length(trim(note)) > 0
    )
  )
  NOT VALID;

ALTER TABLE workflow_tasks
  VALIDATE CONSTRAINT workflow_tasks_required_text_not_blank;

ALTER TABLE workflow_tasks
  ADD CONSTRAINT workflow_tasks_code_shape
  CHECK (
    jsonb_typeof(code) = 'object'
    AND COALESCE(length(trim(code ->> 'system')), 0) > 0
    AND COALESCE(length(trim(code ->> 'code')), 0) > 0
    AND COALESCE(length(trim(code ->> 'display')), 0) > 0
  )
  NOT VALID;

ALTER TABLE workflow_tasks
  VALIDATE CONSTRAINT workflow_tasks_code_shape;

ALTER TABLE workflow_tasks
  ADD CONSTRAINT workflow_tasks_business_status_shape
  CHECK (
    business_status IS NULL
    OR (
      jsonb_typeof(business_status) = 'object'
      AND COALESCE(length(trim(business_status ->> 'code')), 0) > 0
      AND COALESCE(length(trim(business_status ->> 'display')), 0) > 0
    )
  )
  NOT VALID;

ALTER TABLE workflow_tasks
  VALIDATE CONSTRAINT workflow_tasks_business_status_shape;

ALTER TABLE workflow_tasks
  ADD CONSTRAINT workflow_tasks_completed_has_output
  CHECK (
    status <> 'completed'
    OR jsonb_array_length(output_references) > 0
  )
  NOT VALID;

ALTER TABLE workflow_tasks
  VALIDATE CONSTRAINT workflow_tasks_completed_has_output;

ALTER TABLE workflow_tasks
  ADD CONSTRAINT workflow_tasks_timeline_order
  CHECK (
    last_modified >= authored_on
    AND updated_at >= created_at
    AND (
      execution_period IS NULL
      OR (
        jsonb_typeof(execution_period) = 'object'
        AND (
          execution_period ->> 'start' IS NULL
          OR (execution_period ->> 'start')::timestamptz >= authored_on
        )
        AND (
          execution_period ->> 'end' IS NULL
          OR execution_period ->> 'start' IS NOT NULL
        )
        AND (
          execution_period ->> 'end' IS NULL
          OR (execution_period ->> 'end')::timestamptz >= (execution_period ->> 'start')::timestamptz
        )
      )
    )
  )
  NOT VALID;

ALTER TABLE workflow_tasks
  VALIDATE CONSTRAINT workflow_tasks_timeline_order;

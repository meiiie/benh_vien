ALTER TABLE diagnostic_reports
  ADD CONSTRAINT diagnostic_reports_required_text_not_blank
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
      performer_organization_id IS NULL
      OR length(trim(performer_organization_id)) > 0
    )
    AND (
      results_interpreter_practitioner_id IS NULL
      OR length(trim(results_interpreter_practitioner_id)) > 0
    )
    AND (
      conclusion IS NULL
      OR length(trim(conclusion)) > 0
    )
    AND (
      presented_form_url IS NULL
      OR length(trim(presented_form_url)) > 0
    )
    AND (
      presented_form_title IS NULL
      OR length(trim(presented_form_title)) > 0
    )
  )
  NOT VALID;

ALTER TABLE diagnostic_reports
  VALIDATE CONSTRAINT diagnostic_reports_required_text_not_blank;

ALTER TABLE diagnostic_reports
  ADD CONSTRAINT diagnostic_reports_code_shape
  CHECK (
    jsonb_typeof(code) = 'object'
    AND COALESCE(length(trim(code ->> 'system')), 0) > 0
    AND COALESCE(length(trim(code ->> 'code')), 0) > 0
    AND COALESCE(length(trim(code ->> 'display')), 0) > 0
  )
  NOT VALID;

ALTER TABLE diagnostic_reports
  VALIDATE CONSTRAINT diagnostic_reports_code_shape;

ALTER TABLE diagnostic_reports
  ADD CONSTRAINT diagnostic_reports_timeline_order
  CHECK (
    issued_at >= effective_at
    AND updated_at >= created_at
  )
  NOT VALID;

ALTER TABLE diagnostic_reports
  VALIDATE CONSTRAINT diagnostic_reports_timeline_order;

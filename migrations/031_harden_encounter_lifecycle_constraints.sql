ALTER TABLE encounters
  ADD CONSTRAINT encounters_required_text_not_blank
  CHECK (
    length(trim(id)) > 0
    AND length(trim(patient_id)) > 0
    AND length(trim(service_type)) > 0
    AND length(trim(reason_text)) > 0
    AND length(trim(attending_practitioner_id)) > 0
    AND (
      department_id IS NULL
      OR length(trim(department_id)) > 0
    )
  )
  NOT VALID;

ALTER TABLE encounters
  VALIDATE CONSTRAINT encounters_required_text_not_blank;

ALTER TABLE encounters
  ADD CONSTRAINT encounters_status_period_consistency
  CHECK (
    (
      status = 'finished'
      AND ended_at IS NOT NULL
    )
    OR (
      status IN ('planned', 'in-progress')
      AND ended_at IS NULL
    )
    OR status IN ('cancelled', 'entered-in-error')
  )
  NOT VALID;

ALTER TABLE encounters
  VALIDATE CONSTRAINT encounters_status_period_consistency;

ALTER TABLE encounters
  ADD CONSTRAINT encounters_timeline_order
  CHECK (updated_at >= created_at)
  NOT VALID;

ALTER TABLE encounters
  VALIDATE CONSTRAINT encounters_timeline_order;

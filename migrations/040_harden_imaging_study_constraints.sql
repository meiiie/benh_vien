ALTER TABLE imaging_studies
  ADD CONSTRAINT imaging_studies_required_text_not_blank
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
      diagnostic_report_id IS NULL
      OR length(trim(diagnostic_report_id)) > 0
    )
    AND (
      accession_number IS NULL
      OR length(trim(accession_number)) > 0
    )
    AND (
      description IS NULL
      OR length(trim(description)) > 0
    )
    AND (
      referrer_practitioner_id IS NULL
      OR length(trim(referrer_practitioner_id)) > 0
    )
    AND (
      interpreter_practitioner_id IS NULL
      OR length(trim(interpreter_practitioner_id)) > 0
    )
    AND (
      endpoint_id IS NULL
      OR length(trim(endpoint_id)) > 0
    )
  )
  NOT VALID;

ALTER TABLE imaging_studies
  VALIDATE CONSTRAINT imaging_studies_required_text_not_blank;

ALTER TABLE imaging_studies
  ADD CONSTRAINT imaging_studies_study_instance_uid_shape
  CHECK (
    length(study_instance_uid) BETWEEN 1 AND 64
    AND study_instance_uid ~ '^(0|[1-9][0-9]*)([.](0|[1-9][0-9]*))*$'
  )
  NOT VALID;

ALTER TABLE imaging_studies
  VALIDATE CONSTRAINT imaging_studies_study_instance_uid_shape;

ALTER TABLE imaging_studies
  ADD CONSTRAINT imaging_studies_count_alignment
  CHECK (
    number_of_series >= jsonb_array_length(series)
    AND number_of_instances >= 0
  )
  NOT VALID;

ALTER TABLE imaging_studies
  VALIDATE CONSTRAINT imaging_studies_count_alignment;

ALTER TABLE imaging_studies
  ADD CONSTRAINT imaging_studies_timeline_order
  CHECK (updated_at >= created_at)
  NOT VALID;

ALTER TABLE imaging_studies
  VALIDATE CONSTRAINT imaging_studies_timeline_order;

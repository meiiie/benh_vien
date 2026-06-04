ALTER TABLE patients
  ADD CONSTRAINT patients_required_text_not_blank
  CHECK (
    length(trim(id)) > 0
    AND length(trim(full_name)) > 0
    AND length(trim(managing_organization_id)) > 0
  )
  NOT VALID;

ALTER TABLE patients
  VALIDATE CONSTRAINT patients_required_text_not_blank;

ALTER TABLE patients
  ADD CONSTRAINT patients_timeline_order
  CHECK (
    updated_at >= created_at
    AND (
      merged_at IS NULL
      OR merged_at >= created_at
    )
  )
  NOT VALID;

ALTER TABLE patients
  VALIDATE CONSTRAINT patients_timeline_order;

ALTER TABLE patients
  ADD CONSTRAINT patients_merge_metadata_scope
  CHECK (
    status = 'merged'
    OR (
      merged_into_patient_id IS NULL
      AND merged_at IS NULL
      AND merged_by_actor_id IS NULL
      AND merge_reason IS NULL
    )
  )
  NOT VALID;

ALTER TABLE patients
  VALIDATE CONSTRAINT patients_merge_metadata_scope;

ALTER TABLE patients
  ADD CONSTRAINT patients_identifiers_json_array
  CHECK (
    jsonb_typeof(identifiers) = 'array'
    AND jsonb_array_length(identifiers) > 0
  )
  NOT VALID;

ALTER TABLE patients
  VALIDATE CONSTRAINT patients_identifiers_json_array;

ALTER TABLE patient_identifier_index
  ADD CONSTRAINT patient_identifier_index_required_text_not_blank
  CHECK (
    length(trim(system)) > 0
    AND length(trim(value)) > 0
  )
  NOT VALID;

ALTER TABLE patient_identifier_index
  VALIDATE CONSTRAINT patient_identifier_index_required_text_not_blank;

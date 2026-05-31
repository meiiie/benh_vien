ALTER TABLE allergy_intolerances
  ADD CONSTRAINT allergy_intolerances_required_text_not_blank
  CHECK (
    length(trim(id)) > 0
    AND length(trim(patient_id)) > 0
    AND length(trim(recorder_practitioner_id)) > 0
    AND (
      encounter_id IS NULL
      OR length(trim(encounter_id)) > 0
    )
    AND (
      note IS NULL
      OR length(trim(note)) > 0
    )
  )
  NOT VALID;

ALTER TABLE allergy_intolerances
  VALIDATE CONSTRAINT allergy_intolerances_required_text_not_blank;

ALTER TABLE allergy_intolerances
  ADD CONSTRAINT allergy_intolerances_code_shape
  CHECK (
    jsonb_typeof(code) = 'object'
    AND COALESCE(length(trim(code ->> 'system')), 0) > 0
    AND COALESCE(length(trim(code ->> 'code')), 0) > 0
    AND COALESCE(length(trim(code ->> 'display')), 0) > 0
  )
  NOT VALID;

ALTER TABLE allergy_intolerances
  VALIDATE CONSTRAINT allergy_intolerances_code_shape;

ALTER TABLE allergy_intolerances
  ADD CONSTRAINT allergy_intolerances_reaction_shape
  CHECK (
    reaction IS NULL
    OR (
      jsonb_typeof(reaction) = 'object'
      AND jsonb_typeof(reaction -> 'manifestation') = 'object'
      AND COALESCE(length(trim(reaction #>> '{manifestation,system}')), 0) > 0
      AND COALESCE(length(trim(reaction #>> '{manifestation,code}')), 0) > 0
      AND COALESCE(length(trim(reaction #>> '{manifestation,display}')), 0) > 0
      AND (
        reaction ->> 'severity' IS NULL
        OR reaction ->> 'severity' IN ('mild', 'moderate', 'severe')
      )
      AND (
        reaction ->> 'description' IS NULL
        OR length(trim(reaction ->> 'description')) > 0
      )
    )
  )
  NOT VALID;

ALTER TABLE allergy_intolerances
  VALIDATE CONSTRAINT allergy_intolerances_reaction_shape;

ALTER TABLE allergy_intolerances
  ADD CONSTRAINT allergy_intolerances_timeline_order
  CHECK (updated_at >= created_at)
  NOT VALID;

ALTER TABLE allergy_intolerances
  VALIDATE CONSTRAINT allergy_intolerances_timeline_order;

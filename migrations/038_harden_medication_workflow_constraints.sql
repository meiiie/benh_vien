ALTER TABLE medication_requests
  ADD CONSTRAINT medication_requests_required_text_not_blank
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
      note IS NULL
      OR length(trim(note)) > 0
    )
  )
  NOT VALID;

ALTER TABLE medication_requests
  VALIDATE CONSTRAINT medication_requests_required_text_not_blank;

ALTER TABLE medication_requests
  ADD CONSTRAINT medication_requests_medication_code_shape
  CHECK (
    jsonb_typeof(medication_code) = 'object'
    AND COALESCE(length(trim(medication_code ->> 'system')), 0) > 0
    AND COALESCE(length(trim(medication_code ->> 'code')), 0) > 0
    AND COALESCE(length(trim(medication_code ->> 'display')), 0) > 0
  )
  NOT VALID;

ALTER TABLE medication_requests
  VALIDATE CONSTRAINT medication_requests_medication_code_shape;

ALTER TABLE medication_requests
  ADD CONSTRAINT medication_requests_dosage_instruction_shape
  CHECK (
    jsonb_typeof(dosage_instruction) = 'object'
    AND COALESCE(length(trim(dosage_instruction ->> 'text')), 0) > 0
    AND (
      dosage_instruction ->> 'route' IS NULL
      OR length(trim(dosage_instruction ->> 'route')) > 0
    )
    AND (
      NOT (dosage_instruction ? 'doseQuantity')
      OR (
        jsonb_typeof(dosage_instruction -> 'doseQuantity') = 'object'
        AND jsonb_typeof(dosage_instruction #> '{doseQuantity,value}') = 'number'
        AND (dosage_instruction #>> '{doseQuantity,value}')::numeric > 0
        AND COALESCE(length(trim(dosage_instruction #>> '{doseQuantity,unit}')), 0) > 0
        AND (
          dosage_instruction #>> '{doseQuantity,system}' IS NULL
          OR length(trim(dosage_instruction #>> '{doseQuantity,system}')) > 0
        )
        AND (
          dosage_instruction #>> '{doseQuantity,code}' IS NULL
          OR length(trim(dosage_instruction #>> '{doseQuantity,code}')) > 0
        )
      )
    )
    AND (
      NOT (
        dosage_instruction ? 'frequency'
        OR dosage_instruction ? 'period'
        OR dosage_instruction ? 'periodUnit'
      )
      OR (
        jsonb_typeof(dosage_instruction -> 'frequency') = 'number'
        AND (dosage_instruction ->> 'frequency')::numeric > 0
        AND jsonb_typeof(dosage_instruction -> 'period') = 'number'
        AND (dosage_instruction ->> 'period')::numeric > 0
        AND dosage_instruction ->> 'periodUnit' IN ('h', 'd', 'wk')
      )
    )
  )
  NOT VALID;

ALTER TABLE medication_requests
  VALIDATE CONSTRAINT medication_requests_dosage_instruction_shape;

ALTER TABLE medication_requests
  ADD CONSTRAINT medication_requests_timeline_order
  CHECK (updated_at >= created_at)
  NOT VALID;

ALTER TABLE medication_requests
  VALIDATE CONSTRAINT medication_requests_timeline_order;

ALTER TABLE medication_dispenses
  ADD CONSTRAINT medication_dispenses_required_text_not_blank
  CHECK (
    length(trim(id)) > 0
    AND length(trim(patient_id)) > 0
    AND (
      encounter_id IS NULL
      OR length(trim(encounter_id)) > 0
    )
    AND (
      medication_request_id IS NULL
      OR length(trim(medication_request_id)) > 0
    )
    AND (
      dispenser_practitioner_id IS NULL
      OR length(trim(dispenser_practitioner_id)) > 0
    )
    AND (
      destination_location_id IS NULL
      OR length(trim(destination_location_id)) > 0
    )
    AND (
      receiver_practitioner_id IS NULL
      OR length(trim(receiver_practitioner_id)) > 0
    )
    AND (
      note IS NULL
      OR length(trim(note)) > 0
    )
  )
  NOT VALID;

ALTER TABLE medication_dispenses
  VALIDATE CONSTRAINT medication_dispenses_required_text_not_blank;

ALTER TABLE medication_dispenses
  ADD CONSTRAINT medication_dispenses_coding_shape
  CHECK (
    jsonb_typeof(medication_code) = 'object'
    AND COALESCE(length(trim(medication_code ->> 'system')), 0) > 0
    AND COALESCE(length(trim(medication_code ->> 'code')), 0) > 0
    AND COALESCE(length(trim(medication_code ->> 'display')), 0) > 0
    AND (
      status_reason IS NULL
      OR (
        jsonb_typeof(status_reason) = 'object'
        AND COALESCE(length(trim(status_reason ->> 'system')), 0) > 0
        AND COALESCE(length(trim(status_reason ->> 'code')), 0) > 0
        AND COALESCE(length(trim(status_reason ->> 'display')), 0) > 0
      )
    )
  )
  NOT VALID;

ALTER TABLE medication_dispenses
  VALIDATE CONSTRAINT medication_dispenses_coding_shape;

ALTER TABLE medication_dispenses
  ADD CONSTRAINT medication_dispenses_quantity_shape
  CHECK (
    (
      quantity IS NULL
      OR (
        jsonb_typeof(quantity) = 'object'
        AND jsonb_typeof(quantity -> 'value') = 'number'
        AND (quantity ->> 'value')::numeric > 0
        AND COALESCE(length(trim(quantity ->> 'unit')), 0) > 0
        AND (
          quantity ->> 'system' IS NULL
          OR length(trim(quantity ->> 'system')) > 0
        )
        AND (
          quantity ->> 'code' IS NULL
          OR length(trim(quantity ->> 'code')) > 0
        )
      )
    )
    AND (
      days_supply IS NULL
      OR (
        jsonb_typeof(days_supply) = 'object'
        AND jsonb_typeof(days_supply -> 'value') = 'number'
        AND (days_supply ->> 'value')::numeric > 0
        AND COALESCE(length(trim(days_supply ->> 'unit')), 0) > 0
        AND (
          days_supply ->> 'system' IS NULL
          OR length(trim(days_supply ->> 'system')) > 0
        )
        AND (
          days_supply ->> 'code' IS NULL
          OR length(trim(days_supply ->> 'code')) > 0
        )
      )
    )
  )
  NOT VALID;

ALTER TABLE medication_dispenses
  VALIDATE CONSTRAINT medication_dispenses_quantity_shape;

ALTER TABLE medication_dispenses
  ADD CONSTRAINT medication_dispenses_dosage_instruction_shape
  CHECK (
    dosage_instruction IS NULL
    OR (
      jsonb_typeof(dosage_instruction) = 'object'
      AND COALESCE(length(trim(dosage_instruction ->> 'text')), 0) > 0
      AND (
        dosage_instruction ->> 'route' IS NULL
        OR length(trim(dosage_instruction ->> 'route')) > 0
      )
      AND (
        NOT (dosage_instruction ? 'doseQuantity')
        OR (
          jsonb_typeof(dosage_instruction -> 'doseQuantity') = 'object'
          AND jsonb_typeof(dosage_instruction #> '{doseQuantity,value}') = 'number'
          AND (dosage_instruction #>> '{doseQuantity,value}')::numeric > 0
          AND COALESCE(length(trim(dosage_instruction #>> '{doseQuantity,unit}')), 0) > 0
          AND (
            dosage_instruction #>> '{doseQuantity,system}' IS NULL
            OR length(trim(dosage_instruction #>> '{doseQuantity,system}')) > 0
          )
          AND (
            dosage_instruction #>> '{doseQuantity,code}' IS NULL
            OR length(trim(dosage_instruction #>> '{doseQuantity,code}')) > 0
          )
        )
      )
      AND (
        NOT (
          dosage_instruction ? 'frequency'
          OR dosage_instruction ? 'period'
          OR dosage_instruction ? 'periodUnit'
        )
        OR (
          jsonb_typeof(dosage_instruction -> 'frequency') = 'number'
          AND (dosage_instruction ->> 'frequency')::numeric > 0
          AND jsonb_typeof(dosage_instruction -> 'period') = 'number'
          AND (dosage_instruction ->> 'period')::numeric > 0
          AND dosage_instruction ->> 'periodUnit' IN ('h', 'd', 'wk')
        )
      )
    )
  )
  NOT VALID;

ALTER TABLE medication_dispenses
  VALIDATE CONSTRAINT medication_dispenses_dosage_instruction_shape;

ALTER TABLE medication_dispenses
  ADD CONSTRAINT medication_dispenses_timeline_order
  CHECK (updated_at >= created_at)
  NOT VALID;

ALTER TABLE medication_dispenses
  VALIDATE CONSTRAINT medication_dispenses_timeline_order;

ALTER TABLE medication_administrations
  ADD CONSTRAINT medication_administrations_required_text_not_blank
  CHECK (
    length(trim(id)) > 0
    AND length(trim(patient_id)) > 0
    AND (
      encounter_id IS NULL
      OR length(trim(encounter_id)) > 0
    )
    AND (
      medication_request_id IS NULL
      OR length(trim(medication_request_id)) > 0
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

ALTER TABLE medication_administrations
  VALIDATE CONSTRAINT medication_administrations_required_text_not_blank;

ALTER TABLE medication_administrations
  ADD CONSTRAINT medication_administrations_coding_shape
  CHECK (
    jsonb_typeof(medication_code) = 'object'
    AND COALESCE(length(trim(medication_code ->> 'system')), 0) > 0
    AND COALESCE(length(trim(medication_code ->> 'code')), 0) > 0
    AND COALESCE(length(trim(medication_code ->> 'display')), 0) > 0
    AND (
      status_reason IS NULL
      OR (
        jsonb_typeof(status_reason) = 'object'
        AND COALESCE(length(trim(status_reason ->> 'system')), 0) > 0
        AND COALESCE(length(trim(status_reason ->> 'code')), 0) > 0
        AND COALESCE(length(trim(status_reason ->> 'display')), 0) > 0
      )
    )
    AND (
      dosage IS NULL
      OR dosage -> 'route' IS NULL
      OR (
        jsonb_typeof(dosage -> 'route') = 'object'
        AND COALESCE(length(trim(dosage #>> '{route,system}')), 0) > 0
        AND COALESCE(length(trim(dosage #>> '{route,code}')), 0) > 0
        AND COALESCE(length(trim(dosage #>> '{route,display}')), 0) > 0
      )
    )
  )
  NOT VALID;

ALTER TABLE medication_administrations
  VALIDATE CONSTRAINT medication_administrations_coding_shape;

ALTER TABLE medication_administrations
  ADD CONSTRAINT medication_administrations_dosage_shape
  CHECK (
    dosage IS NULL
    OR (
      jsonb_typeof(dosage) = 'object'
      AND (
        dosage ->> 'text' IS NULL
        OR length(trim(dosage ->> 'text')) > 0
      )
      AND jsonb_typeof(dosage -> 'doseQuantity') = 'object'
      AND jsonb_typeof(dosage #> '{doseQuantity,value}') = 'number'
      AND (dosage #>> '{doseQuantity,value}')::numeric > 0
      AND COALESCE(length(trim(dosage #>> '{doseQuantity,unit}')), 0) > 0
      AND (
        dosage #>> '{doseQuantity,system}' IS NULL
        OR length(trim(dosage #>> '{doseQuantity,system}')) > 0
      )
      AND (
        dosage #>> '{doseQuantity,code}' IS NULL
        OR length(trim(dosage #>> '{doseQuantity,code}')) > 0
      )
    )
  )
  NOT VALID;

ALTER TABLE medication_administrations
  VALIDATE CONSTRAINT medication_administrations_dosage_shape;

ALTER TABLE medication_administrations
  ADD CONSTRAINT medication_administrations_effective_period_timeline
  CHECK (
    updated_at >= created_at
    AND (
      effective_period ? 'start'
      OR effective_period ? 'end'
    )
    AND (
      effective_period ->> 'end' IS NULL
      OR effective_period ->> 'start' IS NULL
      OR (effective_period ->> 'end')::timestamptz >= (effective_period ->> 'start')::timestamptz
    )
  )
  NOT VALID;

ALTER TABLE medication_administrations
  VALIDATE CONSTRAINT medication_administrations_effective_period_timeline;

CREATE TABLE IF NOT EXISTS patient_identifier_index (
  patient_id text NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  system text NOT NULL,
  value text NOT NULL,
  type text NOT NULL CHECK (type IN ('national-id', 'insurance-id', 'hospital-mrn', 'legacy-id')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (patient_id, system, value),
  CONSTRAINT patient_identifier_index_unique_identifier UNIQUE (system, value)
);

CREATE INDEX IF NOT EXISTS idx_patient_identifier_index_patient
  ON patient_identifier_index (patient_id);

INSERT INTO patient_identifier_index (patient_id, system, value, type)
SELECT
  patients.id,
  identifier.value ->> 'system',
  identifier.value ->> 'value',
  identifier.value ->> 'type'
FROM patients
CROSS JOIN LATERAL jsonb_array_elements(patients.identifiers) AS identifier(value)
WHERE
  identifier.value ->> 'system' IS NOT NULL
  AND identifier.value ->> 'value' IS NOT NULL
  AND identifier.value ->> 'type' IN ('national-id', 'insurance-id', 'hospital-mrn', 'legacy-id')
ON CONFLICT (patient_id, system, value) DO NOTHING;

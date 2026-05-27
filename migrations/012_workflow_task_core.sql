CREATE TABLE IF NOT EXISTS workflow_tasks (
  id text PRIMARY KEY,
  patient_id text NOT NULL REFERENCES patients(id),
  encounter_id text REFERENCES encounters(id),
  based_on_service_request_id text REFERENCES service_requests(id),
  status text NOT NULL CHECK (
    status IN (
      'draft',
      'requested',
      'received',
      'accepted',
      'rejected',
      'ready',
      'cancelled',
      'in-progress',
      'on-hold',
      'failed',
      'completed',
      'entered-in-error'
    )
  ),
  intent text NOT NULL CHECK (
    intent IN (
      'unknown',
      'proposal',
      'plan',
      'order',
      'original-order',
      'reflex-order',
      'filler-order',
      'instance-order',
      'option'
    )
  ),
  priority text NOT NULL CHECK (priority IN ('routine', 'urgent', 'asap', 'stat')),
  code jsonb NOT NULL,
  description text,
  business_status jsonb,
  requester_practitioner_id text,
  owner_organization_id text,
  owner_practitioner_id text,
  authored_on timestamptz NOT NULL,
  last_modified timestamptz NOT NULL,
  execution_period jsonb,
  input_references jsonb NOT NULL,
  output_references jsonb NOT NULL,
  note text,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  CONSTRAINT workflow_tasks_input_refs_array CHECK (jsonb_typeof(input_references) = 'array'),
  CONSTRAINT workflow_tasks_output_refs_array CHECK (jsonb_typeof(output_references) = 'array')
);

CREATE INDEX IF NOT EXISTS idx_workflow_tasks_patient_modified
  ON workflow_tasks (patient_id, last_modified DESC);

CREATE INDEX IF NOT EXISTS idx_workflow_tasks_encounter
  ON workflow_tasks (encounter_id);

CREATE INDEX IF NOT EXISTS idx_workflow_tasks_based_on_service_request
  ON workflow_tasks (based_on_service_request_id);

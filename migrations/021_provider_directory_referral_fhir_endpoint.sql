INSERT INTO provider_directory_resources (resource_type, id, snapshot, updated_at)
SELECT
  'Endpoint',
  'endpoint-fhir-hai-phong-referral',
  jsonb_build_object(
    'id', 'endpoint-fhir-hai-phong-referral',
    'managingOrganizationId', 'hospital-hai-phong-referral',
    'status', 'active',
    'connectionType', 'hl7-fhir-rest',
    'name', 'FHIR Gateway bệnh viện tiếp nhận Hải Phòng',
    'address', 'https://fhir.referral.demo.wiiicare.vn/fhir',
    'payloadTypes', jsonb_build_array(
      jsonb_build_object(
        'system', 'http://hl7.org/fhir/resource-types',
        'code', 'Bundle',
        'display', 'FHIR Bundle'
      ),
      jsonb_build_object(
        'system', 'http://hl7.org/fhir/resource-types',
        'code', 'Task',
        'display', 'FHIR Task'
      )
    ),
    'createdAt', now()::text,
    'updatedAt', now()::text
  ),
  now()
WHERE EXISTS (
  SELECT 1
  FROM provider_directory_resources
  WHERE resource_type = 'Organization'
    AND id = 'hospital-hai-phong-referral'
)
ON CONFLICT (resource_type, id) DO UPDATE SET
  snapshot = EXCLUDED.snapshot,
  updated_at = EXCLUDED.updated_at;

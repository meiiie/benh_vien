import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";

const routeBudgets = [
  {
    path: "apps/api/src/modules/http/api-routes.ts",
    maxLines: 50,
    role: "HTTP API prefix and system-route composition root"
  },
  {
    path: "apps/api/src/modules/http/api-route-dependencies.ts",
    maxLines: 70,
    role: "HTTP API route dependency type contract"
  },
  {
    path: "apps/api/src/modules/http/api-dependencies.ts",
    maxLines: 20,
    role: "HTTP API repository dependency public barrel"
  },
  {
    path: "apps/api/src/modules/http/api-repository.types.ts",
    maxLines: 90,
    role: "HTTP API repository dependency type contract"
  },
  {
    path: "apps/api/src/modules/http/api-repository-lifecycle.ts",
    maxLines: 50,
    role: "HTTP API repository close lifecycle tracker"
  },
  {
    path: "apps/api/src/modules/http/api-repository-factory.ts",
    maxLines: 50,
    role: "HTTP API repository group factory composition"
  },
  {
    path: "apps/api/src/modules/http/api-identity-repositories.ts",
    maxLines: 50,
    role: "HTTP API identity repository factory"
  },
  {
    path: "apps/api/src/modules/http/api-clinical-repositories.ts",
    maxLines: 60,
    role: "HTTP API clinical repository factory"
  },
  {
    path: "apps/api/src/modules/http/api-medication-repositories.ts",
    maxLines: 50,
    role: "HTTP API medication repository factory"
  },
  {
    path: "apps/api/src/modules/http/api-care-workflow-repositories.ts",
    maxLines: 50,
    role: "HTTP API care workflow repository factory"
  },
  {
    path: "apps/api/src/modules/http/api-diagnostic-repositories.ts",
    maxLines: 50,
    role: "HTTP API diagnostic repository factory"
  },
  {
    path: "apps/api/src/modules/http/api-interoperability-repositories.ts",
    maxLines: 60,
    role: "HTTP API interoperability repository factory"
  },
  {
    path: "apps/api/src/modules/http/api-audit-repositories.ts",
    maxLines: 40,
    role: "HTTP API audit repository factory"
  },
  {
    path: "apps/api/src/modules/http/api-domain-routes.ts",
    maxLines: 60,
    role: "HTTP API domain route group composition"
  },
  {
    path: "apps/api/src/modules/http/api-identity-routes.ts",
    maxLines: 80,
    role: "HTTP API auth, patient and provider directory route wiring"
  },
  {
    path: "apps/api/src/modules/http/api-interoperability-routes.ts",
    maxLines: 60,
    role: "HTTP API consent and record-transfer route wiring"
  },
  {
    path: "apps/api/src/modules/http/api-clinical-routes.ts",
    maxLines: 80,
    role: "HTTP API core clinical route wiring"
  },
  {
    path: "apps/api/src/modules/http/api-medication-routes.ts",
    maxLines: 80,
    role: "HTTP API medication route wiring"
  },
  {
    path: "apps/api/src/modules/http/api-care-workflow-routes.ts",
    maxLines: 80,
    role: "HTTP API service request, task and procedure route wiring"
  },
  {
    path: "apps/api/src/modules/http/api-diagnostic-routes.ts",
    maxLines: 70,
    role: "HTTP API diagnostic report and imaging route wiring"
  },
  {
    path: "apps/api/src/modules/http/api-document-routes.ts",
    maxLines: 40,
    role: "HTTP API clinical document route wiring"
  },
  {
    path: "apps/api/src/modules/http/api-audit-routes.ts",
    maxLines: 40,
    role: "HTTP API audit route wiring"
  },
  {
    path: "apps/api/src/modules/http/system-routes.ts",
    maxLines: 40,
    role: "System route composition root"
  },
  {
    path: "apps/api/src/modules/http/system-health-routes.ts",
    maxLines: 20,
    role: "System health route"
  },
  {
    path: "apps/api/src/modules/http/system-readiness-routes.ts",
    maxLines: 100,
    role: "System readiness route and dependency checks"
  },
  {
    path: "apps/api/src/modules/http/system-api-runtime-routes.ts",
    maxLines: 60,
    role: "API runtime metadata and CapabilityStatement route adapter"
  },
  {
    path: "apps/api/src/modules/http/system-runtime-info.ts",
    maxLines: 80,
    role: "Runtime diagnostics redaction and repository metadata helpers"
  },
  {
    path: "apps/api/src/modules/http/http-boundary.ts",
    maxLines: 30,
    role: "HTTP boundary composition root"
  },
  {
    path: "apps/api/src/modules/http/http-request-id.ts",
    maxLines: 40,
    role: "HTTP request-id validation and generation policy"
  },
  {
    path: "apps/api/src/modules/http/http-security-headers.ts",
    maxLines: 40,
    role: "HTTP security and cache-control header hook"
  },
  {
    path: "apps/api/src/modules/http/http-error-handler.ts",
    maxLines: 70,
    role: "HTTP error handler and client-safe error envelopes"
  },
  {
    path: "apps/api/src/modules/http/http-validation-operation-outcome.ts",
    maxLines: 50,
    role: "HTTP validation error to FHIR OperationOutcome mapper"
  },
  {
    path: "apps/api/src/modules/http/http-domain-error-response.ts",
    maxLines: 40,
    role: "HTTP DomainError to 422 response mapper"
  },
  {
    path: "apps/api/src/modules/http/http-validation-error-response.ts",
    maxLines: 30,
    role: "HTTP validation error to 422 response mapper"
  },
  {
    path: "apps/api/src/modules/http/http-not-found-error-response.ts",
    maxLines: 30,
    role: "HTTP JSON not-found error response mapper"
  },
  {
    path: "apps/api/src/modules/http/http-json-error-response.ts",
    maxLines: 40,
    role: "HTTP JSON error response mapper with request-id injection"
  },
  {
    path: "apps/api/src/modules/http/http-content-negotiation.ts",
    maxLines: 50,
    role: "HTTP FHIR content negotiation helpers"
  },
  {
    path: "apps/api/src/modules/http/http-error-payload.ts",
    maxLines: 80,
    role: "HTTP request-id injection for framework error payloads"
  },
  {
    path: "apps/api/src/modules/http/runtime-config.ts",
    maxLines: 30,
    role: "Runtime config public barrel"
  },
  {
    path: "apps/api/src/modules/http/runtime-config-env.ts",
    maxLines: 60,
    role: "Runtime config primitive environment readers"
  },
  {
    path: "apps/api/src/modules/http/runtime-config-repository.ts",
    maxLines: 30,
    role: "Runtime repository mode policy"
  },
  {
    path: "apps/api/src/modules/http/runtime-config-public-api.ts",
    maxLines: 50,
    role: "Runtime public API base URL policy"
  },
  {
    path: "apps/api/src/modules/http/runtime-config-http.ts",
    maxLines: 40,
    role: "Runtime HTTP body limit and API docs policy"
  },
  {
    path: "apps/api/src/modules/http/runtime-config-cors.ts",
    maxLines: 70,
    role: "Runtime production CORS policy"
  },
  {
    path: "apps/api/src/modules/http/runtime-config-workers.ts",
    maxLines: 100,
    role: "Runtime record-transfer worker scheduling policy"
  },
  {
    path: "apps/api/src/modules/provider-directory/provider-directory-routes.ts",
    maxLines: 50,
    role: "ProviderDirectory route composition root"
  },
  {
    path: "apps/api/src/modules/provider-directory/provider-directory-query-routes.ts",
    maxLines: 70,
    role: "ProviderDirectory read route adapter"
  },
  {
    path: "apps/api/src/modules/provider-directory/provider-directory-fhir-routes.ts",
    maxLines: 110,
    role: "ProviderDirectory FHIR Bundle and resource export route adapter"
  },
  {
    path: "apps/api/src/modules/provider-directory/provider-directory-route-helpers.ts",
    maxLines: 130,
    role: "ProviderDirectory summary, resource lookup, FHIR mapping and OperationOutcome helpers"
  },
  {
    path: "apps/api/src/modules/auth/auth-routes.ts",
    maxLines: 60,
    role: "Auth route composition root"
  },
  {
    path: "apps/api/src/modules/auth/auth-login-routes.ts",
    maxLines: 180,
    role: "Auth login route, rate-limit and demo IAM adapter"
  },
  {
    path: "apps/api/src/modules/auth/auth-session-routes.ts",
    maxLines: 60,
    role: "Auth bearer session route adapter"
  },
  {
    path: "apps/api/src/modules/auth/auth-login-audit.ts",
    maxLines: 80,
    role: "Auth login audit and username hashing helpers"
  },
  {
    path: "apps/api/src/modules/auth/auth-demo-accounts.ts",
    maxLines: 80,
    role: "Auth controlled demo account catalog"
  },
  {
    path: "apps/api/src/modules/audit-events/audit-event-routes.ts",
    maxLines: 60,
    role: "AuditEvent route composition root"
  },
  {
    path: "apps/api/src/modules/audit-events/audit-event-query-routes.ts",
    maxLines: 120,
    role: "AuditEvent global and patient query route adapter"
  },
  {
    path: "apps/api/src/modules/audit-events/audit-event-integrity-routes.ts",
    maxLines: 90,
    role: "AuditEvent patient integrity verification route adapter"
  },
  {
    path: "apps/api/src/modules/audit-events/audit-event-fhir-routes.ts",
    maxLines: 100,
    role: "AuditEvent FHIR Bundle export route adapter"
  },
  {
    path: "apps/api/src/modules/audit-events/audit-event-route-helpers.ts",
    maxLines: 80,
    role: "AuditEvent response and patient access helpers"
  },
  {
    path: "apps/api/src/modules/consents/consent-routes.ts",
    maxLines: 70,
    role: "Consent route composition root"
  },
  {
    path: "apps/api/src/modules/consents/consent-query-routes.ts",
    maxLines: 90,
    role: "Consent list route adapter"
  },
  {
    path: "apps/api/src/modules/consents/consent-creation-routes.ts",
    maxLines: 120,
    role: "Consent creation command route adapter"
  },
  {
    path: "apps/api/src/modules/consents/consent-command-routes.ts",
    maxLines: 140,
    role: "Consent revoke command route adapter"
  },
  {
    path: "apps/api/src/modules/consents/consent-fhir-routes.ts",
    maxLines: 90,
    role: "Consent FHIR export route adapter"
  },
  {
    path: "apps/api/src/modules/consents/consent-route-helpers.ts",
    maxLines: 130,
    role: "Consent response, access, OperationOutcome and domain error helpers"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-routes.ts",
    maxLines: 80,
    role: "RecordTransfer route composition root"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-creation-routes.ts",
    maxLines: 160,
    role: "RecordTransfer creation policy and command adapter"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-command-routes.ts",
    maxLines: 80,
    role: "RecordTransfer command route composition root"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-send-routes.ts",
    maxLines: 150,
    role: "RecordTransfer send command and delivery attempt queueing"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-receive-routes.ts",
    maxLines: 130,
    role: "RecordTransfer receive command and acknowledgement reference"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-failure-routes.ts",
    maxLines: 170,
    role: "RecordTransfer fail and retry commands"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-command-route-helpers.ts",
    maxLines: 120,
    role: "RecordTransfer command error response and audit metadata helpers"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-acknowledgement-routes.ts",
    maxLines: 50,
    role: "RecordTransfer acknowledgement callback route composition root"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-acknowledgement-route-dependencies.ts",
    maxLines: 30,
    role: "RecordTransfer acknowledgement callback route dependency type contract"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-acknowledgement-handler.ts",
    maxLines: 105,
    role: "RecordTransfer acknowledgement callback handler"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-acknowledgement-request.ts",
    maxLines: 60,
    role: "RecordTransfer acknowledgement callback request parsing and signature verification"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-acknowledgement-outcomes.ts",
    maxLines: 20,
    role: "RecordTransfer acknowledgement callback outcome public barrel"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-acknowledgement-completed-outcome.ts",
    maxLines: 70,
    role: "RecordTransfer acknowledgement completed callback idempotency outcome"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-acknowledgement-accepted-outcome.ts",
    maxLines: 70,
    role: "RecordTransfer acknowledgement accepted callback transition outcome"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-acknowledgement-policy.ts",
    maxLines: 80,
    role: "RecordTransfer acknowledgement callback access policy"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-acknowledgement-responses.ts",
    maxLines: 80,
    role: "RecordTransfer acknowledgement callback HTTP error responses"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-acknowledgement-audit.ts",
    maxLines: 95,
    role: "RecordTransfer acknowledgement callback audit metadata"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-acknowledgement-audit-metadata.ts",
    maxLines: 70,
    role: "RecordTransfer acknowledgement callback shared audit metadata builders"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-acknowledgement-reference.ts",
    maxLines: 30,
    role: "RecordTransfer acknowledgement reference generation"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-acknowledgement-recipient-policy.ts",
    maxLines: 50,
    role: "RecordTransfer acknowledgement recipient actor scope policy"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-recipient-organization-scope.ts",
    maxLines: 40,
    role: "RecordTransfer recipient organization hierarchy scope helper"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-query-routes.ts",
    maxLines: 180,
    role: "RecordTransfer query and read-model routes"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-fhir-routes.ts",
    maxLines: 120,
    role: "RecordTransfer FHIR Task export route"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-fhir-endpoint-resolver.ts",
    maxLines: 50,
    role: "RecordTransfer provider-directory FHIR Bundle endpoint resolver"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-route-access.ts",
    maxLines: 80,
    role: "RecordTransfer patient access helper"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-route-helpers.ts",
    maxLines: 80,
    role: "RecordTransfer bundle id and response DTO helpers"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-delivery-attempt-route-helpers.ts",
    maxLines: 140,
    role: "RecordTransfer delivery attempt route helper functions"
  },
  {
    path: "apps/api/src/modules/encounters/encounter-routes.ts",
    maxLines: 70,
    role: "Encounter route composition root"
  },
  {
    path: "apps/api/src/modules/encounters/encounter-query-routes.ts",
    maxLines: 130,
    role: "Encounter list and read route adapter"
  },
  {
    path: "apps/api/src/modules/encounters/encounter-creation-routes.ts",
    maxLines: 130,
    role: "Encounter creation command route adapter"
  },
  {
    path: "apps/api/src/modules/encounters/encounter-command-routes.ts",
    maxLines: 110,
    role: "Encounter finish command route adapter"
  },
  {
    path: "apps/api/src/modules/encounters/encounter-fhir-routes.ts",
    maxLines: 90,
    role: "Encounter FHIR export route adapter"
  },
  {
    path: "apps/api/src/modules/encounters/encounter-route-helpers.ts",
    maxLines: 100,
    role: "Encounter response, access and domain error helpers"
  },
  {
    path: "apps/api/src/modules/observations/observation-routes.ts",
    maxLines: 70,
    role: "Observation route composition root"
  },
  {
    path: "apps/api/src/modules/observations/observation-query-routes.ts",
    maxLines: 130,
    role: "Observation list and read route adapter"
  },
  {
    path: "apps/api/src/modules/observations/observation-creation-routes.ts",
    maxLines: 140,
    role: "Observation creation command route adapter"
  },
  {
    path: "apps/api/src/modules/observations/observation-fhir-routes.ts",
    maxLines: 90,
    role: "Observation FHIR export route adapter"
  },
  {
    path: "apps/api/src/modules/observations/observation-route-helpers.ts",
    maxLines: 90,
    role: "Observation response, access and domain error helpers"
  },
  {
    path: "apps/api/src/modules/observations/observation-reference-validation.ts",
    maxLines: 70,
    role: "Observation encounter reference validation helper"
  },
  {
    path: "apps/api/src/modules/conditions/condition-routes.ts",
    maxLines: 70,
    role: "Condition route composition root"
  },
  {
    path: "apps/api/src/modules/conditions/condition-query-routes.ts",
    maxLines: 130,
    role: "Condition list and read route adapter"
  },
  {
    path: "apps/api/src/modules/conditions/condition-creation-routes.ts",
    maxLines: 140,
    role: "Condition creation command route adapter"
  },
  {
    path: "apps/api/src/modules/conditions/condition-fhir-routes.ts",
    maxLines: 90,
    role: "Condition FHIR export route adapter"
  },
  {
    path: "apps/api/src/modules/conditions/condition-route-helpers.ts",
    maxLines: 90,
    role: "Condition response, access and domain error helpers"
  },
  {
    path: "apps/api/src/modules/conditions/condition-reference-validation.ts",
    maxLines: 70,
    role: "Condition encounter reference validation helper"
  },
  {
    path: "apps/api/src/modules/allergy-intolerances/allergy-intolerance-routes.ts",
    maxLines: 70,
    role: "AllergyIntolerance route composition root"
  },
  {
    path: "apps/api/src/modules/allergy-intolerances/allergy-intolerance-query-routes.ts",
    maxLines: 140,
    role: "AllergyIntolerance list and read route adapter"
  },
  {
    path: "apps/api/src/modules/allergy-intolerances/allergy-intolerance-creation-routes.ts",
    maxLines: 150,
    role: "AllergyIntolerance creation command route adapter"
  },
  {
    path: "apps/api/src/modules/allergy-intolerances/allergy-intolerance-fhir-routes.ts",
    maxLines: 100,
    role: "AllergyIntolerance FHIR export route adapter"
  },
  {
    path: "apps/api/src/modules/allergy-intolerances/allergy-intolerance-route-helpers.ts",
    maxLines: 100,
    role: "AllergyIntolerance response, access and domain error helpers"
  },
  {
    path: "apps/api/src/modules/allergy-intolerances/allergy-intolerance-reference-validation.ts",
    maxLines: 70,
    role: "AllergyIntolerance encounter reference validation helper"
  },
  {
    path: "apps/api/src/modules/patients/patient-routes.ts",
    maxLines: 90,
    role: "Patient route composition root"
  },
  {
    path: "apps/api/src/modules/patients/patient-registry-routes.ts",
    maxLines: 170,
    role: "Patient registry list and create adapter"
  },
  {
    path: "apps/api/src/modules/patients/patient-merge-routes.ts",
    maxLines: 130,
    role: "Patient merge command adapter"
  },
  {
    path: "apps/api/src/modules/patients/patient-query-routes.ts",
    maxLines: 90,
    role: "Patient read route adapter"
  },
  {
    path: "apps/api/src/modules/patients/patient-fhir-routes.ts",
    maxLines: 90,
    role: "Patient FHIR route composition root"
  },
  {
    path: "apps/api/src/modules/patients/patient-fhir-resource-routes.ts",
    maxLines: 90,
    role: "Patient FHIR Patient resource export route"
  },
  {
    path: "apps/api/src/modules/patients/patient-record-bundle-routes.ts",
    maxLines: 90,
    role: "Patient FHIR Bundle route composition root"
  },
  {
    path: "apps/api/src/modules/patients/patient-record-bundle-route-dependencies.ts",
    maxLines: 70,
    role: "Patient FHIR Bundle route dependency type contract"
  },
  {
    path: "apps/api/src/modules/patients/patient-record-bundle-collection-routes.ts",
    maxLines: 100,
    role: "Patient FHIR collection Bundle export route"
  },
  {
    path: "apps/api/src/modules/patients/patient-record-document-bundle-routes.ts",
    maxLines: 100,
    role: "Patient FHIR document Bundle export route"
  },
  {
    path: "apps/api/src/modules/patients/patient-record-bundle-route-helpers.ts",
    maxLines: 80,
    role: "Patient FHIR Bundle patient access and collection preparation helper"
  },
  {
    path: "apps/api/src/modules/patients/patient-record-bundle-context.types.ts",
    maxLines: 35,
    role: "Patient FHIR Bundle preparation input type contract"
  },
  {
    path: "apps/api/src/modules/patients/patient-record-bundle-consent-context.ts",
    maxLines: 70,
    role: "Patient FHIR Bundle transfer context and consent guard"
  },
  {
    path: "apps/api/src/modules/patients/patient-record-bundle-error-responses.ts",
    maxLines: 90,
    role: "Patient FHIR Bundle error response helpers"
  },
  {
    path: "apps/api/src/modules/patients/patient-record-bundle-transfer-context.ts",
    maxLines: 50,
    role: "Patient FHIR Bundle transfer-context header reader"
  },
  {
    path: "apps/api/src/modules/patients/patient-record-bundle-collections.ts",
    maxLines: 180,
    role: "Patient FHIR Bundle collection loading and audit metadata"
  },
  {
    path: "apps/api/src/modules/patients/patient-identifier-conflict.ts",
    maxLines: 90,
    role: "Patient identifier conflict audit and response helper"
  },
  {
    path: "apps/api/src/modules/patients/patient-response.ts",
    maxLines: 20,
    role: "Patient response DTO mapper"
  },
  {
    path: "apps/api/src/modules/patients/patient-route-helpers.ts",
    maxLines: 20,
    role: "Patient route helper compatibility barrel"
  },
  {
    path: "apps/api/src/modules/clinical-documents/clinical-document-routes.ts",
    maxLines: 80,
    role: "ClinicalDocument route composition root"
  },
  {
    path: "apps/api/src/modules/clinical-documents/clinical-document-query-routes.ts",
    maxLines: 90,
    role: "ClinicalDocument list route adapter"
  },
  {
    path: "apps/api/src/modules/clinical-documents/clinical-document-creation-routes.ts",
    maxLines: 130,
    role: "ClinicalDocument creation command route adapter"
  },
  {
    path: "apps/api/src/modules/clinical-documents/clinical-document-command-routes.ts",
    maxLines: 120,
    role: "ClinicalDocument sign command route adapter"
  },
  {
    path: "apps/api/src/modules/clinical-documents/clinical-document-fhir-routes.ts",
    maxLines: 50,
    role: "ClinicalDocument FHIR route composition root"
  },
  {
    path: "apps/api/src/modules/clinical-documents/clinical-document-fhir-resource-routes.ts",
    maxLines: 100,
    role: "ClinicalDocument FHIR DocumentReference export route adapter"
  },
  {
    path: "apps/api/src/modules/clinical-documents/clinical-document-provenance-routes.ts",
    maxLines: 110,
    role: "ClinicalDocument FHIR Provenance export route adapter"
  },
  {
    path: "apps/api/src/modules/clinical-documents/clinical-document-route-helpers.ts",
    maxLines: 30,
    role: "ClinicalDocument response mapper"
  },
  {
    path: "apps/api/src/modules/clinical-documents/clinical-document-reference-validation.ts",
    maxLines: 70,
    role: "ClinicalDocument encounter reference validation helper"
  },
  {
    path: "apps/api/src/modules/medication-administrations/medication-administration-routes.ts",
    maxLines: 70,
    role: "MedicationAdministration route composition root"
  },
  {
    path: "apps/api/src/modules/medication-administrations/medication-administration-query-routes.ts",
    maxLines: 130,
    role: "MedicationAdministration list and read route adapter"
  },
  {
    path: "apps/api/src/modules/medication-administrations/medication-administration-creation-routes.ts",
    maxLines: 140,
    role: "MedicationAdministration creation command route adapter"
  },
  {
    path: "apps/api/src/modules/medication-administrations/medication-administration-fhir-routes.ts",
    maxLines: 90,
    role: "MedicationAdministration FHIR export route adapter"
  },
  {
    path: "apps/api/src/modules/medication-administrations/medication-administration-route-helpers.ts",
    maxLines: 30,
    role: "MedicationAdministration response mapper"
  },
  {
    path: "apps/api/src/modules/medication-administrations/medication-administration-reference-validation.ts",
    maxLines: 90,
    role: "MedicationAdministration clinical reference validation helper"
  },
  {
    path: "apps/api/src/modules/medication-dispenses/medication-dispense-routes.ts",
    maxLines: 70,
    role: "MedicationDispense route composition root"
  },
  {
    path: "apps/api/src/modules/medication-dispenses/medication-dispense-query-routes.ts",
    maxLines: 130,
    role: "MedicationDispense list and read route adapter"
  },
  {
    path: "apps/api/src/modules/medication-dispenses/medication-dispense-creation-routes.ts",
    maxLines: 130,
    role: "MedicationDispense creation command route adapter"
  },
  {
    path: "apps/api/src/modules/medication-dispenses/medication-dispense-fhir-routes.ts",
    maxLines: 90,
    role: "MedicationDispense FHIR export route adapter"
  },
  {
    path: "apps/api/src/modules/medication-dispenses/medication-dispense-route-helpers.ts",
    maxLines: 30,
    role: "MedicationDispense response mapper"
  },
  {
    path: "apps/api/src/modules/medication-dispenses/medication-dispense-reference-validation.ts",
    maxLines: 80,
    role: "MedicationDispense clinical reference validation helper"
  },
  {
    path: "apps/api/src/modules/medication-requests/medication-request-routes.ts",
    maxLines: 70,
    role: "MedicationRequest route composition root"
  },
  {
    path: "apps/api/src/modules/medication-requests/medication-request-query-routes.ts",
    maxLines: 130,
    role: "MedicationRequest list and read route adapter"
  },
  {
    path: "apps/api/src/modules/medication-requests/medication-request-creation-routes.ts",
    maxLines: 130,
    role: "MedicationRequest creation command route adapter"
  },
  {
    path: "apps/api/src/modules/medication-requests/medication-request-fhir-routes.ts",
    maxLines: 90,
    role: "MedicationRequest FHIR export route adapter"
  },
  {
    path: "apps/api/src/modules/medication-requests/medication-request-route-helpers.ts",
    maxLines: 30,
    role: "MedicationRequest response mapper"
  },
  {
    path: "apps/api/src/modules/medication-requests/medication-request-reference-validation.ts",
    maxLines: 80,
    role: "MedicationRequest clinical reference validation helper"
  },
  {
    path: "apps/api/src/modules/procedures/procedure-routes.ts",
    maxLines: 80,
    role: "Procedure route composition root"
  },
  {
    path: "apps/api/src/modules/procedures/procedure-query-routes.ts",
    maxLines: 120,
    role: "Procedure query and read route adapter"
  },
  {
    path: "apps/api/src/modules/procedures/procedure-creation-routes.ts",
    maxLines: 140,
    role: "Procedure creation command route adapter"
  },
  {
    path: "apps/api/src/modules/procedures/procedure-fhir-routes.ts",
    maxLines: 90,
    role: "Procedure FHIR export route adapter"
  },
  {
    path: "apps/api/src/modules/procedures/procedure-route-helpers.ts",
    maxLines: 20,
    role: "Procedure route helper compatibility barrel"
  },
  {
    path: "apps/api/src/modules/procedures/procedure-response.ts",
    maxLines: 20,
    role: "Procedure response DTO mapper"
  },
  {
    path: "apps/api/src/modules/procedures/procedure-reference-validation.ts",
    maxLines: 110,
    role: "Procedure clinical reference validation helper"
  },
  {
    path: "apps/api/src/modules/procedures/procedure-report-reference-validation.ts",
    maxLines: 60,
    role: "Procedure report reference validation helper"
  },
  {
    path: "apps/api/src/modules/diagnostic-reports/diagnostic-report-routes.ts",
    maxLines: 70,
    role: "DiagnosticReport route composition root"
  },
  {
    path: "apps/api/src/modules/diagnostic-reports/diagnostic-report-query-routes.ts",
    maxLines: 130,
    role: "DiagnosticReport list and read route adapter"
  },
  {
    path: "apps/api/src/modules/diagnostic-reports/diagnostic-report-creation-routes.ts",
    maxLines: 140,
    role: "DiagnosticReport creation command route adapter"
  },
  {
    path: "apps/api/src/modules/diagnostic-reports/diagnostic-report-fhir-routes.ts",
    maxLines: 90,
    role: "DiagnosticReport FHIR export route adapter"
  },
  {
    path: "apps/api/src/modules/diagnostic-reports/diagnostic-report-route-helpers.ts",
    maxLines: 90,
    role: "DiagnosticReport response, access and domain error helpers"
  },
  {
    path: "apps/api/src/modules/diagnostic-reports/diagnostic-report-reference-validation.ts",
    maxLines: 90,
    role: "DiagnosticReport clinical reference validation helper"
  },
  {
    path: "apps/api/src/modules/imaging-studies/imaging-study-routes.ts",
    maxLines: 70,
    role: "ImagingStudy route composition root"
  },
  {
    path: "apps/api/src/modules/imaging-studies/imaging-study-query-routes.ts",
    maxLines: 130,
    role: "ImagingStudy list and read route adapter"
  },
  {
    path: "apps/api/src/modules/imaging-studies/imaging-study-creation-routes.ts",
    maxLines: 140,
    role: "ImagingStudy creation command route adapter"
  },
  {
    path: "apps/api/src/modules/imaging-studies/imaging-study-fhir-routes.ts",
    maxLines: 90,
    role: "ImagingStudy FHIR export route adapter"
  },
  {
    path: "apps/api/src/modules/imaging-studies/imaging-study-route-helpers.ts",
    maxLines: 90,
    role: "ImagingStudy response, access and domain error helpers"
  },
  {
    path: "apps/api/src/modules/imaging-studies/imaging-study-reference-validation.ts",
    maxLines: 90,
    role: "ImagingStudy clinical reference validation helper"
  },
  {
    path: "apps/api/src/modules/service-requests/service-request-routes.ts",
    maxLines: 70,
    role: "ServiceRequest route composition root"
  },
  {
    path: "apps/api/src/modules/service-requests/service-request-query-routes.ts",
    maxLines: 130,
    role: "ServiceRequest list and read route adapter"
  },
  {
    path: "apps/api/src/modules/service-requests/service-request-creation-routes.ts",
    maxLines: 140,
    role: "ServiceRequest creation command route adapter"
  },
  {
    path: "apps/api/src/modules/service-requests/service-request-fhir-routes.ts",
    maxLines: 90,
    role: "ServiceRequest FHIR export route adapter"
  },
  {
    path: "apps/api/src/modules/service-requests/service-request-route-helpers.ts",
    maxLines: 90,
    role: "ServiceRequest response, access and domain error helpers"
  },
  {
    path: "apps/api/src/modules/service-requests/service-request-reference-validation.ts",
    maxLines: 90,
    role: "ServiceRequest clinical reference validation helper"
  },
  {
    path: "apps/api/src/modules/workflow-tasks/workflow-task-routes.ts",
    maxLines: 70,
    role: "WorkflowTask route composition root"
  },
  {
    path: "apps/api/src/modules/workflow-tasks/workflow-task-query-routes.ts",
    maxLines: 130,
    role: "WorkflowTask list and read route adapter"
  },
  {
    path: "apps/api/src/modules/workflow-tasks/workflow-task-creation-routes.ts",
    maxLines: 140,
    role: "WorkflowTask creation command route adapter"
  },
  {
    path: "apps/api/src/modules/workflow-tasks/workflow-task-fhir-routes.ts",
    maxLines: 90,
    role: "WorkflowTask FHIR export route adapter"
  },
  {
    path: "apps/api/src/modules/workflow-tasks/workflow-task-route-helpers.ts",
    maxLines: 90,
    role: "WorkflowTask response, access and domain error helpers"
  },
  {
    path: "apps/api/src/modules/workflow-tasks/workflow-task-reference-validation.ts",
    maxLines: 90,
    role: "WorkflowTask clinical reference validation helper"
  }
];

const apiRoutesPath = resolve("apps/api/src/modules/http/api-routes.ts");
const forbiddenApiRoutesPatterns = [
  {
    pattern:
      /\bregister(?:Auth|Patient|ProviderDirectory|Consent|RecordTransfer|Encounter|AllergyIntolerance|Condition|Observation|MedicationRequest|MedicationDispense|MedicationAdministration|ServiceRequest|WorkflowTask|Procedure|DiagnosticReport|ImagingStudy|ClinicalDocument|AuditEvent)Routes\b/,
    message:
      "HTTP API root should only register system routes and delegate domain route wiring to api-domain-routes.ts."
  }
];

const systemRoutesPath = resolve("apps/api/src/modules/http/system-routes.ts");
const forbiddenSystemRoutePatterns = [
  {
    pattern: /\bapp\.get\b|\bapi\.get\b/,
    message:
      "System route handlers belong in system-health-routes.ts, system-readiness-routes.ts or system-api-runtime-routes.ts."
  },
  {
    pattern:
      /\bbuildApiRuntimeInfo\b|\breadActorContext\b|\bbuildWiiiCareCapabilityStatement\b|\breadRepositoryName\b/,
    message:
      "System runtime metadata and diagnostics policy belong outside system-routes.ts."
  },
  {
    pattern: /\bfindAll\b|\bfindDirectory\b|\bloginRateLimiter\.check\b/,
    message:
      "System readiness dependency checks belong in system-readiness-routes.ts."
  }
];
const requiredSystemRegistrations = [
  "registerHealthRoutes",
  "registerReadinessRoutes",
  "registerApiRuntimeRoutes"
];

const httpBoundaryPath = resolve("apps/api/src/modules/http/http-boundary.ts");
const forbiddenHttpBoundaryPatterns = [
  {
    pattern: /\bapp\.addHook\b|\bapp\.setErrorHandler\b/,
    message:
      "HTTP boundary hooks belong in dedicated request-id, security-header, error-handler or error-payload modules."
  },
  {
    pattern:
      /\brandomUUID\b|\bZodError\b|\bbuildFhirOperationOutcome\b|\bacceptsFhirJson\b|\bhasFhirContentType\b|\binjectRequestIdIntoErrorPayload\b|\breadPayloadText\b/,
    message:
      "HTTP boundary policy details must stay outside http-boundary.ts; keep the root as composition only."
  }
];
const requiredHttpBoundaryRegistrations = [
  "createRequestId",
  "registerSecurityHeaderHook",
  "registerHttpErrorHandler",
  "registerRequestIdErrorPayloadHook"
];
const httpDomainErrorResponsePath = resolve(
  "apps/api/src/modules/http/http-domain-error-response.ts"
);
const requiredHttpDomainErrorResponseHelpers = [
  "sendDomainErrorResponse",
  "DomainError",
  "status(422)"
];
const httpValidationErrorResponsePath = resolve(
  "apps/api/src/modules/http/http-validation-error-response.ts"
);
const requiredHttpValidationErrorResponseHelpers = [
  "sendValidationErrorResponse",
  "HttpValidationErrorResponse",
  "status(422)"
];
const httpNotFoundErrorResponsePath = resolve(
  "apps/api/src/modules/http/http-not-found-error-response.ts"
);
const requiredHttpNotFoundErrorResponseHelpers = [
  "sendNotFoundErrorResponse",
  "status(404)",
  "message"
];
const httpJsonErrorResponsePath = resolve(
  "apps/api/src/modules/http/http-json-error-response.ts"
);
const requiredHttpJsonErrorResponseHelpers = [
  "sendJsonErrorResponse",
  "HttpJsonErrorPayload",
  "requestId"
];
const standardizedJsonErrorRoutePaths = [
  {
    path: resolve("apps/api/src/modules/auth/auth-login-routes.ts"),
    label: "Auth login route"
  },
  {
    path: resolve("apps/api/src/modules/auth/auth-session-routes.ts"),
    label: "Auth session route"
  },
  {
    path: resolve("apps/api/src/modules/access-control/access-permission-responses.ts"),
    label: "Access permission responses"
  },
  {
    path: resolve(
      "apps/api/src/modules/access-control/patient-record-access-responses.ts"
    ),
    label: "Patient record access responses"
  },
  {
    path: resolve(
      "apps/api/src/modules/record-transfers/record-transfer-creation-routes.ts"
    ),
    label: "RecordTransfer creation route"
  },
  {
    path: resolve(
      "apps/api/src/modules/record-transfers/record-transfer-acknowledgement-responses.ts"
    ),
    label: "RecordTransfer acknowledgement responses"
  },
  {
    path: resolve("apps/api/src/modules/patients/patient-identifier-conflict.ts"),
    label: "Patient identifier conflict helper"
  }
];
const standardizedRequestIdNotFoundRoutePaths = [
  {
    path: resolve("apps/api/src/modules/patients/patient-merge-routes.ts"),
    label: "Patient merge route"
  },
  {
    path: resolve(
      "apps/api/src/modules/access-control/patient-record-access-responses.ts"
    ),
    label: "Patient record access responses"
  }
];
const standardizedDomainErrorRoutePaths = [
  {
    path: resolve(
      "apps/api/src/modules/medication-requests/medication-request-creation-routes.ts"
    ),
    label: "MedicationRequest creation route"
  },
  {
    path: resolve(
      "apps/api/src/modules/medication-dispenses/medication-dispense-creation-routes.ts"
    ),
    label: "MedicationDispense creation route"
  },
  {
    path: resolve(
      "apps/api/src/modules/medication-administrations/medication-administration-creation-routes.ts"
    ),
    label: "MedicationAdministration creation route"
  },
  {
    path: resolve(
      "apps/api/src/modules/clinical-documents/clinical-document-creation-routes.ts"
    ),
    label: "ClinicalDocument creation route"
  },
  {
    path: resolve(
      "apps/api/src/modules/clinical-documents/clinical-document-command-routes.ts"
    ),
    label: "ClinicalDocument command route"
  },
  {
    path: resolve("apps/api/src/modules/procedures/procedure-creation-routes.ts"),
    label: "Procedure creation route"
  },
  {
    path: resolve("apps/api/src/modules/patients/patient-registry-routes.ts"),
    label: "Patient registry route"
  },
  {
    path: resolve("apps/api/src/modules/patients/patient-merge-routes.ts"),
    label: "Patient merge route"
  }
];
const standardizedValidationErrorRoutePaths = [
  {
    path: resolve(
      "apps/api/src/modules/clinical-documents/clinical-document-creation-routes.ts"
    ),
    label: "ClinicalDocument creation route"
  },
  {
    path: resolve("apps/api/src/modules/conditions/condition-creation-routes.ts"),
    label: "Condition creation route"
  },
  {
    path: resolve(
      "apps/api/src/modules/allergy-intolerances/allergy-intolerance-creation-routes.ts"
    ),
    label: "AllergyIntolerance creation route"
  },
  {
    path: resolve(
      "apps/api/src/modules/diagnostic-reports/diagnostic-report-creation-routes.ts"
    ),
    label: "DiagnosticReport creation route"
  },
  {
    path: resolve("apps/api/src/modules/workflow-tasks/workflow-task-creation-routes.ts"),
    label: "WorkflowTask creation route"
  },
  {
    path: resolve(
      "apps/api/src/modules/medication-requests/medication-request-creation-routes.ts"
    ),
    label: "MedicationRequest creation route"
  },
  {
    path: resolve(
      "apps/api/src/modules/medication-administrations/medication-administration-creation-routes.ts"
    ),
    label: "MedicationAdministration creation route"
  },
  {
    path: resolve(
      "apps/api/src/modules/service-requests/service-request-creation-routes.ts"
    ),
    label: "ServiceRequest creation route"
  },
  {
    path: resolve("apps/api/src/modules/imaging-studies/imaging-study-creation-routes.ts"),
    label: "ImagingStudy creation route"
  },
  {
    path: resolve(
      "apps/api/src/modules/medication-dispenses/medication-dispense-creation-routes.ts"
    ),
    label: "MedicationDispense creation route"
  },
  {
    path: resolve("apps/api/src/modules/procedures/procedure-creation-routes.ts"),
    label: "Procedure creation route"
  },
  {
    path: resolve("apps/api/src/modules/observations/observation-creation-routes.ts"),
    label: "Observation creation route"
  },
  {
    path: resolve(
      "apps/api/src/modules/record-transfers/record-transfer-creation-routes.ts"
    ),
    label: "RecordTransfer creation route"
  },
  {
    path: resolve("apps/api/src/modules/record-transfers/record-transfer-send-routes.ts"),
    label: "RecordTransfer send route"
  }
];
const standardizedNotFoundErrorRoutePaths = [
  {
    path: resolve("apps/api/src/modules/encounters/encounter-route-helpers.ts"),
    label: "Encounter route helper"
  },
  {
    path: resolve("apps/api/src/modules/observations/observation-route-helpers.ts"),
    label: "Observation route helper"
  },
  {
    path: resolve("apps/api/src/modules/conditions/condition-route-helpers.ts"),
    label: "Condition route helper"
  },
  {
    path: resolve(
      "apps/api/src/modules/allergy-intolerances/allergy-intolerance-route-helpers.ts"
    ),
    label: "AllergyIntolerance route helper"
  },
  {
    path: resolve("apps/api/src/modules/consents/consent-route-helpers.ts"),
    label: "Consent route helper"
  },
  {
    path: resolve(
      "apps/api/src/modules/diagnostic-reports/diagnostic-report-route-helpers.ts"
    ),
    label: "DiagnosticReport route helper"
  },
  {
    path: resolve("apps/api/src/modules/imaging-studies/imaging-study-route-helpers.ts"),
    label: "ImagingStudy route helper"
  },
  {
    path: resolve("apps/api/src/modules/service-requests/service-request-route-helpers.ts"),
    label: "ServiceRequest route helper"
  },
  {
    path: resolve("apps/api/src/modules/workflow-tasks/workflow-task-route-helpers.ts"),
    label: "WorkflowTask route helper"
  },
  {
    path: resolve(
      "apps/api/src/modules/record-transfers/record-transfer-route-access.ts"
    ),
    label: "RecordTransfer patient access helper"
  },
  {
    path: resolve(
      "apps/api/src/modules/record-transfers/record-transfer-acknowledgement-handler.ts"
    ),
    label: "RecordTransfer acknowledgement handler"
  },
  {
    path: resolve(
      "apps/api/src/modules/patients/patient-record-bundle-error-responses.ts"
    ),
    label: "Patient record Bundle error responses"
  },
  {
    path: resolve(
      "apps/api/src/modules/clinical-documents/clinical-document-provenance-routes.ts"
    ),
    label: "ClinicalDocument Provenance route"
  },
  {
    path: resolve(
      "apps/api/src/modules/medication-requests/medication-request-query-routes.ts"
    ),
    label: "MedicationRequest query route"
  },
  {
    path: resolve(
      "apps/api/src/modules/medication-requests/medication-request-fhir-routes.ts"
    ),
    label: "MedicationRequest FHIR route"
  },
  {
    path: resolve(
      "apps/api/src/modules/medication-dispenses/medication-dispense-query-routes.ts"
    ),
    label: "MedicationDispense query route"
  },
  {
    path: resolve(
      "apps/api/src/modules/medication-dispenses/medication-dispense-fhir-routes.ts"
    ),
    label: "MedicationDispense FHIR route"
  },
  {
    path: resolve(
      "apps/api/src/modules/medication-administrations/medication-administration-query-routes.ts"
    ),
    label: "MedicationAdministration query route"
  },
  {
    path: resolve(
      "apps/api/src/modules/medication-administrations/medication-administration-fhir-routes.ts"
    ),
    label: "MedicationAdministration FHIR route"
  },
  {
    path: resolve("apps/api/src/modules/procedures/procedure-query-routes.ts"),
    label: "Procedure query route"
  },
  {
    path: resolve("apps/api/src/modules/procedures/procedure-fhir-routes.ts"),
    label: "Procedure FHIR route"
  }
];
const standardizedDomainErrorHelperPaths = [
  {
    path: resolve(
      "apps/api/src/modules/diagnostic-reports/diagnostic-report-route-helpers.ts"
    ),
    label: "DiagnosticReport route helper"
  },
  {
    path: resolve("apps/api/src/modules/imaging-studies/imaging-study-route-helpers.ts"),
    label: "ImagingStudy route helper"
  },
  {
    path: resolve("apps/api/src/modules/consents/consent-route-helpers.ts"),
    label: "Consent route helper"
  },
  {
    path: resolve(
      "apps/api/src/modules/record-transfers/record-transfer-command-route-helpers.ts"
    ),
    label: "RecordTransfer command route helper"
  },
  {
    path: resolve("apps/api/src/modules/encounters/encounter-route-helpers.ts"),
    label: "Encounter route helper"
  },
  {
    path: resolve(
      "apps/api/src/modules/allergy-intolerances/allergy-intolerance-route-helpers.ts"
    ),
    label: "AllergyIntolerance route helper"
  },
  {
    path: resolve("apps/api/src/modules/service-requests/service-request-route-helpers.ts"),
    label: "ServiceRequest route helper"
  },
  {
    path: resolve("apps/api/src/modules/workflow-tasks/workflow-task-route-helpers.ts"),
    label: "WorkflowTask route helper"
  },
  {
    path: resolve("apps/api/src/modules/conditions/condition-route-helpers.ts"),
    label: "Condition route helper"
  },
  {
    path: resolve("apps/api/src/modules/observations/observation-route-helpers.ts"),
    label: "Observation route helper"
  }
];
const forbiddenStandardizedDomainErrorHelperPatterns = [
  {
    pattern: /\binstanceof DomainError\b/,
    message: "must delegate DomainError matching to sendDomainErrorResponse."
  },
  {
    pattern: /\bstatus\(422\)\.send\b/,
    message: "must not send a local 422 DomainError envelope."
  },
  {
    pattern:
      /import\s+\{[\s\S]*?\bDomainError\b[\s\S]*?\}\s+from\s+"@benh-vien-so\/domain"/,
    message: "must not import DomainError from the domain package directly."
  }
];

const apiDomainRoutesPath = resolve("apps/api/src/modules/http/api-domain-routes.ts");
const requiredApiDomainRegistrations = [
  "registerApiIdentityRoutes",
  "registerApiInteroperabilityRoutes",
  "registerApiClinicalRoutes",
  "registerApiMedicationRoutes",
  "registerApiCareWorkflowRoutes",
  "registerApiDiagnosticRoutes",
  "registerApiDocumentRoutes",
  "registerApiAuditRoutes"
];

const providerDirectoryRoutesPath = resolve(
  "apps/api/src/modules/provider-directory/provider-directory-routes.ts"
);
const forbiddenProviderDirectoryRoutePatterns = [
  {
    pattern: /\bProviderDirectoryResourceParamsSchema\b/,
    message:
      "ProviderDirectory request handling belongs in provider-directory-fhir-routes.ts."
  },
  {
    pattern: /\brecordAuditEvent\b|\bsendFhirOperationOutcome\b/,
    message:
      "ProviderDirectory audit and OperationOutcome policy belongs outside the root route."
  },
  {
    pattern:
      /\bmapProviderDirectoryToFhirBundle\b|\bmapProvider(?:Organization|Practitioner|PractitionerRole|Endpoint)ToFhir\b|\bfindProviderDirectoryResource\b/,
    message:
      "ProviderDirectory FHIR mapping and resource lookup belong in FHIR route or helper modules."
  }
];
const requiredProviderDirectoryRegistrations = [
  "registerProviderDirectoryQueryRoutes",
  "registerProviderDirectoryFhirRoutes"
];

const authRoutesPath = resolve("apps/api/src/modules/auth/auth-routes.ts");
const forbiddenAuthRoutePatterns = [
  {
    pattern:
      /\bLoginRequestSchema\b|\bverifyPassword\b|\bdemoAccounts\b|\bdummyPasswordHash\b/,
    message:
      "Auth login parsing, credential checks and demo account catalog belong outside auth-routes.ts."
  },
  {
    pattern: /\bcreateAccessToken\b|\bverifyAccessToken\b|\breadBearerToken\b/,
    message:
      "Auth token creation and bearer session handling belong in login/session route modules."
  },
  {
    pattern: /\brecordLoginAuditEvent\b|\bhashLoginUsername\b|\breadUsernameHash\b/,
    message:
      "Auth login audit and username hashing belong in auth-login-audit.ts."
  }
];
const requiredAuthRegistrations = [
  "registerAuthLoginRoutes",
  "registerAuthSessionRoutes"
];

const auditEventRoutesPath = resolve(
  "apps/api/src/modules/audit-events/audit-event-routes.ts"
);
const forbiddenAuditEventRoutePatterns = [
  {
    pattern: /\bAuditEventsQuerySchema\b|\bPatientAuditEventsParamsSchema\b/,
    message:
      "AuditEvent request handling belongs in audit-event-query-routes.ts, audit-event-integrity-routes.ts or audit-event-fhir-routes.ts."
  },
  {
    pattern:
      /\brecordAuditEvent\b|\brequirePatientRecordAccessByPatientId\b|\bverifyPatientIntegrity\b/,
    message:
      "AuditEvent audit write, access and integrity policy belongs outside the root route."
  },
  {
    pattern: /\bmapAuditEventsToFhirBundle\b|\btoAuditEventResponse\b/,
    message:
      "AuditEvent response and FHIR export details belong in helper or FHIR route modules."
  }
];
const requiredAuditEventRegistrations = [
  "registerAuditEventQueryRoutes",
  "registerAuditEventIntegrityRoutes",
  "registerAuditEventFhirRoutes"
];

const consentRoutesPath = resolve("apps/api/src/modules/consents/consent-routes.ts");
const forbiddenConsentRoutePatterns = [
  {
    pattern:
      /\bCreateConsentRequestSchema\b|\bRevokeConsentRequestSchema\b|\bPatientConsent(?:s)?ParamsSchema\b|\bConsentIdParamsSchema\b/,
    message:
      "Consent request handling belongs in consent query, creation, command or FHIR route modules."
  },
  {
    pattern:
      /\bConsent\.grant\b|\bDomainError\b|\brequirePatientRecordAccessByPatientId\b|\bsendFhirOperationOutcome\b/,
    message:
      "Consent grant, access, OperationOutcome and domain error policy belongs outside the root route."
  },
  {
    pattern: /\bmapConsentToFhir\b|\btoConsentResponse\b|\brevoke\b/,
    message:
      "Consent response, revoke and FHIR export details belong in helper or lifecycle route modules."
  }
];
const requiredConsentRegistrations = [
  "registerConsentQueryRoutes",
  "registerConsentCreationRoutes",
  "registerConsentCommandRoutes",
  "registerConsentFhirRoutes"
];

const recordTransferRoutesPath = resolve(
  "apps/api/src/modules/record-transfers/record-transfer-routes.ts"
);
const forbiddenRecordTransferRoutePatterns = [
  {
    pattern: /\bCreateRecordTransferRequestSchema\b/,
    message:
      "RecordTransfer creation policy belongs in record-transfer-creation-routes.ts."
  },
  {
    pattern:
      /\bMarkRecordTransfer(?:Sent|Received|Failed)RequestSchema\b|\bRetryRecordTransferRequestSchema\b/,
    message:
      "RecordTransfer lifecycle commands belong in record-transfer-command-routes.ts."
  },
  {
    pattern: /\bRecordTransferAcknowledgementCallbackRequestSchema\b/,
    message:
      "RecordTransfer acknowledgement callbacks belong in record-transfer-acknowledgement-routes.ts."
  },
  {
    pattern: /\bvalidateRecordTransferEndpointForDelivery\b/,
    message:
      "Endpoint delivery policy should stay with creation/send command route modules."
  },
  {
    pattern: /\bqueueRecordTransferDeliveryAttempt\b/,
    message:
      "Delivery attempt queueing should stay with record-transfer-command-routes.ts."
  }
];
const requiredRecordTransferRegistrations = [
  "registerRecordTransferQueryRoutes",
  "registerRecordTransferCreationRoutes",
  "registerRecordTransferCommandRoutes",
  "registerRecordTransferAcknowledgementRoutes",
  "registerRecordTransferFhirRoutes"
];

const recordTransferCreationRoutesPath = resolve(
  "apps/api/src/modules/record-transfers/record-transfer-creation-routes.ts"
);
const forbiddenRecordTransferCreationRoutePatterns = [
  {
    pattern: /\bDomainError\b|\bRECORD_TRANSFER_DOMAIN_ERROR\b/,
    message:
      "RecordTransfer creation route should use sendRecordTransferDomainError instead of owning a separate domain-error envelope."
  }
];
const requiredRecordTransferCreationRouteHelpers = [
  "sendRecordTransferDomainError"
];

const recordTransferCommandRoutesPath = resolve(
  "apps/api/src/modules/record-transfers/record-transfer-command-routes.ts"
);
const recordTransferRouteHelpersPath = resolve(
  "apps/api/src/modules/record-transfers/record-transfer-route-helpers.ts"
);
const forbiddenRecordTransferCommandRoutePatterns = [
  {
    pattern:
      /\bMarkRecordTransfer(?:Sent|Received|Failed)RequestSchema\b|\bRetryRecordTransferRequestSchema\b|\bRecordTransferIdParamsSchema\b/,
    message:
      "RecordTransfer command request handling belongs in send, receive or failure route modules."
  },
  {
    pattern:
      /\bvalidateRecordTransferEndpointForDelivery\b|\bqueueRecordTransferDeliveryAttempt\b|\bresolveRecordTransferFhirEndpoint\b/,
    message:
      "RecordTransfer send delivery policy belongs in record-transfer-send-routes.ts."
  },
  {
    pattern: /\bbuildAcknowledgementReference\b|\bmarkReceived\b/,
    message:
      "RecordTransfer receive acknowledgement policy belongs in record-transfer-receive-routes.ts."
  },
  {
    pattern: /\bmarkFailed\b|\bretry\b|\btoFailAuditMetadata\b|\btoRetryAuditMetadata\b/,
    message:
      "RecordTransfer fail and retry policy belongs in record-transfer-failure-routes.ts."
  }
];
const requiredRecordTransferCommandRegistrations = [
  "registerRecordTransferSendRoutes",
  "registerRecordTransferReceiveRoutes",
  "registerRecordTransferFailureRoutes"
];
const forbiddenRecordTransferRouteHelperPatterns = [
  {
    pattern: /\bcanAcknowledgeForRecipient\b|\borganizationIsSameOrChild\b/,
    message:
      "RecordTransfer acknowledgement access policy belongs in record-transfer-acknowledgement-policy.ts."
  },
  {
    pattern: /\bbuildAcknowledgementReference\b/,
    message:
      "RecordTransfer acknowledgement reference generation belongs in record-transfer-acknowledgement-reference.ts."
  },
  {
    pattern: /\btoCallbackSignatureAuditMetadata\b/,
    message:
      "RecordTransfer callback signature audit metadata belongs in the acknowledgement audit modules."
  },
  {
    pattern:
      /\bresolveRecordTransferFhirEndpoint\b|\bfindRecordTransferFhirEndpoint\b/,
    message:
      "RecordTransfer FHIR endpoint lookup belongs in record-transfer-fhir-endpoint-resolver.ts."
  }
];

const recordTransferAcknowledgementRoutesPath = resolve(
  "apps/api/src/modules/record-transfers/record-transfer-acknowledgement-routes.ts"
);
const recordTransferAcknowledgementHandlerPath = resolve(
  "apps/api/src/modules/record-transfers/record-transfer-acknowledgement-handler.ts"
);
const recordTransferAcknowledgementRequestPath = resolve(
  "apps/api/src/modules/record-transfers/record-transfer-acknowledgement-request.ts"
);
const recordTransferAcknowledgementOutcomesPath = resolve(
  "apps/api/src/modules/record-transfers/record-transfer-acknowledgement-outcomes.ts"
);
const recordTransferAcknowledgementCompletedOutcomePath = resolve(
  "apps/api/src/modules/record-transfers/record-transfer-acknowledgement-completed-outcome.ts"
);
const recordTransferAcknowledgementAcceptedOutcomePath = resolve(
  "apps/api/src/modules/record-transfers/record-transfer-acknowledgement-accepted-outcome.ts"
);
const recordTransferAcknowledgementAuditPath = resolve(
  "apps/api/src/modules/record-transfers/record-transfer-acknowledgement-audit.ts"
);
const recordTransferAcknowledgementAuditMetadataPath = resolve(
  "apps/api/src/modules/record-transfers/record-transfer-acknowledgement-audit-metadata.ts"
);
const recordTransferAcknowledgementPolicyPath = resolve(
  "apps/api/src/modules/record-transfers/record-transfer-acknowledgement-policy.ts"
);
const recordTransferAcknowledgementReferencePath = resolve(
  "apps/api/src/modules/record-transfers/record-transfer-acknowledgement-reference.ts"
);
const recordTransferAcknowledgementResponsesPath = resolve(
  "apps/api/src/modules/record-transfers/record-transfer-acknowledgement-responses.ts"
);
const forbiddenRecordTransferAcknowledgementRoutePatterns = [
  {
    pattern:
      /\bRecordTransferAcknowledgementCallbackRequestSchema\b|\bRecordTransferIdParamsSchema\b|\brequirePermission\b|\bverifyRecordTransferCallbackSignature\b/,
    message:
      "RecordTransfer acknowledgement permission belongs in the handler, while request parsing and signature handling belong in record-transfer-acknowledgement-request.ts."
  },
  {
    pattern:
      /\bensureAcknowledgementCallbackAccess\b|\brecordAcceptedAcknowledgementCallbackAudit\b|\brecordDuplicateAcknowledgementCallbackAudit\b|\bmarkReceived\b/,
    message:
      "RecordTransfer acknowledgement callback workflow belongs in the handler and outcome modules."
  },
  {
    pattern: /\btoRecordTransferResponse\b|\bsendRecordTransferDomainError\b/,
    message:
      "RecordTransfer acknowledgement response and domain-error handling belong in the callback handler."
  }
];
const requiredRecordTransferAcknowledgementRegistrations = [
  "handleRecordTransferAcknowledgementCallback"
];
const forbiddenRecordTransferAcknowledgementHandlerPatterns = [
  {
    pattern: /\bcanAcknowledgeForRecipient\b|\bfindDirectory\b/,
    message:
      "RecordTransfer acknowledgement access policy belongs in record-transfer-acknowledgement-policy.ts."
  },
  {
    pattern: /\brecordAuditEvent\b|\btoCallbackSignatureAuditMetadata\b/,
    message:
      "RecordTransfer acknowledgement audit metadata belongs in the acknowledgement audit modules."
  },
  {
    pattern:
      /\brecordAcceptedAcknowledgementCallbackAudit\b|\brecordDuplicateAcknowledgementCallbackAudit\b|\bsendAcknowledgementConflict\b|\btoRecordTransferResponse\b|\bmarkReceived\b/,
    message:
      "RecordTransfer acknowledgement duplicate and accepted outcomes belong in the acknowledgement outcome modules."
  },
  {
    pattern:
      /\bRecordTransferAcknowledgementCallbackRequestSchema\b|\bRecordTransferIdParamsSchema\b|\bverifyRecordTransferCallbackSignature\b/,
    message:
      "RecordTransfer acknowledgement request parsing and signature verification belong in record-transfer-acknowledgement-request.ts."
  }
];
const forbiddenRecordTransferAcknowledgementPolicyPatterns = [
  {
    pattern:
      /\breply\.status\b|\bsignatureVerification\.statusCode\b|\bRECORD_TRANSFER_ALREADY_COMPLETED\b|\btoAcknowledgementActor\b/,
    message:
      "RecordTransfer acknowledgement HTTP response envelopes belong in record-transfer-acknowledgement-responses.ts."
  }
];
const requiredRecordTransferAcknowledgementPolicyHelpers = [
  "sendAcknowledgementForbidden",
  "canAcknowledgeForRecipient"
];
const requiredRecordTransferAcknowledgementAuditHelpers = [
  "recordDuplicateAcknowledgementCallbackAudit",
  "recordAcceptedAcknowledgementCallbackAudit"
];
const requiredRecordTransferAcknowledgementAuditMetadataHelpers = [
  "toAcknowledgementCallbackAuditMetadata",
  "toCallbackSignatureAuditMetadata"
];
const requiredRecordTransferAcknowledgementReferenceHelpers = [
  "buildAcknowledgementReference"
];
const forbiddenRecordTransferAcknowledgementResponsePatterns = [
  {
    pattern: /\bfindDirectory\b|\bcanAcknowledgeForRecipient\b|\bmarkReceived\b|\brecordAuditEvent\b/,
    message:
      "RecordTransfer acknowledgement responses must stay transport-only; access, lifecycle transitions and audit belong in their own modules."
  },
  {
    pattern: /\breply\.status\b/,
    message:
      "RecordTransfer acknowledgement responses must use sendJsonErrorResponse so request-id JSON envelopes stay centralized."
  }
];
const requiredRecordTransferAcknowledgementResponseHelpers = [
  "sendAcknowledgementForbidden",
  "sendAcknowledgementSignatureFailure",
  "sendAcknowledgementConflict",
  "sendJsonErrorResponse",
  "toAcknowledgementActor"
];
const requiredRecordTransferAcknowledgementHandlerHelpers = [
  "ensureAcknowledgementCallbackAccess",
  "sendAcknowledgementSignatureFailure",
  "parseRecordTransferAcknowledgementCallbackRequest",
  "handleCompletedAcknowledgementCallback",
  "acceptRecordTransferAcknowledgementCallback"
];
const requiredRecordTransferAcknowledgementRequestHelpers = [
  "RecordTransferAcknowledgementCallbackRequestSchema",
  "RecordTransferIdParamsSchema",
  "verifyRecordTransferCallbackSignature"
];
const requiredRecordTransferAcknowledgementOutcomeExports = [
  "acceptRecordTransferAcknowledgementCallback",
  "handleCompletedAcknowledgementCallback"
];
const requiredRecordTransferAcknowledgementCompletedOutcomeHelpers = [
  "recordDuplicateAcknowledgementCallbackAudit",
  "sendAcknowledgementConflict",
  "toRecordTransferResponse"
];
const requiredRecordTransferAcknowledgementAcceptedOutcomeHelpers = [
  "recordAcceptedAcknowledgementCallbackAudit",
  "markReceived",
  "toRecordTransferResponse"
];

const encounterRoutesPath = resolve("apps/api/src/modules/encounters/encounter-routes.ts");
const forbiddenEncounterRoutePatterns = [
  {
    pattern:
      /\bCreateEncounterRequestSchema\b|\bPatientEncountersParamsSchema\b|\bEncounterIdParamsSchema\b/,
    message:
      "Encounter request handling belongs in encounter-query-routes.ts, encounter-creation-routes.ts, encounter-command-routes.ts or encounter-fhir-routes.ts."
  },
  {
    pattern: /\bEncounter\.create\b|\bDomainError\b|\brequirePatientRecordAccessByPatientId\b/,
    message:
      "Encounter creation, access and domain error policy belongs outside the root route."
  },
  {
    pattern: /\bmapEncounterToFhir\b|\btoEncounterResponse\b/,
    message:
      "Encounter response and FHIR export details belong in helper or FHIR route modules."
  }
];
const requiredEncounterRegistrations = [
  "registerEncounterQueryRoutes",
  "registerEncounterCreationRoutes",
  "registerEncounterCommandRoutes",
  "registerEncounterFhirRoutes"
];

const observationRoutesPath = resolve(
  "apps/api/src/modules/observations/observation-routes.ts"
);
const observationRouteHelpersPath = resolve(
  "apps/api/src/modules/observations/observation-route-helpers.ts"
);
const observationReferenceValidationPath = resolve(
  "apps/api/src/modules/observations/observation-reference-validation.ts"
);
const forbiddenObservationRoutePatterns = [
  {
    pattern:
      /\bCreateObservationRequestSchema\b|\bPatientObservationsParamsSchema\b|\bObservationIdParamsSchema\b/,
    message:
      "Observation request handling belongs in observation-query-routes.ts, observation-creation-routes.ts or observation-fhir-routes.ts."
  },
  {
    pattern:
      /\bObservation\.record\b|\bDomainError\b|\brequirePatientRecordAccessByPatientId\b|\bvalidateObservationReferences\b/,
    message:
      "Observation recording, access and encounter validation policy belongs outside the root route."
  },
  {
    pattern: /\bmapObservationToFhir\b|\btoObservationResponse\b/,
    message:
      "Observation response and FHIR export details belong in helper or FHIR route modules."
  }
];
const requiredObservationRegistrations = [
  "registerObservationQueryRoutes",
  "registerObservationCreationRoutes",
  "registerObservationFhirRoutes"
];
const forbiddenObservationRouteHelperPatterns = [
  {
    pattern: /\bvalidateObservationReferences\b|\bEncounterRepository\b/,
    message:
      "Observation encounter reference validation belongs in observation-reference-validation.ts."
  }
];
const requiredObservationReferenceValidationHelpers = [
  "validateObservationReferences",
  "ENCOUNTER_MISMATCH"
];

const conditionRoutesPath = resolve("apps/api/src/modules/conditions/condition-routes.ts");
const conditionRouteHelpersPath = resolve(
  "apps/api/src/modules/conditions/condition-route-helpers.ts"
);
const conditionReferenceValidationPath = resolve(
  "apps/api/src/modules/conditions/condition-reference-validation.ts"
);
const forbiddenConditionRoutePatterns = [
  {
    pattern:
      /\bCreateConditionRequestSchema\b|\bPatientConditionsParamsSchema\b|\bConditionIdParamsSchema\b/,
    message:
      "Condition request handling belongs in condition-query-routes.ts, condition-creation-routes.ts or condition-fhir-routes.ts."
  },
  {
    pattern:
      /\bCondition\.record\b|\bDomainError\b|\brequirePatientRecordAccessByPatientId\b|\bvalidateConditionReferences\b/,
    message:
      "Condition recording, access and encounter validation policy belongs outside the root route."
  },
  {
    pattern: /\bmapConditionToFhir\b|\btoConditionResponse\b/,
    message:
      "Condition response and FHIR export details belong in helper or FHIR route modules."
  }
];
const requiredConditionRegistrations = [
  "registerConditionQueryRoutes",
  "registerConditionCreationRoutes",
  "registerConditionFhirRoutes"
];
const forbiddenConditionRouteHelperPatterns = [
  {
    pattern: /\bvalidateConditionReferences\b|\bEncounterRepository\b/,
    message:
      "Condition encounter reference validation belongs in condition-reference-validation.ts."
  }
];
const requiredConditionReferenceValidationHelpers = [
  "validateConditionReferences",
  "ENCOUNTER_MISMATCH"
];

const allergyIntoleranceRoutesPath = resolve(
  "apps/api/src/modules/allergy-intolerances/allergy-intolerance-routes.ts"
);
const allergyIntoleranceRouteHelpersPath = resolve(
  "apps/api/src/modules/allergy-intolerances/allergy-intolerance-route-helpers.ts"
);
const allergyIntoleranceReferenceValidationPath = resolve(
  "apps/api/src/modules/allergy-intolerances/allergy-intolerance-reference-validation.ts"
);
const forbiddenAllergyIntoleranceRoutePatterns = [
  {
    pattern:
      /\bCreateAllergyIntoleranceRequestSchema\b|\bPatientAllergyIntolerancesParamsSchema\b|\bAllergyIntoleranceIdParamsSchema\b/,
    message:
      "AllergyIntolerance request handling belongs in allergy-intolerance-query-routes.ts, allergy-intolerance-creation-routes.ts or allergy-intolerance-fhir-routes.ts."
  },
  {
    pattern:
      /\bAllergyIntolerance\.record\b|\bDomainError\b|\brequirePatientRecordAccessByPatientId\b|\bvalidateAllergyIntoleranceReferences\b/,
    message:
      "AllergyIntolerance recording, access and encounter validation policy belongs outside the root route."
  },
  {
    pattern: /\bmapAllergyIntoleranceToFhir\b|\btoAllergyIntoleranceResponse\b/,
    message:
      "AllergyIntolerance response and FHIR export details belong in helper or FHIR route modules."
  }
];
const requiredAllergyIntoleranceRegistrations = [
  "registerAllergyIntoleranceQueryRoutes",
  "registerAllergyIntoleranceCreationRoutes",
  "registerAllergyIntoleranceFhirRoutes"
];
const forbiddenAllergyIntoleranceRouteHelperPatterns = [
  {
    pattern: /\bvalidateAllergyIntoleranceReferences\b|\bEncounterRepository\b/,
    message:
      "AllergyIntolerance encounter reference validation belongs in allergy-intolerance-reference-validation.ts."
  }
];
const requiredAllergyIntoleranceReferenceValidationHelpers = [
  "validateAllergyIntoleranceReferences",
  "ENCOUNTER_MISMATCH"
];

const patientRoutesPath = resolve("apps/api/src/modules/patients/patient-routes.ts");
const forbiddenPatientRoutePatterns = [
  {
    pattern: /\bCreatePatientRequestSchema\b|\bfindPatientIdentifierConflict\b/,
    message:
      "Patient registry list/create policy belongs in patient-registry-routes.ts."
  },
  {
    pattern: /\bMergePatientRequestSchema\b|\bmarkMerged\b/,
    message: "Patient merge commands belong in patient-merge-routes.ts."
  },
  {
    pattern: /\bPatientIdParamsSchema\b|\bsendFhirOperationOutcome\b/,
    message: "Patient read and FHIR endpoint details belong outside patient-routes.ts."
  },
  {
    pattern:
      /\bmapPatientToFhir\b|\bmapPatientRecordToFhirBundle\b|\bmapPatientRecordToFhirDocumentBundle\b/,
    message: "Patient FHIR mapping belongs in patient-fhir-routes.ts."
  }
];
const requiredPatientRegistrations = [
  "registerPatientRegistryRoutes",
  "registerPatientMergeRoutes",
  "registerPatientQueryRoutes",
  "registerPatientFhirRoutes"
];

const patientFhirRoutesPath = resolve("apps/api/src/modules/patients/patient-fhir-routes.ts");
const forbiddenPatientFhirRoutePatterns = [
  {
    pattern:
      /\bmapPatientToFhir\b|\bmapPatientRecordToFhirBundle\b|\bmapPatientRecordToFhirDocumentBundle\b/,
    message:
      "Patient FHIR mapping route handlers belong in patient-fhir-resource-routes.ts or patient-record-bundle-routes.ts."
  },
  {
    pattern: /\bPatientIdParamsSchema\b|\breadBundleTransferContext\b/,
    message:
      "Patient FHIR route request handling belongs outside the patient-fhir-routes.ts composition root."
  }
];
const requiredPatientFhirRegistrations = [
  "registerPatientFhirResourceRoutes",
  "registerPatientRecordBundleRoutes"
];

const patientRecordBundleRoutesPath = resolve(
  "apps/api/src/modules/patients/patient-record-bundle-routes.ts"
);
const forbiddenPatientRecordBundleRoutePatterns = [
  {
    pattern:
      /\bPatientIdParamsSchema\b|\brequirePermission\b|\brecordAuditEvent\b|\bpreparePatientRecordBundleContext\b/,
    message:
      "Patient record Bundle request handling belongs in collection or document Bundle route modules."
  },
  {
    pattern:
      /\bmapPatientRecordToFhirBundle\b|\bmapPatientRecordToFhirDocumentBundle\b|\bbuildPatientRecordBundleAuditMetadata\b/,
    message:
      "Patient record Bundle mapping and audit metadata details belong outside the Bundle route composition root."
  }
];
const requiredPatientRecordBundleRegistrations = [
  "registerPatientFhirBundleCollectionRoutes",
  "registerPatientFhirDocumentBundleRoutes"
];

const patientRecordBundleRouteHelpersPath = resolve(
  "apps/api/src/modules/patients/patient-record-bundle-route-helpers.ts"
);
const patientRecordBundleConsentContextPath = resolve(
  "apps/api/src/modules/patients/patient-record-bundle-consent-context.ts"
);
const forbiddenPatientRecordBundleHelperPatterns = [
  {
    pattern:
      /\bsendFhirOperationOutcome\b|\bPATIENT_NOT_FOUND\b|\bMISSING_BUNDLE_TRANSFER_CONTEXT\b|\bCONSENT_NOT_VALID_FOR_TRANSFER\b/,
    message:
      "Patient Bundle OperationOutcome and error payload details belong in patient-record-bundle-error-responses.ts."
  },
  {
    pattern:
      /\breadBundleTransferContext\b|\bsendMissingTransferContextResponse\b|\bsendInvalidConsentResponse\b|\ballowsRecordSharing\b/,
    message:
      "Patient Bundle transfer context and consent guard belong in patient-record-bundle-consent-context.ts."
  }
];
const requiredPatientRecordBundleHelpers = [
  "requirePatientRecordAccess",
  "preparePatientRecordBundleConsentContext",
  "loadPatientRecordBundleCollections"
];
const requiredPatientRecordBundleConsentContextHelpers = [
  "readBundleTransferContext",
  "sendMissingTransferContextResponse",
  "sendInvalidConsentResponse",
  "allowsRecordSharing"
];

const clinicalDocumentRoutesPath = resolve(
  "apps/api/src/modules/clinical-documents/clinical-document-routes.ts"
);
const clinicalDocumentRouteHelpersPath = resolve(
  "apps/api/src/modules/clinical-documents/clinical-document-route-helpers.ts"
);
const clinicalDocumentReferenceValidationPath = resolve(
  "apps/api/src/modules/clinical-documents/clinical-document-reference-validation.ts"
);
const forbiddenClinicalDocumentRoutePatterns = [
  {
    pattern:
      /\bCreateClinicalDocumentRequestSchema\b|\bPatientDocumentsParamsSchema\b|\bClinicalDocumentIdParamsSchema\b/,
    message:
      "ClinicalDocument request handling belongs in clinical-document-query-routes.ts, clinical-document-creation-routes.ts, clinical-document-command-routes.ts or clinical-document-fhir-routes.ts."
  },
  {
    pattern:
      /\bClinicalDocument\.create\b|\bDomainError\b|\bvalidateClinicalDocumentReferences\b/,
    message:
      "ClinicalDocument creation, signing and validation policy belongs outside the root route."
  },
  {
    pattern:
      /\bmapClinicalDocumentToFhir\b|\bmapClinicalDocumentToFhirProvenance\b|\bsendFhirOperationOutcome\b/,
    message:
      "ClinicalDocument FHIR export details belong in clinical-document-fhir-routes.ts."
  }
];
const requiredClinicalDocumentRegistrations = [
  "registerClinicalDocumentQueryRoutes",
  "registerClinicalDocumentCreationRoutes",
  "registerClinicalDocumentCommandRoutes",
  "registerClinicalDocumentFhirRoutes"
];
const forbiddenClinicalDocumentRouteHelperPatterns = [
  {
    pattern: /\bvalidateClinicalDocumentReferences\b|\bEncounterRepository\b/,
    message:
      "ClinicalDocument encounter reference validation belongs in clinical-document-reference-validation.ts."
  }
];
const requiredClinicalDocumentReferenceValidationHelpers = [
  "validateClinicalDocumentReferences",
  "ENCOUNTER_MISMATCH"
];

const clinicalDocumentFhirRoutesPath = resolve(
  "apps/api/src/modules/clinical-documents/clinical-document-fhir-routes.ts"
);
const forbiddenClinicalDocumentFhirRoutePatterns = [
  {
    pattern:
      /\bClinicalDocumentIdParamsSchema\b|\brequirePatientRecordAccessByPatientId\b|\brecordAuditEvent\b/,
    message:
      "ClinicalDocument FHIR request handling and audit policy belong in resource or Provenance route modules."
  },
  {
    pattern:
      /\bDomainError\b|\bmapClinicalDocumentToFhir\b|\bmapClinicalDocumentToFhirProvenance\b|\bsendFhirOperationOutcome\b/,
    message:
      "ClinicalDocument FHIR mapping and OperationOutcome details belong outside the FHIR route composition root."
  }
];
const requiredClinicalDocumentFhirRegistrations = [
  "registerClinicalDocumentFhirResourceRoutes",
  "registerClinicalDocumentProvenanceRoutes"
];

const medicationAdministrationRoutesPath = resolve(
  "apps/api/src/modules/medication-administrations/medication-administration-routes.ts"
);
const medicationAdministrationRouteHelpersPath = resolve(
  "apps/api/src/modules/medication-administrations/medication-administration-route-helpers.ts"
);
const medicationAdministrationReferenceValidationPath = resolve(
  "apps/api/src/modules/medication-administrations/medication-administration-reference-validation.ts"
);
const forbiddenMedicationAdministrationRoutePatterns = [
  {
    pattern:
      /\bCreateMedicationAdministrationRequestSchema\b|\bPatientMedicationAdministrationsParamsSchema\b|\bMedicationAdministrationIdParamsSchema\b/,
    message:
      "MedicationAdministration request handling belongs in medication-administration-query-routes.ts, medication-administration-creation-routes.ts or medication-administration-fhir-routes.ts."
  },
  {
    pattern:
      /\bMedicationAdministration\.record\b|\bDomainError\b|\bvalidateMedicationAdministrationReferences\b/,
    message:
      "MedicationAdministration creation and validation policy belongs outside the root route."
  },
  {
    pattern: /\bmapMedicationAdministrationToFhir\b/,
    message:
      "MedicationAdministration FHIR export belongs in medication-administration-fhir-routes.ts."
  }
];
const requiredMedicationAdministrationRegistrations = [
  "registerMedicationAdministrationQueryRoutes",
  "registerMedicationAdministrationCreationRoutes",
  "registerMedicationAdministrationFhirRoutes"
];
const forbiddenMedicationAdministrationRouteHelperPatterns = [
  {
    pattern:
      /\bvalidateMedicationAdministrationReferences\b|\bEncounterRepository\b|\bMedicationRequestRepository\b|\bConditionRepository\b/,
    message:
      "MedicationAdministration clinical reference validation belongs in medication-administration-reference-validation.ts."
  }
];
const requiredMedicationAdministrationReferenceValidationHelpers = [
  "validateMedicationAdministrationReferences",
  "ENCOUNTER_MISMATCH",
  "MEDICATION_REQUEST_MISMATCH",
  "CONDITION_MISMATCH"
];

const medicationDispenseRoutesPath = resolve(
  "apps/api/src/modules/medication-dispenses/medication-dispense-routes.ts"
);
const medicationDispenseRouteHelpersPath = resolve(
  "apps/api/src/modules/medication-dispenses/medication-dispense-route-helpers.ts"
);
const medicationDispenseReferenceValidationPath = resolve(
  "apps/api/src/modules/medication-dispenses/medication-dispense-reference-validation.ts"
);
const forbiddenMedicationDispenseRoutePatterns = [
  {
    pattern:
      /\bCreateMedicationDispenseRequestSchema\b|\bPatientMedicationDispensesParamsSchema\b|\bMedicationDispenseIdParamsSchema\b/,
    message:
      "MedicationDispense request handling belongs in medication-dispense-query-routes.ts, medication-dispense-creation-routes.ts or medication-dispense-fhir-routes.ts."
  },
  {
    pattern:
      /\bMedicationDispense\.record\b|\bDomainError\b|\bvalidateMedicationDispenseReferences\b/,
    message:
      "MedicationDispense creation and validation policy belongs outside the root route."
  },
  {
    pattern: /\bmapMedicationDispenseToFhir\b/,
    message: "MedicationDispense FHIR export belongs in medication-dispense-fhir-routes.ts."
  }
];
const requiredMedicationDispenseRegistrations = [
  "registerMedicationDispenseQueryRoutes",
  "registerMedicationDispenseCreationRoutes",
  "registerMedicationDispenseFhirRoutes"
];
const forbiddenMedicationDispenseRouteHelperPatterns = [
  {
    pattern:
      /\bvalidateMedicationDispenseReferences\b|\bEncounterRepository\b|\bMedicationRequestRepository\b/,
    message:
      "MedicationDispense clinical reference validation belongs in medication-dispense-reference-validation.ts."
  }
];
const requiredMedicationDispenseReferenceValidationHelpers = [
  "validateMedicationDispenseReferences",
  "ENCOUNTER_MISMATCH",
  "MEDICATION_REQUEST_MISMATCH"
];

const medicationRequestRoutesPath = resolve(
  "apps/api/src/modules/medication-requests/medication-request-routes.ts"
);
const medicationRequestRouteHelpersPath = resolve(
  "apps/api/src/modules/medication-requests/medication-request-route-helpers.ts"
);
const medicationRequestReferenceValidationPath = resolve(
  "apps/api/src/modules/medication-requests/medication-request-reference-validation.ts"
);
const forbiddenMedicationRequestRoutePatterns = [
  {
    pattern:
      /\bCreateMedicationRequestRequestSchema\b|\bPatientMedicationRequestsParamsSchema\b|\bMedicationRequestIdParamsSchema\b/,
    message:
      "MedicationRequest request handling belongs in medication-request-query-routes.ts, medication-request-creation-routes.ts or medication-request-fhir-routes.ts."
  },
  {
    pattern:
      /\bMedicationRequest\.prescribe\b|\bDomainError\b|\bvalidateMedicationRequestReferences\b/,
    message:
      "MedicationRequest creation and validation policy belongs outside the root route."
  },
  {
    pattern: /\bmapMedicationRequestToFhir\b/,
    message: "MedicationRequest FHIR export belongs in medication-request-fhir-routes.ts."
  }
];
const requiredMedicationRequestRegistrations = [
  "registerMedicationRequestQueryRoutes",
  "registerMedicationRequestCreationRoutes",
  "registerMedicationRequestFhirRoutes"
];
const forbiddenMedicationRequestRouteHelperPatterns = [
  {
    pattern:
      /\bvalidateMedicationRequestReferences\b|\bEncounterRepository\b|\bConditionRepository\b/,
    message:
      "MedicationRequest clinical reference validation belongs in medication-request-reference-validation.ts."
  }
];
const requiredMedicationRequestReferenceValidationHelpers = [
  "validateMedicationRequestReferences",
  "ENCOUNTER_MISMATCH",
  "CONDITION_MISMATCH"
];

const procedureRoutesPath = resolve("apps/api/src/modules/procedures/procedure-routes.ts");
const procedureRouteHelpersPath = resolve(
  "apps/api/src/modules/procedures/procedure-route-helpers.ts"
);
const procedureReferenceValidationPath = resolve(
  "apps/api/src/modules/procedures/procedure-reference-validation.ts"
);
const procedureReportReferenceValidationPath = resolve(
  "apps/api/src/modules/procedures/procedure-report-reference-validation.ts"
);
const forbiddenProcedureRoutePatterns = [
  {
    pattern:
      /\bCreateProcedureRequestSchema\b|\bPatientProceduresParamsSchema\b|\bProcedureIdParamsSchema\b/,
    message:
      "Procedure request handling belongs in procedure-query-routes.ts, procedure-creation-routes.ts or procedure-fhir-routes.ts."
  },
  {
    pattern: /\bProcedure\.record\b|\bDomainError\b|\bvalidateProcedureReferences\b/,
    message:
      "Procedure creation and validation policy belongs in procedure-creation-routes.ts and procedure-route-helpers.ts."
  },
  {
    pattern: /\bmapProcedureToFhir\b/,
    message: "Procedure FHIR export belongs in procedure-fhir-routes.ts."
  }
];
const requiredProcedureRegistrations = [
  "registerProcedureQueryRoutes",
  "registerProcedureCreationRoutes",
  "registerProcedureFhirRoutes"
];
const requiredProcedureRouteHelperExports = [
  "toProcedureResponse",
  "validateProcedureReferences"
];
const requiredProcedureReferenceValidationHelpers = [
  "ENCOUNTER_MISMATCH",
  "SERVICE_REQUEST_MISMATCH",
  "PARENT_PROCEDURE_MISMATCH",
  "CONDITION_MISMATCH",
  "validateProcedureReportReference"
];
const requiredProcedureReportReferenceValidationHelpers = [
  "DIAGNOSTIC_REPORT_MISMATCH",
  "DOCUMENT_REFERENCE_MISMATCH"
];

const diagnosticReportRoutesPath = resolve(
  "apps/api/src/modules/diagnostic-reports/diagnostic-report-routes.ts"
);
const diagnosticReportRouteHelpersPath = resolve(
  "apps/api/src/modules/diagnostic-reports/diagnostic-report-route-helpers.ts"
);
const diagnosticReportReferenceValidationPath = resolve(
  "apps/api/src/modules/diagnostic-reports/diagnostic-report-reference-validation.ts"
);
const forbiddenDiagnosticReportRoutePatterns = [
  {
    pattern:
      /\bCreateDiagnosticReportRequestSchema\b|\bPatientDiagnosticReportsParamsSchema\b|\bDiagnosticReportIdParamsSchema\b/,
    message:
      "DiagnosticReport request handling belongs in diagnostic-report-query-routes.ts, diagnostic-report-creation-routes.ts or diagnostic-report-fhir-routes.ts."
  },
  {
    pattern:
      /\bDiagnosticReport\.issue\b|\bDomainError\b|\brequirePatientRecordAccessByPatientId\b|\bvalidateDiagnosticReportReferences\b/,
    message:
      "DiagnosticReport creation, access and reference validation policy belongs outside the root route."
  },
  {
    pattern: /\bmapDiagnosticReportToFhir\b|\btoDiagnosticReportResponse\b/,
    message:
      "DiagnosticReport response and FHIR export details belong in helper or FHIR route modules."
  }
];
const requiredDiagnosticReportRegistrations = [
  "registerDiagnosticReportQueryRoutes",
  "registerDiagnosticReportCreationRoutes",
  "registerDiagnosticReportFhirRoutes"
];
const forbiddenDiagnosticReportRouteHelperPatterns = [
  {
    pattern:
      /\bvalidateDiagnosticReportReferences\b|\bEncounterRepository\b|\bObservationRepository\b|\bServiceRequestRepository\b/,
    message:
      "DiagnosticReport clinical reference validation belongs in diagnostic-report-reference-validation.ts."
  }
];
const requiredDiagnosticReportReferenceValidationHelpers = [
  "validateDiagnosticReportReferences",
  "ENCOUNTER_MISMATCH",
  "SERVICE_REQUEST_MISMATCH",
  "OBSERVATION_MISMATCH"
];

const imagingStudyRoutesPath = resolve(
  "apps/api/src/modules/imaging-studies/imaging-study-routes.ts"
);
const imagingStudyRouteHelpersPath = resolve(
  "apps/api/src/modules/imaging-studies/imaging-study-route-helpers.ts"
);
const imagingStudyReferenceValidationPath = resolve(
  "apps/api/src/modules/imaging-studies/imaging-study-reference-validation.ts"
);
const forbiddenImagingStudyRoutePatterns = [
  {
    pattern:
      /\bCreateImagingStudyRequestSchema\b|\bPatientImagingStudiesParamsSchema\b|\bImagingStudyIdParamsSchema\b/,
    message:
      "ImagingStudy request handling belongs in imaging-study-query-routes.ts, imaging-study-creation-routes.ts or imaging-study-fhir-routes.ts."
  },
  {
    pattern:
      /\bImagingStudy\.record\b|\bDomainError\b|\brequirePatientRecordAccessByPatientId\b|\bvalidateImagingStudyReferences\b/,
    message:
      "ImagingStudy creation, access and reference validation policy belongs outside the root route."
  },
  {
    pattern: /\bmapImagingStudyToFhir\b|\btoImagingStudyResponse\b/,
    message:
      "ImagingStudy response and FHIR export details belong in helper or FHIR route modules."
  }
];
const requiredImagingStudyRegistrations = [
  "registerImagingStudyQueryRoutes",
  "registerImagingStudyCreationRoutes",
  "registerImagingStudyFhirRoutes"
];
const forbiddenImagingStudyRouteHelperPatterns = [
  {
    pattern:
      /\bvalidateImagingStudyReferences\b|\bEncounterRepository\b|\bDiagnosticReportRepository\b|\bServiceRequestRepository\b/,
    message:
      "ImagingStudy clinical reference validation belongs in imaging-study-reference-validation.ts."
  }
];
const requiredImagingStudyReferenceValidationHelpers = [
  "validateImagingStudyReferences",
  "ENCOUNTER_MISMATCH",
  "SERVICE_REQUEST_MISMATCH",
  "DIAGNOSTIC_REPORT_MISMATCH"
];

const serviceRequestRoutesPath = resolve(
  "apps/api/src/modules/service-requests/service-request-routes.ts"
);
const serviceRequestRouteHelpersPath = resolve(
  "apps/api/src/modules/service-requests/service-request-route-helpers.ts"
);
const serviceRequestReferenceValidationPath = resolve(
  "apps/api/src/modules/service-requests/service-request-reference-validation.ts"
);
const forbiddenServiceRequestRoutePatterns = [
  {
    pattern:
      /\bCreateServiceRequestRequestSchema\b|\bPatientServiceRequestsParamsSchema\b|\bServiceRequestIdParamsSchema\b/,
    message:
      "ServiceRequest request handling belongs in service-request-query-routes.ts, service-request-creation-routes.ts or service-request-fhir-routes.ts."
  },
  {
    pattern:
      /\bServiceRequest\.order\b|\bDomainError\b|\brequirePatientRecordAccessByPatientId\b|\bvalidateServiceRequestReferences\b/,
    message:
      "ServiceRequest creation, access and reference validation policy belongs outside the root route."
  },
  {
    pattern: /\bmapServiceRequestToFhir\b|\btoServiceRequestResponse\b/,
    message:
      "ServiceRequest response and FHIR export details belong in helper or FHIR route modules."
  }
];
const requiredServiceRequestRegistrations = [
  "registerServiceRequestQueryRoutes",
  "registerServiceRequestCreationRoutes",
  "registerServiceRequestFhirRoutes"
];
const forbiddenServiceRequestRouteHelperPatterns = [
  {
    pattern:
      /\bvalidateServiceRequestReferences\b|\bConditionRepository\b|\bEncounterRepository\b/,
    message:
      "ServiceRequest clinical reference validation belongs in service-request-reference-validation.ts."
  }
];
const requiredServiceRequestReferenceValidationHelpers = [
  "validateServiceRequestReferences",
  "ENCOUNTER_MISMATCH",
  "CONDITION_MISMATCH"
];

const workflowTaskRoutesPath = resolve(
  "apps/api/src/modules/workflow-tasks/workflow-task-routes.ts"
);
const workflowTaskRouteHelpersPath = resolve(
  "apps/api/src/modules/workflow-tasks/workflow-task-route-helpers.ts"
);
const workflowTaskReferenceValidationPath = resolve(
  "apps/api/src/modules/workflow-tasks/workflow-task-reference-validation.ts"
);
const forbiddenReferenceValidationBoundaryPatterns = [
  {
    pattern: /\bFastifyReply\b/,
    message:
      "Reference validation modules must stay HTTP-framework agnostic; return validation errors for routes to send."
  },
  {
    pattern: /\breply\.status\(/,
    message:
      "Reference validation modules must not send HTTP responses directly; route adapters own response status codes."
  }
];
const forbiddenWorkflowTaskRoutePatterns = [
  {
    pattern:
      /\bCreateWorkflowTaskRequestSchema\b|\bPatientWorkflowTasksParamsSchema\b|\bWorkflowTaskIdParamsSchema\b/,
    message:
      "WorkflowTask request handling belongs in workflow-task-query-routes.ts, workflow-task-creation-routes.ts or workflow-task-fhir-routes.ts."
  },
  {
    pattern:
      /\bWorkflowTask\.create\b|\bDomainError\b|\brequirePatientRecordAccessByPatientId\b|\bvalidateWorkflowTaskReferences\b/,
    message:
      "WorkflowTask creation, access and reference validation policy belongs outside the root route."
  },
  {
    pattern: /\bmapWorkflowTaskToFhir\b|\btoWorkflowTaskResponse\b/,
    message:
      "WorkflowTask response and FHIR export details belong in helper or FHIR route modules."
  }
];
const requiredWorkflowTaskRegistrations = [
  "registerWorkflowTaskQueryRoutes",
  "registerWorkflowTaskCreationRoutes",
  "registerWorkflowTaskFhirRoutes"
];
const forbiddenWorkflowTaskRouteHelperPatterns = [
  {
    pattern:
      /\bvalidateWorkflowTaskReferences\b|\bEncounterRepository\b|\bServiceRequestRepository\b/,
    message:
      "WorkflowTask clinical reference validation belongs in workflow-task-reference-validation.ts."
  }
];
const requiredWorkflowTaskReferenceValidationHelpers = [
  "validateWorkflowTaskReferences",
  "ENCOUNTER_MISMATCH",
  "SERVICE_REQUEST_MISMATCH"
];

const routeReports = [];
const routeSources = [];
const inlineHttpErrorEnvelopeAllowedPaths = new Set([
  "apps/api/src/modules/http/http-domain-error-response.ts",
  "apps/api/src/modules/http/http-error-handler.ts",
  "apps/api/src/modules/http/http-json-error-response.ts",
  "apps/api/src/modules/http/http-not-found-error-response.ts",
  "apps/api/src/modules/http/http-validation-error-response.ts"
]);

for (const budget of routeBudgets) {
  const absolutePath = resolve(budget.path);
  await stat(absolutePath);
  const source = await readFile(absolutePath, "utf8");
  const lineCount = source.split(/\r?\n/).length;

  if (lineCount > budget.maxLines) {
    throw new Error(
      `${budget.path} has ${lineCount} lines; keep it at or below ${budget.maxLines} so ${budget.role} does not become a God route.`
    );
  }

  routeReports.push({
    path: budget.path,
    lineCount,
    maxLines: budget.maxLines,
    role: budget.role
  });
  routeSources.push({
    path: budget.path,
    source
  });
}

const apiRoutesSource = await readFile(apiRoutesPath, "utf8");
const systemRoutesSource = await readFile(systemRoutesPath, "utf8");
const httpBoundarySource = await readFile(httpBoundaryPath, "utf8");
const httpDomainErrorResponseSource = await readFile(
  httpDomainErrorResponsePath,
  "utf8"
);
const httpValidationErrorResponseSource = await readFile(
  httpValidationErrorResponsePath,
  "utf8"
);
const httpNotFoundErrorResponseSource = await readFile(
  httpNotFoundErrorResponsePath,
  "utf8"
);
const httpJsonErrorResponseSource = await readFile(
  httpJsonErrorResponsePath,
  "utf8"
);
const standardizedDomainErrorRouteSources = await Promise.all(
  standardizedDomainErrorRoutePaths.map(async (route) => ({
    ...route,
    source: await readFile(route.path, "utf8")
  }))
);
const standardizedJsonErrorRouteSources = await Promise.all(
  standardizedJsonErrorRoutePaths.map(async (route) => ({
    ...route,
    source: await readFile(route.path, "utf8")
  }))
);
const standardizedRequestIdNotFoundRouteSources = await Promise.all(
  standardizedRequestIdNotFoundRoutePaths.map(async (route) => ({
    ...route,
    source: await readFile(route.path, "utf8")
  }))
);
const standardizedValidationErrorRouteSources = await Promise.all(
  standardizedValidationErrorRoutePaths.map(async (route) => ({
    ...route,
    source: await readFile(route.path, "utf8")
  }))
);
const standardizedNotFoundErrorRouteSources = await Promise.all(
  standardizedNotFoundErrorRoutePaths.map(async (route) => ({
    ...route,
    source: await readFile(route.path, "utf8")
  }))
);
const standardizedDomainErrorHelperSources = await Promise.all(
  standardizedDomainErrorHelperPaths.map(async (helper) => ({
    ...helper,
    source: await readFile(helper.path, "utf8")
  }))
);
const apiDomainRoutesSource = await readFile(apiDomainRoutesPath, "utf8");
const providerDirectoryRoutesSource = await readFile(
  providerDirectoryRoutesPath,
  "utf8"
);
const authRoutesSource = await readFile(authRoutesPath, "utf8");
const auditEventRoutesSource = await readFile(auditEventRoutesPath, "utf8");
const consentRoutesSource = await readFile(consentRoutesPath, "utf8");
const recordTransferRoutesSource = await readFile(recordTransferRoutesPath, "utf8");
const recordTransferCreationRoutesSource = await readFile(
  recordTransferCreationRoutesPath,
  "utf8"
);
const recordTransferCommandRoutesSource = await readFile(
  recordTransferCommandRoutesPath,
  "utf8"
);
const recordTransferRouteHelpersSource = await readFile(
  recordTransferRouteHelpersPath,
  "utf8"
);
const recordTransferAcknowledgementRoutesSource = await readFile(
  recordTransferAcknowledgementRoutesPath,
  "utf8"
);
const recordTransferAcknowledgementHandlerSource = await readFile(
  recordTransferAcknowledgementHandlerPath,
  "utf8"
);
const recordTransferAcknowledgementRequestSource = await readFile(
  recordTransferAcknowledgementRequestPath,
  "utf8"
);
const recordTransferAcknowledgementOutcomesSource = await readFile(
  recordTransferAcknowledgementOutcomesPath,
  "utf8"
);
const recordTransferAcknowledgementCompletedOutcomeSource = await readFile(
  recordTransferAcknowledgementCompletedOutcomePath,
  "utf8"
);
const recordTransferAcknowledgementAcceptedOutcomeSource = await readFile(
  recordTransferAcknowledgementAcceptedOutcomePath,
  "utf8"
);
const recordTransferAcknowledgementAuditSource = await readFile(
  recordTransferAcknowledgementAuditPath,
  "utf8"
);
const recordTransferAcknowledgementAuditMetadataSource = await readFile(
  recordTransferAcknowledgementAuditMetadataPath,
  "utf8"
);
const recordTransferAcknowledgementPolicySource = await readFile(
  recordTransferAcknowledgementPolicyPath,
  "utf8"
);
const recordTransferAcknowledgementReferenceSource = await readFile(
  recordTransferAcknowledgementReferencePath,
  "utf8"
);
const recordTransferAcknowledgementResponsesSource = await readFile(
  recordTransferAcknowledgementResponsesPath,
  "utf8"
);
const encounterRoutesSource = await readFile(encounterRoutesPath, "utf8");
const patientRoutesSource = await readFile(patientRoutesPath, "utf8");
const patientFhirRoutesSource = await readFile(patientFhirRoutesPath, "utf8");
const patientRecordBundleRoutesSource = await readFile(
  patientRecordBundleRoutesPath,
  "utf8"
);
const patientRecordBundleRouteHelpersSource = await readFile(
  patientRecordBundleRouteHelpersPath,
  "utf8"
);
const patientRecordBundleConsentContextSource = await readFile(
  patientRecordBundleConsentContextPath,
  "utf8"
);
const clinicalDocumentRoutesSource = await readFile(
  clinicalDocumentRoutesPath,
  "utf8"
);
const clinicalDocumentRouteHelpersSource = await readFile(
  clinicalDocumentRouteHelpersPath,
  "utf8"
);
const clinicalDocumentReferenceValidationSource = await readFile(
  clinicalDocumentReferenceValidationPath,
  "utf8"
);
const clinicalDocumentFhirRoutesSource = await readFile(
  clinicalDocumentFhirRoutesPath,
  "utf8"
);
const medicationAdministrationRoutesSource = await readFile(
  medicationAdministrationRoutesPath,
  "utf8"
);
const medicationAdministrationRouteHelpersSource = await readFile(
  medicationAdministrationRouteHelpersPath,
  "utf8"
);
const medicationAdministrationReferenceValidationSource = await readFile(
  medicationAdministrationReferenceValidationPath,
  "utf8"
);
const medicationDispenseRoutesSource = await readFile(
  medicationDispenseRoutesPath,
  "utf8"
);
const medicationDispenseRouteHelpersSource = await readFile(
  medicationDispenseRouteHelpersPath,
  "utf8"
);
const medicationDispenseReferenceValidationSource = await readFile(
  medicationDispenseReferenceValidationPath,
  "utf8"
);
const medicationRequestRoutesSource = await readFile(
  medicationRequestRoutesPath,
  "utf8"
);
const medicationRequestRouteHelpersSource = await readFile(
  medicationRequestRouteHelpersPath,
  "utf8"
);
const medicationRequestReferenceValidationSource = await readFile(
  medicationRequestReferenceValidationPath,
  "utf8"
);
const procedureRoutesSource = await readFile(procedureRoutesPath, "utf8");
const procedureRouteHelpersSource = await readFile(procedureRouteHelpersPath, "utf8");
const procedureReferenceValidationSource = await readFile(
  procedureReferenceValidationPath,
  "utf8"
);
const procedureReportReferenceValidationSource = await readFile(
  procedureReportReferenceValidationPath,
  "utf8"
);
const observationRoutesSource = await readFile(observationRoutesPath, "utf8");
const observationRouteHelpersSource = await readFile(
  observationRouteHelpersPath,
  "utf8"
);
const observationReferenceValidationSource = await readFile(
  observationReferenceValidationPath,
  "utf8"
);
const conditionRoutesSource = await readFile(conditionRoutesPath, "utf8");
const conditionRouteHelpersSource = await readFile(conditionRouteHelpersPath, "utf8");
const conditionReferenceValidationSource = await readFile(
  conditionReferenceValidationPath,
  "utf8"
);
const allergyIntoleranceRoutesSource = await readFile(
  allergyIntoleranceRoutesPath,
  "utf8"
);
const allergyIntoleranceRouteHelpersSource = await readFile(
  allergyIntoleranceRouteHelpersPath,
  "utf8"
);
const allergyIntoleranceReferenceValidationSource = await readFile(
  allergyIntoleranceReferenceValidationPath,
  "utf8"
);
const diagnosticReportRoutesSource = await readFile(diagnosticReportRoutesPath, "utf8");
const diagnosticReportRouteHelpersSource = await readFile(
  diagnosticReportRouteHelpersPath,
  "utf8"
);
const diagnosticReportReferenceValidationSource = await readFile(
  diagnosticReportReferenceValidationPath,
  "utf8"
);
const imagingStudyRoutesSource = await readFile(imagingStudyRoutesPath, "utf8");
const imagingStudyRouteHelpersSource = await readFile(
  imagingStudyRouteHelpersPath,
  "utf8"
);
const imagingStudyReferenceValidationSource = await readFile(
  imagingStudyReferenceValidationPath,
  "utf8"
);
const serviceRequestRoutesSource = await readFile(serviceRequestRoutesPath, "utf8");
const serviceRequestRouteHelpersSource = await readFile(
  serviceRequestRouteHelpersPath,
  "utf8"
);
const serviceRequestReferenceValidationSource = await readFile(
  serviceRequestReferenceValidationPath,
  "utf8"
);
const workflowTaskRoutesSource = await readFile(workflowTaskRoutesPath, "utf8");
const workflowTaskRouteHelpersSource = await readFile(
  workflowTaskRouteHelpersPath,
  "utf8"
);
const workflowTaskReferenceValidationSource = await readFile(
  workflowTaskReferenceValidationPath,
  "utf8"
);
const referenceValidationBoundarySources = [
  {
    label: "ClinicalDocument reference validation",
    source: clinicalDocumentReferenceValidationSource
  },
  {
    label: "MedicationAdministration reference validation",
    source: medicationAdministrationReferenceValidationSource
  },
  {
    label: "MedicationDispense reference validation",
    source: medicationDispenseReferenceValidationSource
  },
  {
    label: "MedicationRequest reference validation",
    source: medicationRequestReferenceValidationSource
  },
  {
    label: "Procedure reference validation",
    source: procedureReferenceValidationSource
  },
  {
    label: "Procedure report reference validation",
    source: procedureReportReferenceValidationSource
  },
  {
    label: "Observation reference validation",
    source: observationReferenceValidationSource
  },
  {
    label: "Condition reference validation",
    source: conditionReferenceValidationSource
  },
  {
    label: "AllergyIntolerance reference validation",
    source: allergyIntoleranceReferenceValidationSource
  },
  {
    label: "DiagnosticReport reference validation",
    source: diagnosticReportReferenceValidationSource
  },
  {
    label: "ImagingStudy reference validation",
    source: imagingStudyReferenceValidationSource
  },
  {
    label: "ServiceRequest reference validation",
    source: serviceRequestReferenceValidationSource
  },
  {
    label: "WorkflowTask reference validation",
    source: workflowTaskReferenceValidationSource
  }
];

for (const forbidden of forbiddenApiRoutesPatterns) {
  if (forbidden.pattern.test(apiRoutesSource)) {
    throw new Error(forbidden.message);
  }
}

for (const forbidden of forbiddenSystemRoutePatterns) {
  if (forbidden.pattern.test(systemRoutesSource)) {
    throw new Error(forbidden.message);
  }
}

for (const registration of requiredSystemRegistrations) {
  if (!systemRoutesSource.includes(registration)) {
    throw new Error(
      `System route composition must register ${registration} so health, readiness and runtime routes remain wired.`
    );
  }
}

for (const forbidden of forbiddenHttpBoundaryPatterns) {
  if (forbidden.pattern.test(httpBoundarySource)) {
    throw new Error(forbidden.message);
  }
}

for (const registration of requiredHttpBoundaryRegistrations) {
  if (!httpBoundarySource.includes(registration)) {
    throw new Error(
      `HTTP boundary composition must register ${registration} so request IDs, security headers and error envelopes remain wired.`
    );
  }
}

for (const helper of requiredHttpDomainErrorResponseHelpers) {
  if (!httpDomainErrorResponseSource.includes(helper)) {
    throw new Error(
      `HTTP domain error response helper must keep ${helper} so route adapters share the same DomainError to 422 mapping.`
    );
  }
}

for (const helper of requiredHttpValidationErrorResponseHelpers) {
  if (!httpValidationErrorResponseSource.includes(helper)) {
    throw new Error(
      `HTTP validation error response helper must keep ${helper} so route adapters share the same validation-error to 422 mapping.`
    );
  }
}

for (const helper of requiredHttpNotFoundErrorResponseHelpers) {
  if (!httpNotFoundErrorResponseSource.includes(helper)) {
    throw new Error(
      `HTTP not-found response helper must keep ${helper} so JSON 404 envelopes stay centralized.`
    );
  }
}

for (const helper of requiredHttpJsonErrorResponseHelpers) {
  if (!httpJsonErrorResponseSource.includes(helper)) {
    throw new Error(
      `HTTP JSON error response helper must keep ${helper} so request-id JSON envelopes stay centralized.`
    );
  }
}

for (const route of routeSources) {
  if (inlineHttpErrorEnvelopeAllowedPaths.has(route.path)) {
    continue;
  }

  if (/\breply\.status\([^)]*\)\.send\(\{\s*error:/m.test(route.source)) {
    throw new Error(
      `${route.path} must not build inline JSON error envelopes; use sendJsonErrorResponse, sendNotFoundErrorResponse, sendValidationErrorResponse or a domain-specific response helper.`
    );
  }
}

for (const route of standardizedDomainErrorRouteSources) {
  if (/\bDomainError\b/.test(route.source)) {
    throw new Error(
      `${route.label} must use sendDomainErrorResponse instead of inline DomainError response handling.`
    );
  }

  if (!route.source.includes("sendDomainErrorResponse")) {
    throw new Error(
      `${route.label} must use sendDomainErrorResponse so DomainError payloads stay centralized.`
    );
  }
}

for (const route of standardizedJsonErrorRouteSources) {
  if (/\breply\.status\((?:400|401|403|409|429)\)\.send\(\{/.test(route.source)) {
    throw new Error(
      `${route.label} must use sendJsonErrorResponse instead of inline request-id JSON error response handling.`
    );
  }

  if (!route.source.includes("sendJsonErrorResponse")) {
    throw new Error(
      `${route.label} must use sendJsonErrorResponse so request-id JSON error payloads stay centralized.`
    );
  }
}

for (const route of standardizedRequestIdNotFoundRouteSources) {
  if (/\breply\.status\(404\)\.send\(\{/.test(route.source)) {
    throw new Error(
      `${route.label} must use sendJsonErrorResponse instead of inline request-id JSON 404 response handling.`
    );
  }

  if (!route.source.includes("sendJsonErrorResponse")) {
    throw new Error(
      `${route.label} must use sendJsonErrorResponse so request-id JSON 404 payloads stay centralized.`
    );
  }
}

for (const route of standardizedValidationErrorRouteSources) {
  if (route.source.includes("reply.status(422).send(validationError)")) {
    throw new Error(
      `${route.label} must use sendValidationErrorResponse instead of inline validation-error response handling.`
    );
  }

  if (!route.source.includes("sendValidationErrorResponse")) {
    throw new Error(
      `${route.label} must use sendValidationErrorResponse so validation-error payloads stay centralized.`
    );
  }
}

for (const route of standardizedNotFoundErrorRouteSources) {
  if (route.source.includes("reply.status(404).send({")) {
    throw new Error(
      `${route.label} must use sendNotFoundErrorResponse instead of inline JSON not-found response handling.`
    );
  }

  if (!route.source.includes("sendNotFoundErrorResponse")) {
    throw new Error(
      `${route.label} must use sendNotFoundErrorResponse so JSON 404 envelopes stay centralized.`
    );
  }
}

for (const helper of standardizedDomainErrorHelperSources) {
  if (!helper.source.includes("sendDomainErrorResponse")) {
    throw new Error(
      `${helper.label} must use sendDomainErrorResponse so DomainError payloads stay centralized.`
    );
  }

  for (const forbidden of forbiddenStandardizedDomainErrorHelperPatterns) {
    if (forbidden.pattern.test(helper.source)) {
      throw new Error(`${helper.label} ${forbidden.message}`);
    }
  }
}

for (const referenceValidation of referenceValidationBoundarySources) {
  for (const forbidden of forbiddenReferenceValidationBoundaryPatterns) {
    if (forbidden.pattern.test(referenceValidation.source)) {
      throw new Error(`${referenceValidation.label}: ${forbidden.message}`);
    }
  }
}

for (const registration of requiredApiDomainRegistrations) {
  if (!apiDomainRoutesSource.includes(registration)) {
    throw new Error(
      `HTTP API domain route composition must register ${registration} so domain route groups remain wired.`
    );
  }
}

for (const forbidden of forbiddenProviderDirectoryRoutePatterns) {
  if (forbidden.pattern.test(providerDirectoryRoutesSource)) {
    throw new Error(forbidden.message);
  }
}

for (const registration of requiredProviderDirectoryRegistrations) {
  if (!providerDirectoryRoutesSource.includes(registration)) {
    throw new Error(
      `ProviderDirectory root routes must register ${registration} so query and FHIR modules remain wired.`
    );
  }
}

for (const forbidden of forbiddenAuthRoutePatterns) {
  if (forbidden.pattern.test(authRoutesSource)) {
    throw new Error(forbidden.message);
  }
}

for (const registration of requiredAuthRegistrations) {
  if (!authRoutesSource.includes(registration)) {
    throw new Error(
      `Auth root routes must register ${registration} so login and bearer session routes remain wired.`
    );
  }
}

for (const forbidden of forbiddenAuditEventRoutePatterns) {
  if (forbidden.pattern.test(auditEventRoutesSource)) {
    throw new Error(forbidden.message);
  }
}

for (const registration of requiredAuditEventRegistrations) {
  if (!auditEventRoutesSource.includes(registration)) {
    throw new Error(
      `AuditEvent root routes must register ${registration} so query, integrity and FHIR modules remain wired.`
    );
  }
}

for (const forbidden of forbiddenConsentRoutePatterns) {
  if (forbidden.pattern.test(consentRoutesSource)) {
    throw new Error(forbidden.message);
  }
}

for (const registration of requiredConsentRegistrations) {
  if (!consentRoutesSource.includes(registration)) {
    throw new Error(
      `Consent root routes must register ${registration} so query, creation, command and FHIR modules remain wired.`
    );
  }
}

for (const forbidden of forbiddenRecordTransferRoutePatterns) {
  if (forbidden.pattern.test(recordTransferRoutesSource)) {
    throw new Error(forbidden.message);
  }
}

for (const registration of requiredRecordTransferRegistrations) {
  if (!recordTransferRoutesSource.includes(registration)) {
    throw new Error(
      `RecordTransfer root routes must register ${registration} so lifecycle-specific route modules remain wired.`
    );
  }
}

for (const forbidden of forbiddenRecordTransferCreationRoutePatterns) {
  if (forbidden.pattern.test(recordTransferCreationRoutesSource)) {
    throw new Error(forbidden.message);
  }
}

for (const helper of requiredRecordTransferCreationRouteHelpers) {
  if (!recordTransferCreationRoutesSource.includes(helper)) {
    throw new Error(
      `RecordTransfer creation route must use ${helper} so domain-error envelopes stay centralized.`
    );
  }
}

for (const forbidden of forbiddenRecordTransferCommandRoutePatterns) {
  if (forbidden.pattern.test(recordTransferCommandRoutesSource)) {
    throw new Error(forbidden.message);
  }
}

for (const registration of requiredRecordTransferCommandRegistrations) {
  if (!recordTransferCommandRoutesSource.includes(registration)) {
    throw new Error(
      `RecordTransfer command root routes must register ${registration} so send, receive and failure modules remain wired.`
    );
  }
}

for (const forbidden of forbiddenRecordTransferRouteHelperPatterns) {
  if (forbidden.pattern.test(recordTransferRouteHelpersSource)) {
    throw new Error(forbidden.message);
  }
}

for (const forbidden of forbiddenRecordTransferAcknowledgementRoutePatterns) {
  if (forbidden.pattern.test(recordTransferAcknowledgementRoutesSource)) {
    throw new Error(forbidden.message);
  }
}

for (const registration of requiredRecordTransferAcknowledgementRegistrations) {
  if (!recordTransferAcknowledgementRoutesSource.includes(registration)) {
    throw new Error(
      `RecordTransfer acknowledgement root routes must register ${registration} so callback handling remains wired.`
    );
  }
}

for (const forbidden of forbiddenRecordTransferAcknowledgementHandlerPatterns) {
  if (forbidden.pattern.test(recordTransferAcknowledgementHandlerSource)) {
    throw new Error(forbidden.message);
  }
}

for (const forbidden of forbiddenRecordTransferAcknowledgementPolicyPatterns) {
  if (forbidden.pattern.test(recordTransferAcknowledgementPolicySource)) {
    throw new Error(forbidden.message);
  }
}

for (const helper of requiredRecordTransferAcknowledgementPolicyHelpers) {
  if (!recordTransferAcknowledgementPolicySource.includes(helper)) {
    throw new Error(
      `RecordTransfer acknowledgement access policy must use ${helper} so purpose and recipient checks stay centralized.`
    );
  }
}

for (const helper of requiredRecordTransferAcknowledgementAuditHelpers) {
  if (!recordTransferAcknowledgementAuditSource.includes(helper)) {
    throw new Error(
      `RecordTransfer acknowledgement audit module must expose ${helper} so callback audit events stay centralized.`
    );
  }
}

for (const helper of requiredRecordTransferAcknowledgementAuditMetadataHelpers) {
  if (!recordTransferAcknowledgementAuditMetadataSource.includes(helper)) {
    throw new Error(
      `RecordTransfer acknowledgement audit metadata module must expose ${helper} so callback metadata stays centralized.`
    );
  }
}

for (const helper of requiredRecordTransferAcknowledgementReferenceHelpers) {
  if (!recordTransferAcknowledgementReferenceSource.includes(helper)) {
    throw new Error(
      `RecordTransfer acknowledgement reference helper must expose ${helper} so receive routes do not own reference generation.`
    );
  }
}

for (const forbidden of forbiddenRecordTransferAcknowledgementResponsePatterns) {
  if (forbidden.pattern.test(recordTransferAcknowledgementResponsesSource)) {
    throw new Error(forbidden.message);
  }
}

for (const helper of requiredRecordTransferAcknowledgementResponseHelpers) {
  if (!recordTransferAcknowledgementResponsesSource.includes(helper)) {
    throw new Error(
      `RecordTransfer acknowledgement response helper must expose ${helper} so callback error envelopes stay centralized.`
    );
  }
}

for (const helper of requiredRecordTransferAcknowledgementHandlerHelpers) {
  if (!recordTransferAcknowledgementHandlerSource.includes(helper)) {
    throw new Error(
      `RecordTransfer acknowledgement callback handler must use ${helper} so callback access and outcome policy remain split.`
    );
  }
}

for (const helper of requiredRecordTransferAcknowledgementRequestHelpers) {
  if (!recordTransferAcknowledgementRequestSource.includes(helper)) {
    throw new Error(
      `RecordTransfer acknowledgement callback request parser must use ${helper} so params, body and signature verification remain centralized.`
    );
  }
}

for (const exportedHandler of requiredRecordTransferAcknowledgementOutcomeExports) {
  if (!recordTransferAcknowledgementOutcomesSource.includes(exportedHandler)) {
    throw new Error(
      `RecordTransfer acknowledgement outcome barrel must export ${exportedHandler} so the handler remains wired through one module boundary.`
    );
  }
}

for (const helper of requiredRecordTransferAcknowledgementCompletedOutcomeHelpers) {
  if (!recordTransferAcknowledgementCompletedOutcomeSource.includes(helper)) {
    throw new Error(
      `RecordTransfer acknowledgement completed outcome must use ${helper} so duplicate callbacks remain idempotent and auditable.`
    );
  }
}

for (const helper of requiredRecordTransferAcknowledgementAcceptedOutcomeHelpers) {
  if (!recordTransferAcknowledgementAcceptedOutcomeSource.includes(helper)) {
    throw new Error(
      `RecordTransfer acknowledgement accepted outcome must use ${helper} so accepted callbacks persist and audit the lifecycle transition.`
    );
  }
}

for (const forbidden of forbiddenEncounterRoutePatterns) {
  if (forbidden.pattern.test(encounterRoutesSource)) {
    throw new Error(forbidden.message);
  }
}

for (const registration of requiredEncounterRegistrations) {
  if (!encounterRoutesSource.includes(registration)) {
    throw new Error(
      `Encounter root routes must register ${registration} so query, command and FHIR modules remain wired.`
    );
  }
}

for (const forbidden of forbiddenObservationRoutePatterns) {
  if (forbidden.pattern.test(observationRoutesSource)) {
    throw new Error(forbidden.message);
  }
}

for (const registration of requiredObservationRegistrations) {
  if (!observationRoutesSource.includes(registration)) {
    throw new Error(
      `Observation root routes must register ${registration} so query, creation and FHIR modules remain wired.`
    );
  }
}

for (const forbidden of forbiddenObservationRouteHelperPatterns) {
  if (forbidden.pattern.test(observationRouteHelpersSource)) {
    throw new Error(forbidden.message);
  }
}

for (const helper of requiredObservationReferenceValidationHelpers) {
  if (!observationReferenceValidationSource.includes(helper)) {
    throw new Error(
      `Observation reference validation module must keep ${helper} so encounter-scoped results stay patient-scoped.`
    );
  }
}

for (const forbidden of forbiddenConditionRoutePatterns) {
  if (forbidden.pattern.test(conditionRoutesSource)) {
    throw new Error(forbidden.message);
  }
}

for (const registration of requiredConditionRegistrations) {
  if (!conditionRoutesSource.includes(registration)) {
    throw new Error(
      `Condition root routes must register ${registration} so query, creation and FHIR modules remain wired.`
    );
  }
}

for (const forbidden of forbiddenConditionRouteHelperPatterns) {
  if (forbidden.pattern.test(conditionRouteHelpersSource)) {
    throw new Error(forbidden.message);
  }
}

for (const helper of requiredConditionReferenceValidationHelpers) {
  if (!conditionReferenceValidationSource.includes(helper)) {
    throw new Error(
      `Condition reference validation module must keep ${helper} so diagnosis context stays patient-scoped.`
    );
  }
}

for (const forbidden of forbiddenAllergyIntoleranceRoutePatterns) {
  if (forbidden.pattern.test(allergyIntoleranceRoutesSource)) {
    throw new Error(forbidden.message);
  }
}

for (const registration of requiredAllergyIntoleranceRegistrations) {
  if (!allergyIntoleranceRoutesSource.includes(registration)) {
    throw new Error(
      `AllergyIntolerance root routes must register ${registration} so query, creation and FHIR modules remain wired.`
    );
  }
}

for (const forbidden of forbiddenAllergyIntoleranceRouteHelperPatterns) {
  if (forbidden.pattern.test(allergyIntoleranceRouteHelpersSource)) {
    throw new Error(forbidden.message);
  }
}

for (const helper of requiredAllergyIntoleranceReferenceValidationHelpers) {
  if (!allergyIntoleranceReferenceValidationSource.includes(helper)) {
    throw new Error(
      `AllergyIntolerance reference validation module must keep ${helper} so allergy context stays patient-scoped.`
    );
  }
}

for (const forbidden of forbiddenPatientRoutePatterns) {
  if (forbidden.pattern.test(patientRoutesSource)) {
    throw new Error(forbidden.message);
  }
}

for (const registration of requiredPatientRegistrations) {
  if (!patientRoutesSource.includes(registration)) {
    throw new Error(
      `Patient root routes must register ${registration} so registry, merge, query and FHIR route modules remain wired.`
    );
  }
}

for (const forbidden of forbiddenPatientFhirRoutePatterns) {
  if (forbidden.pattern.test(patientFhirRoutesSource)) {
    throw new Error(forbidden.message);
  }
}

for (const registration of requiredPatientFhirRegistrations) {
  if (!patientFhirRoutesSource.includes(registration)) {
    throw new Error(
      `Patient FHIR root routes must register ${registration} so resource and Bundle export modules remain wired.`
    );
  }
}

for (const forbidden of forbiddenPatientRecordBundleRoutePatterns) {
  if (forbidden.pattern.test(patientRecordBundleRoutesSource)) {
    throw new Error(forbidden.message);
  }
}

for (const registration of requiredPatientRecordBundleRegistrations) {
  if (!patientRecordBundleRoutesSource.includes(registration)) {
    throw new Error(
      `Patient record Bundle root routes must register ${registration} so collection and document Bundle exports remain wired.`
    );
  }
}

for (const forbidden of forbiddenPatientRecordBundleHelperPatterns) {
  if (forbidden.pattern.test(patientRecordBundleRouteHelpersSource)) {
    throw new Error(forbidden.message);
  }
}

for (const helper of requiredPatientRecordBundleHelpers) {
  if (!patientRecordBundleRouteHelpersSource.includes(helper)) {
    throw new Error(
      `Patient record Bundle helper must use ${helper} so access, transfer context and collection loading remain wired.`
    );
  }
}

for (const helper of requiredPatientRecordBundleConsentContextHelpers) {
  if (!patientRecordBundleConsentContextSource.includes(helper)) {
    throw new Error(
      `Patient record Bundle consent-context helper must use ${helper} so transfer headers and consent validation remain centralized.`
    );
  }
}

for (const forbidden of forbiddenClinicalDocumentRoutePatterns) {
  if (forbidden.pattern.test(clinicalDocumentRoutesSource)) {
    throw new Error(forbidden.message);
  }
}

for (const registration of requiredClinicalDocumentRegistrations) {
  if (!clinicalDocumentRoutesSource.includes(registration)) {
    throw new Error(
      `ClinicalDocument root routes must register ${registration} so query, command and FHIR modules remain wired.`
    );
  }
}

for (const forbidden of forbiddenClinicalDocumentRouteHelperPatterns) {
  if (forbidden.pattern.test(clinicalDocumentRouteHelpersSource)) {
    throw new Error(forbidden.message);
  }
}

for (const helper of requiredClinicalDocumentReferenceValidationHelpers) {
  if (!clinicalDocumentReferenceValidationSource.includes(helper)) {
    throw new Error(
      `ClinicalDocument reference validation module must keep ${helper} so document context stays patient-scoped.`
    );
  }
}

for (const forbidden of forbiddenClinicalDocumentFhirRoutePatterns) {
  if (forbidden.pattern.test(clinicalDocumentFhirRoutesSource)) {
    throw new Error(forbidden.message);
  }
}

for (const registration of requiredClinicalDocumentFhirRegistrations) {
  if (!clinicalDocumentFhirRoutesSource.includes(registration)) {
    throw new Error(
      `ClinicalDocument FHIR root routes must register ${registration} so DocumentReference and Provenance exports remain wired.`
    );
  }
}

for (const forbidden of forbiddenMedicationAdministrationRoutePatterns) {
  if (forbidden.pattern.test(medicationAdministrationRoutesSource)) {
    throw new Error(forbidden.message);
  }
}

for (const registration of requiredMedicationAdministrationRegistrations) {
  if (!medicationAdministrationRoutesSource.includes(registration)) {
    throw new Error(
      `MedicationAdministration root routes must register ${registration} so query, command and FHIR modules remain wired.`
    );
  }
}

for (const forbidden of forbiddenMedicationAdministrationRouteHelperPatterns) {
  if (forbidden.pattern.test(medicationAdministrationRouteHelpersSource)) {
    throw new Error(forbidden.message);
  }
}

for (const helper of requiredMedicationAdministrationReferenceValidationHelpers) {
  if (!medicationAdministrationReferenceValidationSource.includes(helper)) {
    throw new Error(
      `MedicationAdministration reference validation module must keep ${helper} so medication administration links stay patient-scoped.`
    );
  }
}

for (const forbidden of forbiddenMedicationDispenseRoutePatterns) {
  if (forbidden.pattern.test(medicationDispenseRoutesSource)) {
    throw new Error(forbidden.message);
  }
}

for (const registration of requiredMedicationDispenseRegistrations) {
  if (!medicationDispenseRoutesSource.includes(registration)) {
    throw new Error(
      `MedicationDispense root routes must register ${registration} so query, command and FHIR modules remain wired.`
    );
  }
}

for (const forbidden of forbiddenMedicationDispenseRouteHelperPatterns) {
  if (forbidden.pattern.test(medicationDispenseRouteHelpersSource)) {
    throw new Error(forbidden.message);
  }
}

for (const helper of requiredMedicationDispenseReferenceValidationHelpers) {
  if (!medicationDispenseReferenceValidationSource.includes(helper)) {
    throw new Error(
      `MedicationDispense reference validation module must keep ${helper} so dispensing links stay patient-scoped.`
    );
  }
}

for (const forbidden of forbiddenMedicationRequestRoutePatterns) {
  if (forbidden.pattern.test(medicationRequestRoutesSource)) {
    throw new Error(forbidden.message);
  }
}

for (const registration of requiredMedicationRequestRegistrations) {
  if (!medicationRequestRoutesSource.includes(registration)) {
    throw new Error(
      `MedicationRequest root routes must register ${registration} so query, command and FHIR modules remain wired.`
    );
  }
}

for (const forbidden of forbiddenMedicationRequestRouteHelperPatterns) {
  if (forbidden.pattern.test(medicationRequestRouteHelpersSource)) {
    throw new Error(forbidden.message);
  }
}

for (const helper of requiredMedicationRequestReferenceValidationHelpers) {
  if (!medicationRequestReferenceValidationSource.includes(helper)) {
    throw new Error(
      `MedicationRequest reference validation module must keep ${helper} so prescription links stay patient-scoped.`
    );
  }
}

for (const forbidden of forbiddenProcedureRoutePatterns) {
  if (forbidden.pattern.test(procedureRoutesSource)) {
    throw new Error(forbidden.message);
  }
}

for (const registration of requiredProcedureRegistrations) {
  if (!procedureRoutesSource.includes(registration)) {
    throw new Error(
      `Procedure root routes must register ${registration} so query, command and FHIR modules remain wired.`
    );
  }
}

for (const exportedHelper of requiredProcedureRouteHelperExports) {
  if (!procedureRouteHelpersSource.includes(exportedHelper)) {
    throw new Error(
      `Procedure route helper barrel must export ${exportedHelper} so existing route imports stay wired through a thin compatibility boundary.`
    );
  }
}

for (const helper of requiredProcedureReferenceValidationHelpers) {
  if (!procedureReferenceValidationSource.includes(helper)) {
    throw new Error(
      `Procedure reference validation must retain ${helper} so cross-resource patient scoping remains explicit.`
    );
  }
}

for (const helper of requiredProcedureReportReferenceValidationHelpers) {
  if (!procedureReportReferenceValidationSource.includes(helper)) {
    throw new Error(
      `Procedure report reference validation must retain ${helper} so DiagnosticReport and DocumentReference scoping remains explicit.`
    );
  }
}

for (const forbidden of forbiddenDiagnosticReportRoutePatterns) {
  if (forbidden.pattern.test(diagnosticReportRoutesSource)) {
    throw new Error(forbidden.message);
  }
}

for (const registration of requiredDiagnosticReportRegistrations) {
  if (!diagnosticReportRoutesSource.includes(registration)) {
    throw new Error(
      `DiagnosticReport root routes must register ${registration} so query, creation and FHIR modules remain wired.`
    );
  }
}

for (const forbidden of forbiddenDiagnosticReportRouteHelperPatterns) {
  if (forbidden.pattern.test(diagnosticReportRouteHelpersSource)) {
    throw new Error(forbidden.message);
  }
}

for (const helper of requiredDiagnosticReportReferenceValidationHelpers) {
  if (!diagnosticReportReferenceValidationSource.includes(helper)) {
    throw new Error(
      `DiagnosticReport reference validation module must keep ${helper} so LIS/RIS result links stay patient-scoped.`
    );
  }
}

for (const forbidden of forbiddenImagingStudyRoutePatterns) {
  if (forbidden.pattern.test(imagingStudyRoutesSource)) {
    throw new Error(forbidden.message);
  }
}

for (const registration of requiredImagingStudyRegistrations) {
  if (!imagingStudyRoutesSource.includes(registration)) {
    throw new Error(
      `ImagingStudy root routes must register ${registration} so query, creation and FHIR modules remain wired.`
    );
  }
}

for (const forbidden of forbiddenImagingStudyRouteHelperPatterns) {
  if (forbidden.pattern.test(imagingStudyRouteHelpersSource)) {
    throw new Error(forbidden.message);
  }
}

for (const helper of requiredImagingStudyReferenceValidationHelpers) {
  if (!imagingStudyReferenceValidationSource.includes(helper)) {
    throw new Error(
      `ImagingStudy reference validation module must keep ${helper} so PACS/RIS image links stay patient-scoped.`
    );
  }
}

for (const forbidden of forbiddenServiceRequestRoutePatterns) {
  if (forbidden.pattern.test(serviceRequestRoutesSource)) {
    throw new Error(forbidden.message);
  }
}

for (const registration of requiredServiceRequestRegistrations) {
  if (!serviceRequestRoutesSource.includes(registration)) {
    throw new Error(
      `ServiceRequest root routes must register ${registration} so query, creation and FHIR modules remain wired.`
    );
  }
}

for (const forbidden of forbiddenServiceRequestRouteHelperPatterns) {
  if (forbidden.pattern.test(serviceRequestRouteHelpersSource)) {
    throw new Error(forbidden.message);
  }
}

for (const helper of requiredServiceRequestReferenceValidationHelpers) {
  if (!serviceRequestReferenceValidationSource.includes(helper)) {
    throw new Error(
      `ServiceRequest reference validation module must keep ${helper} so care-order links stay patient-scoped.`
    );
  }
}

for (const forbidden of forbiddenWorkflowTaskRoutePatterns) {
  if (forbidden.pattern.test(workflowTaskRoutesSource)) {
    throw new Error(forbidden.message);
  }
}

for (const registration of requiredWorkflowTaskRegistrations) {
  if (!workflowTaskRoutesSource.includes(registration)) {
    throw new Error(
      `WorkflowTask root routes must register ${registration} so query, creation and FHIR modules remain wired.`
    );
  }
}

for (const forbidden of forbiddenWorkflowTaskRouteHelperPatterns) {
  if (forbidden.pattern.test(workflowTaskRouteHelpersSource)) {
    throw new Error(forbidden.message);
  }
}

for (const helper of requiredWorkflowTaskReferenceValidationHelpers) {
  if (!workflowTaskReferenceValidationSource.includes(helper)) {
    throw new Error(
      `WorkflowTask reference validation module must keep ${helper} so task execution links stay patient-scoped.`
    );
  }
}

console.log(
  JSON.stringify(
    {
      status: "ok",
      check: "API route composition budget",
      routeReports
    },
    null,
    2
  )
);

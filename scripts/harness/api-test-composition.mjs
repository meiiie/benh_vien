import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";

const testBudgets = [
  {
    path: "apps/api/src/server.auth.login.test.ts",
    maxLines: 190,
    role: "API demo login, token TTL, bearer session and production toggle scenarios"
  },
  {
    path: "apps/api/src/server.auth-error-boundary.test.ts",
    maxLines: 160,
    role: "API auth validation, credential, session and missing-token error scenarios"
  },
  {
    path: "apps/api/src/server.auth-login-audit-boundary.test.ts",
    maxLines: 120,
    role: "API login success and failure audit evidence scenarios"
  },
  {
    path: "apps/api/src/server.auth-purpose-boundary.test.ts",
    maxLines: 130,
    role: "API purpose-of-use rejection, FHIR negotiation and audit evidence scenarios"
  },
  {
    path: "apps/api/src/server.auth-rate-limit-boundary.test.ts",
    maxLines: 90,
    role: "API login rate-limit boundary scenarios"
  },
  {
    path: "apps/api/src/server.runtime.test.ts",
    maxLines: 230,
    role: "API readiness, runtime metadata and diagnostics scenarios"
  },
  {
    path: "apps/api/src/server.runtime-config-boundary.test.ts",
    maxLines: 130,
    role: "API documentation flag and HTTP body limit runtime configuration scenarios"
  },
  {
    path: "apps/api/src/server.http-envelope-boundary.test.ts",
    maxLines: 220,
    role: "API HTTP security header, request-id and safe error envelope scenarios"
  },
  {
    path: "apps/api/src/server.startup-config.test.ts",
    maxLines: 260,
    role: "API startup and production configuration scenarios"
  },
  {
    path: "apps/api/src/server.patient-registry.test.ts",
    maxLines: 360,
    role: "API patient registry, identifier conflict and merge scenarios"
  },
  {
    path: "apps/api/src/server.patient-access.test.ts",
    maxLines: 220,
    role: "API patient access ABAC scenarios across clinical resources"
  },
  {
    path: "apps/api/src/server.patient-access.test-support.ts",
    maxLines: 130,
    role: "API patient access ABAC outside-organization fixture orchestration"
  },
  {
    path: "apps/api/src/server.patient-access.outside-clinical-fixture.ts",
    maxLines: 130,
    role: "API patient access ABAC outside clinical record fixture"
  },
  {
    path: "apps/api/src/server.patient-access.outside-medication-fixture.ts",
    maxLines: 150,
    role: "API patient access ABAC outside medication record fixture"
  },
  {
    path: "apps/api/src/server.patient-access.outside-diagnostic-fixture.ts",
    maxLines: 180,
    role: "API patient access ABAC outside diagnostic and imaging record fixture"
  },
  {
    path: "apps/api/src/server.patient-access.outside-sharing-fixture.ts",
    maxLines: 80,
    role: "API patient access ABAC outside consent and transfer fixture"
  },
  {
    path: "apps/api/src/server.patient-access.denied-request-catalog.ts",
    maxLines: 140,
    role: "API patient access ABAC denied route catalog"
  },
  {
    path: "apps/api/src/server.patient-access.patient-fixture.ts",
    maxLines: 50,
    role: "API patient access ABAC outside-patient creation helper"
  },
  {
    path: "apps/api/src/server.patient-access.test-resource.ts",
    maxLines: 40,
    role: "API patient access ABAC treatment resource creation helper"
  },
  {
    path: "apps/api/src/server.audit-boundary.test.ts",
    maxLines: 260,
    role: "API audit-purpose access and JSON audit trail scenarios"
  },
  {
    path: "apps/api/src/server.audit-fhir-boundary.test.ts",
    maxLines: 230,
    role: "API AuditEvent FHIR export and denial evidence scenarios"
  },
  {
    path: "apps/api/src/server.audit-integrity-boundary.test.ts",
    maxLines: 80,
    role: "API audit integrity verification scenarios"
  },
  {
    path: "apps/api/src/server.fhir-boundary.test.ts",
    maxLines: 260,
    role: "API FHIR metadata and bundle export scenarios"
  },
  {
    path: "apps/api/src/server.fhir-access-boundary.test.ts",
    maxLines: 240,
    role: "API FHIR access denial, OperationOutcome and audit evidence scenarios"
  },
  {
    path: "apps/api/src/server.fhir-document-boundary.test.ts",
    maxLines: 170,
    role: "API FHIR DocumentReference and Provenance scenarios"
  },
  {
    path: "apps/api/src/server.fhir-validation-boundary.test.ts",
    maxLines: 260,
    role: "API FHIR validation, primitive guard and OperationOutcome negotiation scenarios"
  },
  {
    path: "apps/api/src/server.provider-directory-boundary.test.ts",
    maxLines: 140,
    role: "API provider directory and baseline clinical access scenarios"
  },
  {
    path: "apps/api/src/server.clinical-resources.test.ts",
    maxLines: 260,
    role: "API allergy, condition and observation clinical record scenarios"
  },
  {
    path: "apps/api/src/server.care-workflow-boundary.test.ts",
    maxLines: 260,
    role: "API workflow task, procedure and service-request care workflow scenarios"
  },
  {
    path: "apps/api/src/server.medication-resources-boundary.test.ts",
    maxLines: 150,
    role: "API medication request prescribing scenarios"
  },
  {
    path: "apps/api/src/server.medication-dispense-boundary.test.ts",
    maxLines: 170,
    role: "API medication dispense supply and FHIR export scenarios"
  },
  {
    path: "apps/api/src/server.medication-administration-boundary.test.ts",
    maxLines: 170,
    role: "API medication administration performed-medication scenarios"
  },
  {
    path: "apps/api/src/server.diagnostic-resources-boundary.test.ts",
    maxLines: 220,
    role: "API diagnostic report, imaging study and PACS-facing resource scenarios"
  },
  {
    path: "apps/api/src/server.consent-boundary.test.ts",
    maxLines: 300,
    role: "API consent creation, FHIR export and revocation scenarios"
  },
  {
    path: "apps/api/src/server.record-transfer-boundary.test.ts",
    maxLines: 230,
    role: "API record-transfer package creation, FHIR Task and not-found scenarios"
  },
  {
    path: "apps/api/src/server.record-transfer-delivery-boundary.test.ts",
    maxLines: 150,
    role: "API record-transfer delivery success and receive lifecycle scenarios"
  },
  {
    path: "apps/api/src/server.record-transfer-delivery-failure-boundary.test.ts",
    maxLines: 220,
    role: "API record-transfer delivery rollback, failure and retry lifecycle scenarios"
  },
  {
    path: "apps/api/src/server.record-transfer-delivery.test-support.ts",
    maxLines: 150,
    role: "API record-transfer delivery boundary request helpers"
  },
  {
    path: "apps/api/src/server.record-transfer-consent-boundary.test.ts",
    maxLines: 180,
    role: "API record-transfer consent, endpoint and Bundle export guard scenarios"
  },
  {
    path: "apps/api/src/server.record-transfer-callback-boundary.test.ts",
    maxLines: 180,
    role: "API record-transfer operations callback lifecycle scenarios"
  },
  {
    path: "apps/api/src/server.record-transfer-callback-security-boundary.test.ts",
    maxLines: 160,
    role: "API record-transfer callback HMAC security boundary scenarios"
  },
  {
    path: "apps/api/src/server.record-transfer-callback.test-support.ts",
    maxLines: 120,
    role: "API record-transfer callback boundary request helpers"
  },
  {
    path: "apps/api/src/server.auth.test-support.ts",
    maxLines: 320,
    role: "Shared API auth boundary test support"
  },
  {
    path: "apps/api/src/infrastructure/postgres/postgres-pool.test.ts",
    maxLines: 90,
    role: "PostgreSQL pool lifecycle unit scenarios"
  },
  {
    path: "apps/api/src/modules/auth/auth-password.test.ts",
    maxLines: 40,
    role: "Auth password verification unit scenarios"
  },
  {
    path: "apps/api/src/modules/auth/auth-session.test.ts",
    maxLines: 280,
    role: "Auth session token unit scenarios"
  },
  {
    path: "apps/api/src/modules/auth/bearer-token.test.ts",
    maxLines: 40,
    role: "Auth bearer-token parsing unit scenarios"
  },
  {
    path: "apps/api/src/modules/auth/login-rate-limit.test.ts",
    maxLines: 180,
    role: "Auth login rate-limit unit scenarios"
  },
  {
    path: "apps/api/src/modules/network/local-only-hostname.test.ts",
    maxLines: 70,
    role: "Network local-only hostname unit scenarios"
  },
  {
    path: "apps/api/src/modules/procedures/procedure-reference-validation.test.ts",
    maxLines: 140,
    role: "Procedure reference validation unit scenarios"
  },
  {
    path: "apps/api/src/modules/record-transfer-delivery-attempts/record-transfer-delivery-worker.test.ts",
    maxLines: 240,
    role: "RecordTransfer delivery worker unit scenarios"
  },
  {
    path: "apps/api/src/modules/record-transfer-delivery-attempts/record-transfer-delivery-worker.test-support.ts",
    maxLines: 150,
    role: "RecordTransfer delivery worker fixture orchestration"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-acknowledgement-audit-metadata.test.ts",
    maxLines: 100,
    role: "RecordTransfer acknowledgement audit metadata unit scenarios"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-callback-signature.test.ts",
    maxLines: 260,
    role: "RecordTransfer callback signature verification unit scenarios"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-callback-signature-configuration.test.ts",
    maxLines: 70,
    role: "RecordTransfer callback signature production configuration scenarios"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-callback-signature.test-support.ts",
    maxLines: 70,
    role: "RecordTransfer callback signature shared unit test support"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-endpoint-policy.test.ts",
    maxLines: 100,
    role: "RecordTransfer endpoint policy unit scenarios"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-retry-worker.test.ts",
    maxLines: 220,
    role: "RecordTransfer retry worker lifecycle unit scenarios"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-retry-worker-audit-boundary.test.ts",
    maxLines: 100,
    role: "RecordTransfer retry worker audit persistence failure scenarios"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-retry-worker.test-support.ts",
    maxLines: 70,
    role: "RecordTransfer retry worker shared unit test fixtures"
  }
];

const retiredTestPaths = [
  {
    path: "apps/api/src/server.auth.test.ts",
    role: "legacy mixed auth/RBAC God suite"
  }
];

const loginBoundaryPath = resolve("apps/api/src/server.auth.login.test.ts");
const authErrorBoundaryPath = resolve("apps/api/src/server.auth-error-boundary.test.ts");
const authLoginAuditBoundaryPath = resolve(
  "apps/api/src/server.auth-login-audit-boundary.test.ts"
);
const authPurposeBoundaryPath = resolve("apps/api/src/server.auth-purpose-boundary.test.ts");
const authRateLimitBoundaryPath = resolve(
  "apps/api/src/server.auth-rate-limit-boundary.test.ts"
);
const authSupportPath = resolve("apps/api/src/server.auth.test-support.ts");
const runtimeBoundaryPath = resolve("apps/api/src/server.runtime.test.ts");
const runtimeConfigBoundaryPath = resolve(
  "apps/api/src/server.runtime-config-boundary.test.ts"
);
const httpEnvelopeBoundaryPath = resolve(
  "apps/api/src/server.http-envelope-boundary.test.ts"
);
const startupConfigBoundaryPath = resolve("apps/api/src/server.startup-config.test.ts");
const patientRegistryBoundaryPath = resolve("apps/api/src/server.patient-registry.test.ts");
const patientAccessBoundaryPath = resolve("apps/api/src/server.patient-access.test.ts");
const patientAccessSupportPath = resolve("apps/api/src/server.patient-access.test-support.ts");
const patientAccessOutsideClinicalFixturePath = resolve(
  "apps/api/src/server.patient-access.outside-clinical-fixture.ts"
);
const patientAccessOutsideMedicationFixturePath = resolve(
  "apps/api/src/server.patient-access.outside-medication-fixture.ts"
);
const patientAccessOutsideDiagnosticFixturePath = resolve(
  "apps/api/src/server.patient-access.outside-diagnostic-fixture.ts"
);
const patientAccessOutsideSharingFixturePath = resolve(
  "apps/api/src/server.patient-access.outside-sharing-fixture.ts"
);
const patientAccessDeniedRequestCatalogPath = resolve(
  "apps/api/src/server.patient-access.denied-request-catalog.ts"
);
const patientAccessPatientFixturePath = resolve(
  "apps/api/src/server.patient-access.patient-fixture.ts"
);
const patientAccessTestResourcePath = resolve(
  "apps/api/src/server.patient-access.test-resource.ts"
);
const auditBoundaryPath = resolve("apps/api/src/server.audit-boundary.test.ts");
const auditFhirBoundaryPath = resolve("apps/api/src/server.audit-fhir-boundary.test.ts");
const auditIntegrityBoundaryPath = resolve(
  "apps/api/src/server.audit-integrity-boundary.test.ts"
);
const fhirBoundaryPath = resolve("apps/api/src/server.fhir-boundary.test.ts");
const fhirAccessBoundaryPath = resolve("apps/api/src/server.fhir-access-boundary.test.ts");
const fhirDocumentBoundaryPath = resolve("apps/api/src/server.fhir-document-boundary.test.ts");
const fhirValidationBoundaryPath = resolve(
  "apps/api/src/server.fhir-validation-boundary.test.ts"
);
const providerDirectoryBoundaryPath = resolve(
  "apps/api/src/server.provider-directory-boundary.test.ts"
);
const clinicalResourcesBoundaryPath = resolve("apps/api/src/server.clinical-resources.test.ts");
const careWorkflowBoundaryPath = resolve("apps/api/src/server.care-workflow-boundary.test.ts");
const medicationResourcesBoundaryPath = resolve(
  "apps/api/src/server.medication-resources-boundary.test.ts"
);
const medicationDispenseBoundaryPath = resolve(
  "apps/api/src/server.medication-dispense-boundary.test.ts"
);
const medicationAdministrationBoundaryPath = resolve(
  "apps/api/src/server.medication-administration-boundary.test.ts"
);
const diagnosticResourcesBoundaryPath = resolve(
  "apps/api/src/server.diagnostic-resources-boundary.test.ts"
);
const consentBoundaryPath = resolve("apps/api/src/server.consent-boundary.test.ts");
const recordTransferBoundaryPath = resolve("apps/api/src/server.record-transfer-boundary.test.ts");
const recordTransferDeliveryBoundaryPath = resolve(
  "apps/api/src/server.record-transfer-delivery-boundary.test.ts"
);
const recordTransferDeliveryFailureBoundaryPath = resolve(
  "apps/api/src/server.record-transfer-delivery-failure-boundary.test.ts"
);
const recordTransferDeliverySupportPath = resolve(
  "apps/api/src/server.record-transfer-delivery.test-support.ts"
);
const recordTransferConsentBoundaryPath = resolve(
  "apps/api/src/server.record-transfer-consent-boundary.test.ts"
);
const recordTransferCallbackBoundaryPath = resolve(
  "apps/api/src/server.record-transfer-callback-boundary.test.ts"
);
const recordTransferCallbackSecurityBoundaryPath = resolve(
  "apps/api/src/server.record-transfer-callback-security-boundary.test.ts"
);
const recordTransferCallbackSupportPath = resolve(
  "apps/api/src/server.record-transfer-callback.test-support.ts"
);
const recordTransferDeliveryWorkerPath = resolve(
  "apps/api/src/modules/record-transfer-delivery-attempts/record-transfer-delivery-worker.test.ts"
);
const recordTransferDeliveryWorkerSupportPath = resolve(
  "apps/api/src/modules/record-transfer-delivery-attempts/record-transfer-delivery-worker.test-support.ts"
);
const recordTransferCallbackSignatureTestPath = resolve(
  "apps/api/src/modules/record-transfers/record-transfer-callback-signature.test.ts"
);
const recordTransferCallbackSignatureConfigurationTestPath = resolve(
  "apps/api/src/modules/record-transfers/record-transfer-callback-signature-configuration.test.ts"
);
const recordTransferCallbackSignatureTestSupportPath = resolve(
  "apps/api/src/modules/record-transfers/record-transfer-callback-signature.test-support.ts"
);
const recordTransferRetryWorkerTestPath = resolve(
  "apps/api/src/modules/record-transfers/record-transfer-retry-worker.test.ts"
);
const recordTransferRetryWorkerAuditTestPath = resolve(
  "apps/api/src/modules/record-transfers/record-transfer-retry-worker-audit-boundary.test.ts"
);
const recordTransferRetryWorkerTestSupportPath = resolve(
  "apps/api/src/modules/record-transfers/record-transfer-retry-worker.test-support.ts"
);

const requiredLoginBoundaryPatterns = [
  /returns a signed demo session/,
  /uses the configured auth token TTL/,
  /accepts case-insensitive Bearer auth schemes/,
  /disables demo login by default in production/,
  /allows demo login in production only when explicitly enabled/
];
const requiredAuthErrorBoundaryPatterns = [
  /returns request ids for auth boundary errors/,
  /auth-invalid-payload-001/,
  /auth-role-mismatch-001/,
  /rejects patient access without a Bearer token/
];
const requiredAuthLoginAuditBoundaryPatterns = [
  /records successful and failed login attempts in the global audit trail/,
  /auth.login.failure/,
  /usernameHash/
];
const requiredAuthPurposeBoundaryPatterns = [
  /rejects invalid purpose-of-use headers instead of silently defaulting to treatment/,
  /INVALID_PURPOSE_OF_USE/,
  /invalid-purpose-fhir-001/
];
const requiredAuthRateLimitBoundaryPatterns = [
  /rate limits repeated login attempts/,
  /AUTH_RATE_LIMITED/,
  /retry-after/
];
const retiredAuthSupportPatterns = [
  /FailingRecordTransferDeliveryAttemptRepository/
];
const requiredRuntimeBoundaryPatterns = [
  /returns readiness checks/,
  /returns redacted runtime metadata/,
  /returns runtime diagnostics to operations and audit sessions/,
  /marks readiness as not ready when the login rate limit store is unhealthy/
];
const requiredRuntimeConfigBoundaryPatterns = [
  /serves API documentation outside production by default/,
  /can disable API documentation through runtime configuration/,
  /rejects invalid HTTP body limit configuration/,
  /rejects oversized JSON request bodies with a safe request error/
];
const requiredHttpEnvelopeBoundaryPatterns = [
  /sets baseline HTTP security headers/,
  /echoes the request id header for trace correlation/,
  /replaces unsafe upstream request ids before echoing them/,
  /returns a safe validation error envelope/,
  /returns a safe internal error envelope without leaking implementation details/
];
const requiredStartupConfigBoundaryPatterns = [
  /requires explicit CORS origins/,
  /rejects unsafe CORS origins/,
  /requires PostgreSQL repositories/,
  /rejects local-only public API base URLs/,
  /requires callback signature secrets at startup in production/
];
const requiredPatientRegistryBoundaryPatterns = [
  /allows clinician treatment access to patient registry/,
  /blocks duplicate patient identifiers/,
  /merges a duplicate patient record/
];
const requiredPatientAccessBoundaryPatterns = [
  /filters treatment patient access by the actor provider organization/,
  /patient-abac-denied-001/,
  /createOutsidePatientAccessFixture/
];
const requiredPatientAccessSupportPatterns = [
  /createOutsidePatientAccessFixture/,
  /createOutsidePatient/,
  /createOutsideClinicalFixture/,
  /createOutsideMedicationFixture/,
  /createOutsideDiagnosticFixture/,
  /createOutsideSharingFixture/,
  /createListDeniedRequests/,
  /createReadDeniedRequests/,
  /createFhirExportDeniedRequests/
];
const requiredPatientAccessClinicalFixturePatterns = [
  /createOutsideClinicalFixture/,
  /Outside organization visit/,
  /Allergy to penicillin/,
  /Body temperature/
];
const requiredPatientAccessMedicationFixturePatterns = [
  /createOutsideMedicationFixture/,
  /medication-requests/,
  /medication-dispenses/,
  /medication-administrations/,
  /Amoxicillin/
];
const requiredPatientAccessDiagnosticFixturePatterns = [
  /createOutsideDiagnosticFixture/,
  /service-requests/,
  /diagnostic-reports/,
  /imaging-studies/,
  /workflow-tasks/,
  /OUTSIDE-CXR-ABAC-001/
];
const requiredPatientAccessSharingFixturePatterns = [
  /createOutsideSharingFixture/,
  /record-sharing/,
  /record-transfers/
];
const requiredPatientAccessDeniedRequestCatalogPatterns = [
  /record-transfer-list-abac-denied-001/,
  /transfer-read-abac-denied-001/,
  /imaging-study-export-abac-denied-001/
];
const requiredPatientAccessTestResourcePatterns = [
  /createTreatmentResource/,
  /jsonRequestHeaders/,
  /treatmentHeaders/
];
const requiredPatientAccessPatientFixturePatterns = [
  /createOutsidePatient/,
  /MRN-OUTSIDE-TEST/,
  /hospital-outside-demo/
];
const retiredPatientAccessSupportPatterns = [
  /record-transfer-list-abac-denied-001/,
  /imaging-study-export-abac-denied-001/,
  /Outside organization visit/,
  /medication-requests/,
  /diagnostic-reports/,
  /record-sharing/
];
const requiredAuditBoundaryPatterns = [
  /allows auditor audit-purpose patient registry context/,
  /allows auditor audit-purpose access to patient audit events/,
  /allows auditor audit-purpose review of global security audit events/,
  /stores request id in audit metadata for clinical access/
];
const requiredAuditFhirBoundaryPatterns = [
  /records denied patient access in the patient audit trail and FHIR export/,
  /exports patient audit trail as a FHIR AuditEvent Bundle/,
  /denies clinician treatment-purpose export of the audit FHIR Bundle/
];
const requiredAuditIntegrityBoundaryPatterns = [
  /returns a verified audit integrity report/,
  /latestHash/
];
const requiredFhirBoundaryPatterns = [
  /serves FHIR CapabilityStatement metadata without a demo session/,
  /returns a patient-record FHIR Bundle for treatment export/,
  /returns a patient-record FHIR document Bundle with Composition first/
];
const requiredFhirAccessBoundaryPatterns = [
  /denies nurse FHIR export even with treatment purpose/,
  /negotiates auth and RBAC denials on FHIR endpoints as OperationOutcome/,
  /negotiates patient-scope ABAC denials on FHIR endpoints as OperationOutcome/
];
const requiredFhirDocumentBoundaryPatterns = [
  /exports signed clinical document provenance as FHIR Provenance/,
  /exports clinical document attachment metadata as FHIR DocumentReference/,
  /returns FHIR OperationOutcome when a FHIR DocumentReference target is missing/
];
const requiredFhirValidationBoundaryPatterns = [
  /negotiates validation errors as FHIR OperationOutcome/,
  /rejects clinical document attachment metadata with invalid MIME type or SHA-1 hash/,
  /rejects FHIR unsignedInt overflows at the request boundary/,
  /rejects malformed DICOM UIDs at the request boundary/
];
const requiredProviderDirectoryBoundaryPatterns = [
  /returns provider directory and FHIR Endpoint resources/,
  /denies nurse encounter creation and finish privileges/
];
const requiredClinicalResourcesBoundaryPatterns = [
  /lists allergy intolerances and exports them as FHIR AllergyIntolerance/,
  /lists conditions and exports them as FHIR Condition/,
  /lists observations and exports them as FHIR Observation/
];
const requiredCareWorkflowBoundaryPatterns = [
  /lists workflow tasks and exports them as FHIR Task/,
  /lists procedures and exports them as FHIR Procedure/,
  /creates a procedure linked to a service request and diagnostic report/,
  /lists service requests and exports them as FHIR ServiceRequest/
];
const requiredMedicationResourcesBoundaryPatterns = [
  /lists medication requests and exports them as FHIR MedicationRequest/,
  /creates a medication request linked to a patient condition/
];
const requiredMedicationDispenseBoundaryPatterns = [
  /lists medication dispenses and exports them as FHIR MedicationDispense/,
  /creates a medication dispense linked to the original medication request/
];
const requiredMedicationAdministrationBoundaryPatterns = [
  /lists medication administrations and exports them as FHIR MedicationAdministration/,
  /creates a medication administration linked to the original medication request/
];
const requiredDiagnosticResourcesBoundaryPatterns = [
  /lists diagnostic reports and exports them as FHIR DiagnosticReport/,
  /lists imaging studies and exports them as FHIR ImagingStudy/
];
const requiredConsentBoundaryPatterns = [
  /lists active patient consents for treatment users/,
  /creates a patient consent and uses it for Bundle export/,
  /exports patient consent as FHIR Consent/,
  /revokes a patient consent and blocks later record sharing/
];
const requiredRecordTransferBoundaryPatterns = [
  /lists record transfer packages for a patient/,
  /creates a record transfer package and exports it as FHIR Task/,
  /rejects creating a record transfer directly in the dead-lettered state/,
  /keeps JSON and FHIR not-found errors separate for record transfers/
];
const requiredRecordTransferDeliveryBoundaryPatterns = [
  /moves a record transfer through sent and received milestones/,
  /getRecordTransferDeliveryAttempts/,
  /Người xác nhận nhận hồ sơ/
];
const requiredRecordTransferDeliveryFailureBoundaryPatterns = [
  /rolls back a record transfer when queuing the delivery attempt fails/,
  /records failed record transfer delivery and prepares a retry/,
  /Recipient gateway unavailable\./,
  /attemptNumber: 2/
];
const requiredRecordTransferDeliverySupportPatterns = [
  /readyRecordTransferDeliverySession/,
  /FailingRecordTransferDeliveryAttemptRepository/,
  /sendRecordTransfer/,
  /failRecordTransfer/,
  /retryRecordTransfer/
];
const retiredRecordTransferDeliveryBoundaryPatterns = [
  /rolls back a record transfer/,
  /records failed record transfer delivery/,
  /FailingRecordTransferDeliveryAttemptRepository/
];
const requiredRecordTransferConsentBoundaryPatterns = [
  /denies record transfer creation when consent does not cover the recipient/,
  /requires a recipient FHIR Bundle endpoint before creating a record transfer/,
  /requires transfer context before exporting a patient-record FHIR Bundle/,
  /denies Bundle export when consent does not match the recipient/
];
const requiredRecordTransferCallbackBoundaryPatterns = [
  /accepts an operations acknowledgement callback for a sent record transfer/,
  /gateway-hai-phong-referral/,
  /fhir-task/
];
const requiredRecordTransferCallbackSecurityBoundaryPatterns = [
  /requires a valid HMAC signature for acknowledgement callbacks/,
  /RECORD_TRANSFER_CALLBACK_SIGNATURE_REQUIRED/,
  /RECORD_TRANSFER_CALLBACK_SIGNATURE_INVALID/
];
const requiredRecordTransferCallbackSupportPatterns = [
  /recordTransferAcknowledgementCallbackUrl/,
  /configureRecordTransferCallbackSecret/,
  /sendRecordTransferForCallback/,
  /postRecordTransferAcknowledgementCallback/
];
const retiredRecordTransferCallbackBoundaryPatterns = [
  /RECORD_TRANSFER_CALLBACK_SIGNATURE_REQUIRED/,
  /RECORD_TRANSFER_CALLBACK_SIGNATURE_INVALID/,
  /signedRecordTransferCallbackHeaders/
];
const requiredRecordTransferDeliveryWorkerPatterns = [
  /posts a queued FHIR Bundle and marks the delivery attempt as succeeded/,
  /marks the attempt and record transfer as failed when the endpoint rejects the Bundle/,
  /does not call the sender when production endpoint policy rejects the target endpoint/,
  /processQueuedRecordTransferDeliveries/
];
const requiredRecordTransferDeliveryWorkerSupportPatterns = [
  /createDeliveryWorkerDependencies/,
  /RecordTransfer\.create/,
  /RecordTransferDeliveryAttempt\.queue/,
  /InMemoryRecordTransferDeliveryAttemptRepository/,
  /patient-worker-001/
];
const retiredRecordTransferDeliveryWorkerPatterns = [
  /RecordTransfer\.create/,
  /new InMemoryPatientRepository/
];
const requiredRecordTransferCallbackSignaturePatterns = [
  /does not require signatures in development when no callback secret is configured/,
  /requires a fresh matching HMAC signature when callback secret is configured/,
  /rejects malformed, expired and oversized callback signatures/,
  /selects per-gateway callback secrets by key id when configured/,
  /fails closed in production when callback secret is missing/
];
const requiredRecordTransferCallbackSignatureConfigurationPatterns = [
  /validates callback signature configuration at production startup/,
  /assertRecordTransferCallbackSignatureConfiguration/,
  /không được dùng giá trị mẫu/
];
const requiredRecordTransferCallbackSignatureSupportPatterns = [
  /callbackSecret/,
  /callbackKeyId/,
  /captureCallbackSignatureEnv/,
  /restoreCallbackSignatureEnv/
];
const retiredRecordTransferCallbackSignaturePatterns = [
  /assertRecordTransferCallbackSignatureConfiguration/
];
const requiredRecordTransferRetryWorkerPatterns = [
  /returns due failed transfers to the ready queue/,
  /dead-letters failed transfers that reached the configured retry ceiling/,
  /record-transfer\.retry/,
  /record-transfer\.dead-letter/
];
const requiredRecordTransferRetryWorkerAuditPatterns = [
  /does not mark persisted retry lifecycle changes as skipped when audit persistence fails/,
  /FailingAuditEventRepository/,
  /skippedTransferIds: \[\]/
];
const requiredRecordTransferRetryWorkerSupportPatterns = [
  /createFailedRecordTransfer/,
  /FailingAuditEventRepository/,
  /patient-worker-001/,
  /RecordTransfer\.create/
];
const retiredRecordTransferRetryWorkerPatterns = [
  /FailingAuditEventRepository/,
  /Audit repository is unavailable/
];

const testReports = [];

for (const retired of retiredTestPaths) {
  try {
    await stat(resolve(retired.path));
  } catch (error) {
    if (error && error.code === "ENOENT") {
      continue;
    }

    throw error;
  }

  throw new Error(`${retired.path} has been retired; keep ${retired.role} split by boundary.`);
}

for (const budget of testBudgets) {
  const absolutePath = resolve(budget.path);
  await stat(absolutePath);
  const source = await readFile(absolutePath, "utf8");
  const lineCount = source.split(/\r?\n/).length;

  if (lineCount > budget.maxLines) {
    throw new Error(
      `${budget.path} has ${lineCount} lines; keep it at or below ${budget.maxLines} so ${budget.role} does not become a maintenance bottleneck.`
    );
  }

  testReports.push({
    path: budget.path,
    lineCount,
    maxLines: budget.maxLines,
    role: budget.role
  });
}

const loginBoundarySource = await readFile(loginBoundaryPath, "utf8");
const authErrorBoundarySource = await readFile(authErrorBoundaryPath, "utf8");
const authLoginAuditBoundarySource = await readFile(authLoginAuditBoundaryPath, "utf8");
const authPurposeBoundarySource = await readFile(authPurposeBoundaryPath, "utf8");
const authRateLimitBoundarySource = await readFile(authRateLimitBoundaryPath, "utf8");
const authSupportSource = await readFile(authSupportPath, "utf8");
const runtimeBoundarySource = await readFile(runtimeBoundaryPath, "utf8");
const runtimeConfigBoundarySource = await readFile(runtimeConfigBoundaryPath, "utf8");
const httpEnvelopeBoundarySource = await readFile(httpEnvelopeBoundaryPath, "utf8");
const startupConfigBoundarySource = await readFile(startupConfigBoundaryPath, "utf8");
const patientRegistryBoundarySource = await readFile(patientRegistryBoundaryPath, "utf8");
const patientAccessBoundarySource = await readFile(patientAccessBoundaryPath, "utf8");
const patientAccessSupportSource = await readFile(patientAccessSupportPath, "utf8");
const patientAccessOutsideClinicalFixtureSource = await readFile(
  patientAccessOutsideClinicalFixturePath,
  "utf8"
);
const patientAccessOutsideMedicationFixtureSource = await readFile(
  patientAccessOutsideMedicationFixturePath,
  "utf8"
);
const patientAccessOutsideDiagnosticFixtureSource = await readFile(
  patientAccessOutsideDiagnosticFixturePath,
  "utf8"
);
const patientAccessOutsideSharingFixtureSource = await readFile(
  patientAccessOutsideSharingFixturePath,
  "utf8"
);
const patientAccessDeniedRequestCatalogSource = await readFile(
  patientAccessDeniedRequestCatalogPath,
  "utf8"
);
const patientAccessPatientFixtureSource = await readFile(
  patientAccessPatientFixturePath,
  "utf8"
);
const patientAccessTestResourceSource = await readFile(
  patientAccessTestResourcePath,
  "utf8"
);
const auditBoundarySource = await readFile(auditBoundaryPath, "utf8");
const auditFhirBoundarySource = await readFile(auditFhirBoundaryPath, "utf8");
const auditIntegrityBoundarySource = await readFile(auditIntegrityBoundaryPath, "utf8");
const fhirBoundarySource = await readFile(fhirBoundaryPath, "utf8");
const fhirAccessBoundarySource = await readFile(fhirAccessBoundaryPath, "utf8");
const fhirDocumentBoundarySource = await readFile(fhirDocumentBoundaryPath, "utf8");
const fhirValidationBoundarySource = await readFile(
  fhirValidationBoundaryPath,
  "utf8"
);
const providerDirectoryBoundarySource = await readFile(
  providerDirectoryBoundaryPath,
  "utf8"
);
const clinicalResourcesBoundarySource = await readFile(
  clinicalResourcesBoundaryPath,
  "utf8"
);
const careWorkflowBoundarySource = await readFile(careWorkflowBoundaryPath, "utf8");
const medicationResourcesBoundarySource = await readFile(
  medicationResourcesBoundaryPath,
  "utf8"
);
const medicationDispenseBoundarySource = await readFile(
  medicationDispenseBoundaryPath,
  "utf8"
);
const medicationAdministrationBoundarySource = await readFile(
  medicationAdministrationBoundaryPath,
  "utf8"
);
const diagnosticResourcesBoundarySource = await readFile(
  diagnosticResourcesBoundaryPath,
  "utf8"
);
const consentBoundarySource = await readFile(consentBoundaryPath, "utf8");
const recordTransferBoundarySource = await readFile(recordTransferBoundaryPath, "utf8");
const recordTransferDeliveryBoundarySource = await readFile(
  recordTransferDeliveryBoundaryPath,
  "utf8"
);
const recordTransferDeliveryFailureBoundarySource = await readFile(
  recordTransferDeliveryFailureBoundaryPath,
  "utf8"
);
const recordTransferDeliverySupportSource = await readFile(
  recordTransferDeliverySupportPath,
  "utf8"
);
const recordTransferConsentBoundarySource = await readFile(
  recordTransferConsentBoundaryPath,
  "utf8"
);
const recordTransferCallbackBoundarySource = await readFile(
  recordTransferCallbackBoundaryPath,
  "utf8"
);
const recordTransferCallbackSecurityBoundarySource = await readFile(
  recordTransferCallbackSecurityBoundaryPath,
  "utf8"
);
const recordTransferCallbackSupportSource = await readFile(
  recordTransferCallbackSupportPath,
  "utf8"
);
const recordTransferDeliveryWorkerSource = await readFile(
  recordTransferDeliveryWorkerPath,
  "utf8"
);
const recordTransferDeliveryWorkerSupportSource = await readFile(
  recordTransferDeliveryWorkerSupportPath,
  "utf8"
);
const recordTransferCallbackSignatureTestSource = await readFile(
  recordTransferCallbackSignatureTestPath,
  "utf8"
);
const recordTransferCallbackSignatureConfigurationTestSource = await readFile(
  recordTransferCallbackSignatureConfigurationTestPath,
  "utf8"
);
const recordTransferCallbackSignatureTestSupportSource = await readFile(
  recordTransferCallbackSignatureTestSupportPath,
  "utf8"
);
const recordTransferRetryWorkerTestSource = await readFile(
  recordTransferRetryWorkerTestPath,
  "utf8"
);
const recordTransferRetryWorkerAuditTestSource = await readFile(
  recordTransferRetryWorkerAuditTestPath,
  "utf8"
);
const recordTransferRetryWorkerTestSupportSource = await readFile(
  recordTransferRetryWorkerTestSupportPath,
  "utf8"
);

for (const required of requiredLoginBoundaryPatterns) {
  if (!required.test(loginBoundarySource)) {
    throw new Error(
      "server.auth.login.test.ts must keep demo login, token TTL, bearer session and production toggle scenarios."
    );
  }
}

for (const required of requiredAuthErrorBoundaryPatterns) {
  if (!required.test(authErrorBoundarySource)) {
    throw new Error(
      "server.auth-error-boundary.test.ts must keep auth validation, credential, session and missing-token error scenarios."
    );
  }
}

for (const required of requiredAuthLoginAuditBoundaryPatterns) {
  if (!required.test(authLoginAuditBoundarySource)) {
    throw new Error(
      "server.auth-login-audit-boundary.test.ts must keep login success and failure audit evidence scenarios."
    );
  }
}

for (const required of requiredAuthPurposeBoundaryPatterns) {
  if (!required.test(authPurposeBoundarySource)) {
    throw new Error(
      "server.auth-purpose-boundary.test.ts must keep purpose-of-use rejection, FHIR negotiation and audit evidence scenarios."
    );
  }
}

for (const required of requiredAuthRateLimitBoundaryPatterns) {
  if (!required.test(authRateLimitBoundarySource)) {
    throw new Error(
      "server.auth-rate-limit-boundary.test.ts must keep login rate-limit boundary scenarios."
    );
  }
}

for (const retired of retiredAuthSupportPatterns) {
  if (retired.test(authSupportSource)) {
    throw new Error(
      "server.auth.test-support.ts must not absorb record-transfer delivery fixture helpers."
    );
  }
}

for (const required of requiredRuntimeBoundaryPatterns) {
  if (!required.test(runtimeBoundarySource)) {
    throw new Error(
      "server.runtime.test.ts must keep core readiness, runtime metadata and diagnostics scenarios."
    );
  }
}

for (const required of requiredRuntimeConfigBoundaryPatterns) {
  if (!required.test(runtimeConfigBoundarySource)) {
    throw new Error(
      "server.runtime-config-boundary.test.ts must keep API docs flag and HTTP body limit configuration scenarios."
    );
  }
}

for (const required of requiredHttpEnvelopeBoundaryPatterns) {
  if (!required.test(httpEnvelopeBoundarySource)) {
    throw new Error(
      "server.http-envelope-boundary.test.ts must keep HTTP security header, request-id and safe error envelope scenarios."
    );
  }
}

for (const required of requiredStartupConfigBoundaryPatterns) {
  if (!required.test(startupConfigBoundarySource)) {
    throw new Error(
      "server.startup-config.test.ts must keep core CORS, repository, public API URL and production startup validation scenarios."
    );
  }
}

for (const required of requiredPatientRegistryBoundaryPatterns) {
  if (!required.test(patientRegistryBoundarySource)) {
    throw new Error(
      "server.patient-registry.test.ts must keep core patient registry access, identifier conflict and merge scenarios."
    );
  }
}

for (const required of requiredPatientAccessBoundaryPatterns) {
  if (!required.test(patientAccessBoundarySource)) {
    throw new Error(
      "server.patient-access.test.ts must keep high-level patient-scope ABAC denial orchestration across list, read and FHIR export scenarios."
    );
  }
}

for (const required of requiredPatientAccessSupportPatterns) {
  if (!required.test(patientAccessSupportSource)) {
    throw new Error(
      "server.patient-access.test-support.ts must keep outside-organization ABAC fixture orchestration."
    );
  }
}

for (const required of requiredPatientAccessClinicalFixturePatterns) {
  if (!required.test(patientAccessOutsideClinicalFixtureSource)) {
    throw new Error(
      "server.patient-access.outside-clinical-fixture.ts must keep outside clinical record fixture coverage."
    );
  }
}

for (const required of requiredPatientAccessMedicationFixturePatterns) {
  if (!required.test(patientAccessOutsideMedicationFixtureSource)) {
    throw new Error(
      "server.patient-access.outside-medication-fixture.ts must keep outside medication record fixture coverage."
    );
  }
}

for (const required of requiredPatientAccessDiagnosticFixturePatterns) {
  if (!required.test(patientAccessOutsideDiagnosticFixtureSource)) {
    throw new Error(
      "server.patient-access.outside-diagnostic-fixture.ts must keep outside diagnostic and imaging record fixture coverage."
    );
  }
}

for (const required of requiredPatientAccessSharingFixturePatterns) {
  if (!required.test(patientAccessOutsideSharingFixtureSource)) {
    throw new Error(
      "server.patient-access.outside-sharing-fixture.ts must keep outside consent and transfer fixture coverage."
    );
  }
}

for (const required of requiredPatientAccessDeniedRequestCatalogPatterns) {
  if (!required.test(patientAccessDeniedRequestCatalogSource)) {
    throw new Error(
      "server.patient-access.denied-request-catalog.ts must keep ABAC denied route catalog coverage."
    );
  }
}

for (const required of requiredPatientAccessTestResourcePatterns) {
  if (!required.test(patientAccessTestResourceSource)) {
    throw new Error(
      "server.patient-access.test-resource.ts must keep the treatment resource creation helper."
    );
  }
}

for (const required of requiredPatientAccessPatientFixturePatterns) {
  if (!required.test(patientAccessPatientFixtureSource)) {
    throw new Error(
      "server.patient-access.patient-fixture.ts must keep outside-patient creation coverage."
    );
  }
}

for (const retired of retiredPatientAccessSupportPatterns) {
  if (retired.test(patientAccessSupportSource)) {
    throw new Error(
      "server.patient-access.test-support.ts must not absorb denied route catalog entries back into the fixture orchestration."
    );
  }
}

for (const required of requiredAuditBoundaryPatterns) {
  if (!required.test(auditBoundarySource)) {
    throw new Error(
      "server.audit-boundary.test.ts must keep audit-purpose access and JSON audit trail scenarios."
    );
  }
}

for (const required of requiredAuditFhirBoundaryPatterns) {
  if (!required.test(auditFhirBoundarySource)) {
    throw new Error(
      "server.audit-fhir-boundary.test.ts must keep AuditEvent FHIR export and denial evidence scenarios."
    );
  }
}

for (const required of requiredAuditIntegrityBoundaryPatterns) {
  if (!required.test(auditIntegrityBoundarySource)) {
    throw new Error(
      "server.audit-integrity-boundary.test.ts must keep audit integrity verification scenarios."
    );
  }
}

for (const required of requiredFhirBoundaryPatterns) {
  if (!required.test(fhirBoundarySource)) {
    throw new Error(
      "server.fhir-boundary.test.ts must keep FHIR metadata and Bundle scenarios."
    );
  }
}

for (const required of requiredFhirAccessBoundaryPatterns) {
  if (!required.test(fhirAccessBoundarySource)) {
    throw new Error(
      "server.fhir-access-boundary.test.ts must keep FHIR access denial, OperationOutcome and audit evidence scenarios."
    );
  }
}

for (const required of requiredFhirDocumentBoundaryPatterns) {
  if (!required.test(fhirDocumentBoundarySource)) {
    throw new Error(
      "server.fhir-document-boundary.test.ts must keep FHIR DocumentReference and Provenance scenarios."
    );
  }
}

for (const required of requiredFhirValidationBoundaryPatterns) {
  if (!required.test(fhirValidationBoundarySource)) {
    throw new Error(
      "server.fhir-validation-boundary.test.ts must keep FHIR validation, unsignedInt and DICOM UID scenarios."
    );
  }
}

for (const required of requiredProviderDirectoryBoundaryPatterns) {
  if (!required.test(providerDirectoryBoundarySource)) {
    throw new Error(
      "server.provider-directory-boundary.test.ts must keep provider-directory and baseline clinical access scenarios."
    );
  }
}

for (const required of requiredClinicalResourcesBoundaryPatterns) {
  if (!required.test(clinicalResourcesBoundarySource)) {
    throw new Error(
      "server.clinical-resources.test.ts must keep allergy, condition and observation clinical record scenarios."
    );
  }
}

for (const required of requiredCareWorkflowBoundaryPatterns) {
  if (!required.test(careWorkflowBoundarySource)) {
    throw new Error(
      "server.care-workflow-boundary.test.ts must keep workflow task, procedure and service-request care workflow scenarios."
    );
  }
}

for (const required of requiredMedicationResourcesBoundaryPatterns) {
  if (!required.test(medicationResourcesBoundarySource)) {
    throw new Error(
      "server.medication-resources-boundary.test.ts must keep medication request prescribing scenarios."
    );
  }
}

for (const required of requiredMedicationDispenseBoundaryPatterns) {
  if (!required.test(medicationDispenseBoundarySource)) {
    throw new Error(
      "server.medication-dispense-boundary.test.ts must keep medication dispense supply and FHIR export scenarios."
    );
  }
}

for (const required of requiredMedicationAdministrationBoundaryPatterns) {
  if (!required.test(medicationAdministrationBoundarySource)) {
    throw new Error(
      "server.medication-administration-boundary.test.ts must keep medication administration scenarios."
    );
  }
}

for (const required of requiredDiagnosticResourcesBoundaryPatterns) {
  if (!required.test(diagnosticResourcesBoundarySource)) {
    throw new Error(
      "server.diagnostic-resources-boundary.test.ts must keep diagnostic report and imaging study scenarios."
    );
  }
}

for (const required of requiredConsentBoundaryPatterns) {
  if (!required.test(consentBoundarySource)) {
    throw new Error(
      "server.consent-boundary.test.ts must keep consent listing, creation, FHIR export and revocation scenarios."
    );
  }
}

for (const required of requiredRecordTransferBoundaryPatterns) {
  if (!required.test(recordTransferBoundarySource)) {
    throw new Error(
      "server.record-transfer-boundary.test.ts must keep record-transfer package creation, FHIR Task and not-found scenarios."
    );
  }
}

for (const required of requiredRecordTransferDeliveryBoundaryPatterns) {
  if (!required.test(recordTransferDeliveryBoundarySource)) {
    throw new Error(
      "server.record-transfer-delivery-boundary.test.ts must keep delivery success and receive lifecycle scenarios."
    );
  }
}

for (const required of requiredRecordTransferDeliveryFailureBoundaryPatterns) {
  if (!required.test(recordTransferDeliveryFailureBoundarySource)) {
    throw new Error(
      "server.record-transfer-delivery-failure-boundary.test.ts must keep delivery rollback, failure and retry lifecycle scenarios."
    );
  }
}

for (const required of requiredRecordTransferDeliverySupportPatterns) {
  if (!required.test(recordTransferDeliverySupportSource)) {
    throw new Error(
      "server.record-transfer-delivery.test-support.ts must keep delivery boundary request and failure fixture helpers."
    );
  }
}

for (const retired of retiredRecordTransferDeliveryBoundaryPatterns) {
  if (retired.test(recordTransferDeliveryBoundarySource)) {
    throw new Error(
      "server.record-transfer-delivery-boundary.test.ts must not absorb failure or fixture scenarios back into the success lifecycle suite."
    );
  }
}

for (const required of requiredRecordTransferConsentBoundaryPatterns) {
  if (!required.test(recordTransferConsentBoundarySource)) {
    throw new Error(
      "server.record-transfer-consent-boundary.test.ts must keep consent, endpoint and Bundle export guard scenarios."
    );
  }
}

for (const required of requiredRecordTransferCallbackBoundaryPatterns) {
  if (!required.test(recordTransferCallbackBoundarySource)) {
    throw new Error(
      "server.record-transfer-callback-boundary.test.ts must keep operations callback lifecycle scenarios."
    );
  }
}

for (const required of requiredRecordTransferCallbackSecurityBoundaryPatterns) {
  if (!required.test(recordTransferCallbackSecurityBoundarySource)) {
    throw new Error(
      "server.record-transfer-callback-security-boundary.test.ts must keep callback HMAC security scenarios."
    );
  }
}

for (const required of requiredRecordTransferCallbackSupportPatterns) {
  if (!required.test(recordTransferCallbackSupportSource)) {
    throw new Error(
      "server.record-transfer-callback.test-support.ts must keep callback request helper fixtures."
    );
  }
}

for (const retired of retiredRecordTransferCallbackBoundaryPatterns) {
  if (retired.test(recordTransferCallbackBoundarySource)) {
    throw new Error(
      "server.record-transfer-callback-boundary.test.ts must not absorb HMAC security scenarios back into the lifecycle suite."
    );
  }
}

for (const required of requiredRecordTransferDeliveryWorkerPatterns) {
  if (!required.test(recordTransferDeliveryWorkerSource)) {
    throw new Error(
      "record-transfer-delivery-worker.test.ts must keep delivery success, endpoint failure and production endpoint policy scenarios."
    );
  }
}

for (const required of requiredRecordTransferDeliveryWorkerSupportPatterns) {
  if (!required.test(recordTransferDeliveryWorkerSupportSource)) {
    throw new Error(
      "record-transfer-delivery-worker.test-support.ts must keep record-transfer delivery fixture orchestration."
    );
  }
}

for (const retired of retiredRecordTransferDeliveryWorkerPatterns) {
  if (retired.test(recordTransferDeliveryWorkerSource)) {
    throw new Error(
      "record-transfer-delivery-worker.test.ts must not absorb fixture orchestration back into behavior scenarios."
    );
  }
}

for (const required of requiredRecordTransferCallbackSignaturePatterns) {
  if (!required.test(recordTransferCallbackSignatureTestSource)) {
    throw new Error(
      "record-transfer-callback-signature.test.ts must keep callback HMAC verification scenarios."
    );
  }
}

for (const required of requiredRecordTransferCallbackSignatureConfigurationPatterns) {
  if (!required.test(recordTransferCallbackSignatureConfigurationTestSource)) {
    throw new Error(
      "record-transfer-callback-signature-configuration.test.ts must keep production startup configuration scenarios."
    );
  }
}

for (const required of requiredRecordTransferCallbackSignatureSupportPatterns) {
  if (!required.test(recordTransferCallbackSignatureTestSupportSource)) {
    throw new Error(
      "record-transfer-callback-signature.test-support.ts must keep shared callback signature test fixtures."
    );
  }
}

for (const retired of retiredRecordTransferCallbackSignaturePatterns) {
  if (retired.test(recordTransferCallbackSignatureTestSource)) {
    throw new Error(
      "record-transfer-callback-signature.test.ts must not absorb production startup configuration scenarios back into verification tests."
    );
  }
}

for (const required of requiredRecordTransferRetryWorkerPatterns) {
  if (!required.test(recordTransferRetryWorkerTestSource)) {
    throw new Error(
      "record-transfer-retry-worker.test.ts must keep retry and dead-letter lifecycle scenarios."
    );
  }
}

for (const required of requiredRecordTransferRetryWorkerAuditPatterns) {
  if (!required.test(recordTransferRetryWorkerAuditTestSource)) {
    throw new Error(
      "record-transfer-retry-worker-audit-boundary.test.ts must keep audit persistence failure scenarios."
    );
  }
}

for (const required of requiredRecordTransferRetryWorkerSupportPatterns) {
  if (!required.test(recordTransferRetryWorkerTestSupportSource)) {
    throw new Error(
      "record-transfer-retry-worker.test-support.ts must keep shared retry worker fixtures."
    );
  }
}

for (const retired of retiredRecordTransferRetryWorkerPatterns) {
  if (retired.test(recordTransferRetryWorkerTestSource)) {
    throw new Error(
      "record-transfer-retry-worker.test.ts must not absorb audit persistence failure fixtures back into lifecycle scenarios."
    );
  }
}

console.log(
  JSON.stringify(
    {
      status: "ok",
      check: "API test composition budget",
      testReports
    },
    null,
    2
  )
);

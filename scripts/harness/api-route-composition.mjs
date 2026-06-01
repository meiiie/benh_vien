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
    maxLines: 220,
    role: "RecordTransfer acknowledgement callback adapter"
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
    path: "apps/api/src/modules/record-transfers/record-transfer-route-access.ts",
    maxLines: 80,
    role: "RecordTransfer patient access helper"
  },
  {
    path: "apps/api/src/modules/record-transfers/record-transfer-route-helpers.ts",
    maxLines: 180,
    role: "RecordTransfer route helper functions"
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
    maxLines: 200,
    role: "Patient FHIR Bundle and document Bundle export routes"
  },
  {
    path: "apps/api/src/modules/patients/patient-record-bundle-route-helpers.ts",
    maxLines: 170,
    role: "Patient FHIR Bundle transfer context, consent and collection helpers"
  },
  {
    path: "apps/api/src/modules/patients/patient-route-helpers.ts",
    maxLines: 260,
    role: "Patient route helper functions"
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
    maxLines: 160,
    role: "ClinicalDocument FHIR DocumentReference and Provenance route adapter"
  },
  {
    path: "apps/api/src/modules/clinical-documents/clinical-document-route-helpers.ts",
    maxLines: 80,
    role: "ClinicalDocument response and reference validation helpers"
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
    maxLines: 120,
    role: "MedicationAdministration response and reference validation helpers"
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
    maxLines: 100,
    role: "MedicationDispense response and reference validation helpers"
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
    maxLines: 100,
    role: "MedicationRequest response and reference validation helpers"
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
    maxLines: 150,
    role: "Procedure response and reference validation helpers"
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
    role: "DiagnosticReport creation and reference validation route adapter"
  },
  {
    path: "apps/api/src/modules/diagnostic-reports/diagnostic-report-fhir-routes.ts",
    maxLines: 90,
    role: "DiagnosticReport FHIR export route adapter"
  },
  {
    path: "apps/api/src/modules/diagnostic-reports/diagnostic-report-route-helpers.ts",
    maxLines: 150,
    role: "DiagnosticReport response, access, reference and domain error helpers"
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

const recordTransferCommandRoutesPath = resolve(
  "apps/api/src/modules/record-transfers/record-transfer-command-routes.ts"
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

const clinicalDocumentRoutesPath = resolve(
  "apps/api/src/modules/clinical-documents/clinical-document-routes.ts"
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

const medicationAdministrationRoutesPath = resolve(
  "apps/api/src/modules/medication-administrations/medication-administration-routes.ts"
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

const medicationDispenseRoutesPath = resolve(
  "apps/api/src/modules/medication-dispenses/medication-dispense-routes.ts"
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

const medicationRequestRoutesPath = resolve(
  "apps/api/src/modules/medication-requests/medication-request-routes.ts"
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

const procedureRoutesPath = resolve("apps/api/src/modules/procedures/procedure-routes.ts");
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

const diagnosticReportRoutesPath = resolve(
  "apps/api/src/modules/diagnostic-reports/diagnostic-report-routes.ts"
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

const routeReports = [];

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
}

const apiRoutesSource = await readFile(apiRoutesPath, "utf8");
const apiDomainRoutesSource = await readFile(apiDomainRoutesPath, "utf8");
const authRoutesSource = await readFile(authRoutesPath, "utf8");
const recordTransferRoutesSource = await readFile(recordTransferRoutesPath, "utf8");
const recordTransferCommandRoutesSource = await readFile(
  recordTransferCommandRoutesPath,
  "utf8"
);
const encounterRoutesSource = await readFile(encounterRoutesPath, "utf8");
const patientRoutesSource = await readFile(patientRoutesPath, "utf8");
const patientFhirRoutesSource = await readFile(patientFhirRoutesPath, "utf8");
const clinicalDocumentRoutesSource = await readFile(
  clinicalDocumentRoutesPath,
  "utf8"
);
const medicationAdministrationRoutesSource = await readFile(
  medicationAdministrationRoutesPath,
  "utf8"
);
const medicationDispenseRoutesSource = await readFile(
  medicationDispenseRoutesPath,
  "utf8"
);
const medicationRequestRoutesSource = await readFile(
  medicationRequestRoutesPath,
  "utf8"
);
const procedureRoutesSource = await readFile(procedureRoutesPath, "utf8");
const diagnosticReportRoutesSource = await readFile(diagnosticReportRoutesPath, "utf8");

for (const forbidden of forbiddenApiRoutesPatterns) {
  if (forbidden.pattern.test(apiRoutesSource)) {
    throw new Error(forbidden.message);
  }
}

for (const registration of requiredApiDomainRegistrations) {
  if (!apiDomainRoutesSource.includes(registration)) {
    throw new Error(
      `HTTP API domain route composition must register ${registration} so domain route groups remain wired.`
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

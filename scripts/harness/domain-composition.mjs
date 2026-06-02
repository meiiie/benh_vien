import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";

const domainBudgets = [
  {
    path: "packages/domain/src/shared/normalization.ts",
    maxLines: 60,
    role: "Shared domain text, date and positive number normalization guards"
  },
  {
    path: "packages/domain/src/record-transfer/record-transfer.ts",
    maxLines: 240,
    role: "RecordTransfer lifecycle aggregate behavior"
  },
  {
    path: "packages/domain/src/record-transfer/record-transfer.factory.ts",
    maxLines: 190,
    role: "RecordTransfer snapshot creation and rehydration"
  },
  {
    path: "packages/domain/src/record-transfer/record-transfer.snapshot-validation.ts",
    maxLines: 170,
    role: "RecordTransfer snapshot timeline and terminal-state invariant guards"
  },
  {
    path: "packages/domain/src/record-transfer/record-transfer.lifecycle.ts",
    maxLines: 90,
    role: "RecordTransfer status transition guards"
  },
  {
    path: "packages/domain/src/record-transfer/record-transfer.validation.ts",
    maxLines: 80,
    role: "RecordTransfer primitive and code-set normalization guards"
  },
  {
    path: "packages/domain/src/record-transfer/record-transfer.types.ts",
    maxLines: 160,
    role: "RecordTransfer status, snapshot and command input types"
  },
  {
    path: "packages/domain/src/provider-directory/provider-directory.ts",
    maxLines: 150,
    role: "ProviderDirectory aggregate behavior"
  },
  {
    path: "packages/domain/src/provider-directory/provider-directory.validation.ts",
    maxLines: 220,
    role: "ProviderDirectory resource normalization guards"
  },
  {
    path: "packages/domain/src/provider-directory/provider-directory.primitives.ts",
    maxLines: 180,
    role: "ProviderDirectory coding, telecom, date and code-set primitive guards"
  },
  {
    path: "packages/domain/src/provider-directory/provider-directory.references.ts",
    maxLines: 80,
    role: "ProviderDirectory cross-resource reference and uniqueness guards"
  },
  {
    path: "packages/domain/src/provider-directory/provider-directory.snapshots.ts",
    maxLines: 70,
    role: "ProviderDirectory defensive snapshot cloning"
  },
  {
    path: "packages/domain/src/provider-directory/provider-directory.types.ts",
    maxLines: 190,
    role: "ProviderDirectory snapshot, coding, telecom and endpoint type definitions"
  },
  {
    path: "packages/domain/src/audit-event/audit-event.ts",
    maxLines: 160,
    role: "AuditEvent aggregate record and rehydration behavior"
  },
  {
    path: "packages/domain/src/audit-event/audit-event.integrity.ts",
    maxLines: 150,
    role: "AuditEvent sealing and integrity verification behavior"
  },
  {
    path: "packages/domain/src/audit-event/audit-event.validation.ts",
    maxLines: 180,
    role: "AuditEvent canonical hashing, normalization and seal metadata guards"
  },
  {
    path: "packages/domain/src/audit-event/audit-event.types.ts",
    maxLines: 90,
    role: "AuditEvent snapshot and integrity report types"
  },
  {
    path: "packages/domain/src/audit-event/audit-event.catalog.ts",
    maxLines: 130,
    role: "AuditEvent action and resource code catalog"
  },
  {
    path: "packages/domain/src/access-control/access-control.ts",
    maxLines: 130,
    role: "AccessControl authorization decisions"
  },
  {
    path: "packages/domain/src/access-control/access-control.organization-scope.ts",
    maxLines: 90,
    role: "AccessControl practitioner role scope policy"
  },
  {
    path: "packages/domain/src/access-control/access-control.organization-tree.ts",
    maxLines: 130,
    role: "AccessControl active organization hierarchy traversal"
  },
  {
    path: "packages/domain/src/access-control/access-control.policy.ts",
    maxLines: 120,
    role: "AccessControl role, purpose and permission type definitions"
  },
  {
    path: "packages/domain/src/access-control/access-control.clinical-permissions.ts",
    maxLines: 110,
    role: "AccessControl clinical workflow and FHIR-export permission groups"
  },
  {
    path: "packages/domain/src/access-control/access-control.permission-groups.ts",
    maxLines: 90,
    role: "AccessControl administrative and record-sharing permission groups"
  },
  {
    path: "packages/domain/src/access-control/access-control.permissions.ts",
    maxLines: 80,
    role: "AccessControl role-permission catalog"
  },
  {
    path: "packages/domain/src/patient/patient.ts",
    maxLines: 230,
    role: "Patient aggregate demographic update and merge behavior"
  },
  {
    path: "packages/domain/src/patient/patient.factory.ts",
    maxLines: 140,
    role: "Patient registration and rehydration props factory"
  },
  {
    path: "packages/domain/src/patient/patient.validation.ts",
    maxLines: 190,
    role: "Patient identifier, FHIR birth date, merge state and timeline guards"
  },
  {
    path: "packages/domain/src/patient/patient.types.ts",
    maxLines: 120,
    role: "Patient identifier, props, snapshot and registration input types"
  },
  {
    path: "packages/domain/src/workflow-task/workflow-task.ts",
    maxLines: 100,
    role: "WorkflowTask aggregate lifecycle behavior"
  },
  {
    path: "packages/domain/src/workflow-task/workflow-task.factory.ts",
    maxLines: 150,
    role: "WorkflowTask creation and persisted snapshot normalization"
  },
  {
    path: "packages/domain/src/workflow-task/workflow-task.validation.ts",
    maxLines: 140,
    role: "WorkflowTask code, reference structure and timeline guards"
  },
  {
    path: "packages/domain/src/workflow-task/workflow-task.code-set-guards.ts",
    maxLines: 70,
    role: "WorkflowTask status, intent, priority and reference code-set guards"
  },
  {
    path: "packages/domain/src/workflow-task/workflow-task.types.ts",
    maxLines: 160,
    role: "WorkflowTask status, intent, priority, reference and snapshot types"
  },
  {
    path: "packages/domain/src/procedure/procedure.ts",
    maxLines: 150,
    role: "Procedure aggregate record and rehydration behavior"
  },
  {
    path: "packages/domain/src/procedure/procedure.validation.ts",
    maxLines: 130,
    role: "Procedure coding, performer structure, report reference and lifecycle guards"
  },
  {
    path: "packages/domain/src/procedure/procedure.code-set-guards.ts",
    maxLines: 70,
    role: "Procedure status, category, performer and report reference code-set guards"
  },
  {
    path: "packages/domain/src/procedure/procedure.types.ts",
    maxLines: 130,
    role: "Procedure status, category, performer, report reference and snapshot types"
  },
  {
    path: "packages/domain/src/record-transfer-delivery-attempt/record-transfer-delivery-attempt.ts",
    maxLines: 150,
    role: "RecordTransferDeliveryAttempt terminal update behavior"
  },
  {
    path: "packages/domain/src/record-transfer-delivery-attempt/record-transfer-delivery-attempt.factory.ts",
    maxLines: 130,
    role: "RecordTransferDeliveryAttempt queue and rehydrate snapshot factory"
  },
  {
    path: "packages/domain/src/record-transfer-delivery-attempt/record-transfer-delivery-attempt.validation.ts",
    maxLines: 210,
    role: "RecordTransferDeliveryAttempt delivery normalization and terminal-state guards"
  },
  {
    path: "packages/domain/src/record-transfer-delivery-attempt/record-transfer-delivery-attempt.types.ts",
    maxLines: 90,
    role: "RecordTransferDeliveryAttempt status, bundle, snapshot and command input types"
  },
  {
    path: "packages/domain/src/medication-request/medication-request.ts",
    maxLines: 140,
    role: "MedicationRequest prescribing and rehydration behavior"
  },
  {
    path: "packages/domain/src/medication-request/medication-request.validation.ts",
    maxLines: 150,
    role: "MedicationRequest medication code, dosage, status and timeline guards"
  },
  {
    path: "packages/domain/src/medication-request/medication-request.types.ts",
    maxLines: 130,
    role: "MedicationRequest status, intent, priority, dosage and snapshot types"
  },
  {
    path: "packages/domain/src/medication-dispense/medication-dispense.ts",
    maxLines: 160,
    role: "MedicationDispense dispensing and rehydration behavior"
  },
  {
    path: "packages/domain/src/medication-dispense/medication-dispense.validation.ts",
    maxLines: 170,
    role: "MedicationDispense quantity, dosage, status and handover lifecycle guards"
  },
  {
    path: "packages/domain/src/medication-dispense/medication-dispense.types.ts",
    maxLines: 90,
    role: "MedicationDispense status, category, snapshot and command input types"
  },
  {
    path: "packages/domain/src/medication-administration/medication-administration.ts",
    maxLines: 140,
    role: "MedicationAdministration administration and rehydration behavior"
  },
  {
    path: "packages/domain/src/medication-administration/medication-administration.validation.ts",
    maxLines: 140,
    role: "MedicationAdministration effective period, performer structure, dosage and lifecycle guards"
  },
  {
    path: "packages/domain/src/medication-administration/medication-administration.code-set-guards.ts",
    maxLines: 60,
    role: "MedicationAdministration status, category and performer code-set guards"
  },
  {
    path: "packages/domain/src/medication-administration/medication-administration.types.ts",
    maxLines: 120,
    role: "MedicationAdministration status, category, performer, dosage and snapshot types"
  },
  {
    path: "packages/domain/src/service-request/service-request.ts",
    maxLines: 150,
    role: "ServiceRequest ordering and scheduling behavior"
  },
  {
    path: "packages/domain/src/service-request/service-request.validation.ts",
    maxLines: 120,
    role: "ServiceRequest code, status, priority and timeline guards"
  },
  {
    path: "packages/domain/src/service-request/service-request.types.ts",
    maxLines: 120,
    role: "ServiceRequest status, intent, category, priority and snapshot types"
  },
  {
    path: "packages/domain/src/imaging-study/imaging-study.ts",
    maxLines: 150,
    role: "ImagingStudy record and rehydration behavior"
  },
  {
    path: "packages/domain/src/imaging-study/imaging-study.validation.ts",
    maxLines: 140,
    role: "ImagingStudy DICOM UID, series count and timeline guards"
  },
  {
    path: "packages/domain/src/imaging-study/imaging-study.types.ts",
    maxLines: 90,
    role: "ImagingStudy status, coding, series, snapshot and command input types"
  },
  {
    path: "packages/domain/src/clinical-document/clinical-document.ts",
    maxLines: 130,
    role: "ClinicalDocument aggregate signing behavior"
  },
  {
    path: "packages/domain/src/clinical-document/clinical-document.factory.ts",
    maxLines: 130,
    role: "ClinicalDocument create and rehydrate props factory"
  },
  {
    path: "packages/domain/src/clinical-document/clinical-document.validation.ts",
    maxLines: 110,
    role: "ClinicalDocument attachment, status and timeline guards"
  },
  {
    path: "packages/domain/src/clinical-document/clinical-document.types.ts",
    maxLines: 90,
    role: "ClinicalDocument document type, status, snapshot and command input types"
  },
  {
    path: "packages/domain/src/diagnostic-report/diagnostic-report.ts",
    maxLines: 150,
    role: "DiagnosticReport issuing, content and timeline validation behavior"
  },
  {
    path: "packages/domain/src/diagnostic-report/diagnostic-report.validation.ts",
    maxLines: 130,
    role: "DiagnosticReport code, content, status and timeline guards"
  },
  {
    path: "packages/domain/src/diagnostic-report/diagnostic-report.types.ts",
    maxLines: 100,
    role: "DiagnosticReport status, category, code, snapshot and command input types"
  },
  {
    path: "packages/domain/src/observation/observation.ts",
    maxLines: 140,
    role: "Observation recording behavior"
  },
  {
    path: "packages/domain/src/observation/observation.validation.ts",
    maxLines: 100,
    role: "Observation quantity, value, status and timeline guards"
  },
  {
    path: "packages/domain/src/observation/observation.types.ts",
    maxLines: 80,
    role: "Observation status, category, coding, quantity, snapshot and command input types"
  },
  {
    path: "packages/domain/src/condition/condition.ts",
    maxLines: 150,
    role: "Condition recording and clinical status behavior"
  },
  {
    path: "packages/domain/src/condition/condition.validation.ts",
    maxLines: 120,
    role: "Condition code, status, severity and timeline guards"
  },
  {
    path: "packages/domain/src/condition/condition.types.ts",
    maxLines: 110,
    role: "Condition status, category, severity, code, snapshot and command input types"
  },
  {
    path: "packages/domain/src/allergy-intolerance/allergy-intolerance.ts",
    maxLines: 140,
    role: "AllergyIntolerance recording and reaction behavior"
  },
  {
    path: "packages/domain/src/allergy-intolerance/allergy-intolerance.validation.ts",
    maxLines: 140,
    role: "AllergyIntolerance code, reaction, status and timeline guards"
  },
  {
    path: "packages/domain/src/allergy-intolerance/allergy-intolerance.types.ts",
    maxLines: 110,
    role: "AllergyIntolerance status, category, reaction, snapshot and command input types"
  },
  {
    path: "packages/domain/src/encounter/encounter.ts",
    maxLines: 190,
    role: "Encounter creation, lifecycle and finish behavior"
  },
  {
    path: "packages/domain/src/encounter/encounter.validation.ts",
    maxLines: 90,
    role: "Encounter class, status and timeline guards"
  },
  {
    path: "packages/domain/src/encounter/encounter.types.ts",
    maxLines: 80,
    role: "Encounter class, status, snapshot and command input types"
  },
  {
    path: "packages/domain/src/consent/consent.ts",
    maxLines: 130,
    role: "Consent revoke and record-sharing authorization behavior"
  },
  {
    path: "packages/domain/src/consent/consent.factory.ts",
    maxLines: 140,
    role: "Consent grant and persisted snapshot normalization"
  },
  {
    path: "packages/domain/src/consent/consent.validation.ts",
    maxLines: 90,
    role: "Consent period, revocation, status and category guards"
  },
  {
    path: "packages/domain/src/consent/consent.types.ts",
    maxLines: 70,
    role: "Consent status, category, snapshot and command input types"
  },
  {
    path: "packages/domain/src/fhir/fhir-types.ts",
    maxLines: 20,
    role: "FHIR compatibility barrel exports"
  },
  {
    path: "packages/domain/src/fhir/fhir-shared.types.ts",
    maxLines: 40,
    role: "FHIR shared identifier and contact point types"
  },
  {
    path: "packages/domain/src/fhir/fhir-provider.types.ts",
    maxLines: 140,
    role: "FHIR provider directory resource types"
  },
  {
    path: "packages/domain/src/fhir/fhir-document.types.ts",
    maxLines: 150,
    role: "FHIR document, provenance and composition types"
  },
  {
    path: "packages/domain/src/fhir/fhir-privacy.types.ts",
    maxLines: 110,
    role: "FHIR consent and privacy resource types"
  },
  {
    path: "packages/domain/src/fhir/map-consent-to-fhir.ts",
    maxLines: 90,
    role: "FHIR Consent public mapper and revocation extension"
  },
  {
    path: "packages/domain/src/fhir/map-consent-codings.ts",
    maxLines: 130,
    role: "FHIR Consent status, scope, category and provision mapping"
  },
  {
    path: "packages/domain/src/fhir/fhir-audit.types.ts",
    maxLines: 90,
    role: "FHIR audit event resource types"
  },
  {
    path: "packages/domain/src/fhir/fhir-clinical.types.ts",
    maxLines: 20,
    role: "FHIR clinical compatibility barrel exports"
  },
  {
    path: "packages/domain/src/fhir/fhir-clinical-core.types.ts",
    maxLines: 20,
    role: "FHIR clinical core compatibility barrel exports"
  },
  {
    path: "packages/domain/src/fhir/fhir-encounter.types.ts",
    maxLines: 70,
    role: "FHIR Encounter resource type"
  },
  {
    path: "packages/domain/src/fhir/fhir-condition.types.ts",
    maxLines: 80,
    role: "FHIR Condition resource type"
  },
  {
    path: "packages/domain/src/fhir/map-condition-to-fhir.ts",
    maxLines: 75,
    role: "FHIR Condition public mapper and clinical references"
  },
  {
    path: "packages/domain/src/fhir/map-condition-codings.ts",
    maxLines: 115,
    role: "FHIR Condition profile, status, category, severity and code mapping"
  },
  {
    path: "packages/domain/src/fhir/fhir-observation.types.ts",
    maxLines: 70,
    role: "FHIR Observation resource type"
  },
  {
    path: "packages/domain/src/fhir/map-observation-to-fhir.ts",
    maxLines: 65,
    role: "FHIR Observation public mapper, value and clinical references"
  },
  {
    path: "packages/domain/src/fhir/map-observation-codings.ts",
    maxLines: 70,
    role: "FHIR Observation profile, category and code mapping"
  },
  {
    path: "packages/domain/src/fhir/fhir-allergy-intolerance.types.ts",
    maxLines: 80,
    role: "FHIR AllergyIntolerance resource type"
  },
  {
    path: "packages/domain/src/fhir/map-allergy-intolerance-to-fhir.ts",
    maxLines: 75,
    role: "FHIR AllergyIntolerance public mapper and clinical references"
  },
  {
    path: "packages/domain/src/fhir/map-allergy-intolerance-codings.ts",
    maxLines: 95,
    role: "FHIR AllergyIntolerance profile, status, substance and reaction mapping"
  },
  {
    path: "packages/domain/src/fhir/fhir-medication.types.ts",
    maxLines: 20,
    role: "FHIR medication compatibility barrel exports"
  },
  {
    path: "packages/domain/src/fhir/fhir-medication-request.types.ts",
    maxLines: 110,
    role: "FHIR MedicationRequest resource type"
  },
  {
    path: "packages/domain/src/fhir/map-medication-request-to-fhir.ts",
    maxLines: 75,
    role: "FHIR MedicationRequest public mapper and clinical references"
  },
  {
    path: "packages/domain/src/fhir/map-medication-request-codings.ts",
    maxLines: 115,
    role: "FHIR MedicationRequest category, CodeableConcept, dosage and dispenseRequest mapping"
  },
  {
    path: "packages/domain/src/fhir/fhir-medication-dispense.types.ts",
    maxLines: 130,
    role: "FHIR MedicationDispense resource type"
  },
  {
    path: "packages/domain/src/fhir/map-medication-dispense-to-fhir.ts",
    maxLines: 95,
    role: "FHIR MedicationDispense public mapper and clinical references"
  },
  {
    path: "packages/domain/src/fhir/map-medication-dispense-codings.ts",
    maxLines: 120,
    role: "FHIR MedicationDispense identifier, category, CodeableConcept and dosage mapping"
  },
  {
    path: "packages/domain/src/fhir/fhir-medication-administration.types.ts",
    maxLines: 110,
    role: "FHIR MedicationAdministration resource type"
  },
  {
    path: "packages/domain/src/fhir/map-medication-administration-to-fhir.ts",
    maxLines: 90,
    role: "FHIR MedicationAdministration public mapper and clinical references"
  },
  {
    path: "packages/domain/src/fhir/map-medication-administration-codings.ts",
    maxLines: 115,
    role: "FHIR MedicationAdministration identifier, category, CodeableConcept, performer and dosage mapping"
  },
  {
    path: "packages/domain/src/fhir/fhir-careflow.types.ts",
    maxLines: 20,
    role: "FHIR careflow compatibility barrel exports"
  },
  {
    path: "packages/domain/src/fhir/fhir-service-request.types.ts",
    maxLines: 90,
    role: "FHIR ServiceRequest resource type"
  },
  {
    path: "packages/domain/src/fhir/map-service-request-to-fhir.ts",
    maxLines: 75,
    role: "FHIR ServiceRequest public mapper and clinical references"
  },
  {
    path: "packages/domain/src/fhir/map-service-request-codings.ts",
    maxLines: 90,
    role: "FHIR ServiceRequest profile, SNOMED category and code mapping"
  },
  {
    path: "packages/domain/src/fhir/fhir-task.types.ts",
    maxLines: 120,
    role: "FHIR Task resource type"
  },
  {
    path: "packages/domain/src/fhir/map-workflow-task-to-fhir.ts",
    maxLines: 90,
    role: "FHIR WorkflowTask public mapper and clinical references"
  },
  {
    path: "packages/domain/src/fhir/map-workflow-task-codings.ts",
    maxLines: 120,
    role: "FHIR WorkflowTask profile, identifier, businessStatus, code, owner and IO item mapping"
  },
  {
    path: "packages/domain/src/fhir/fhir-procedure.types.ts",
    maxLines: 130,
    role: "FHIR Procedure resource type"
  },
  {
    path: "packages/domain/src/fhir/map-procedure-to-fhir.ts",
    maxLines: 100,
    role: "FHIR Procedure public mapper and resource references"
  },
  {
    path: "packages/domain/src/fhir/map-procedure-codings.ts",
    maxLines: 110,
    role: "FHIR Procedure identifier, category, CodeableConcept and performer mapping"
  },
  {
    path: "packages/domain/src/fhir/fhir-diagnostics.types.ts",
    maxLines: 20,
    role: "FHIR diagnostics compatibility barrel exports"
  },
  {
    path: "packages/domain/src/fhir/fhir-diagnostic-report.types.ts",
    maxLines: 80,
    role: "FHIR DiagnosticReport resource type"
  },
  {
    path: "packages/domain/src/fhir/map-diagnostic-report-to-fhir.ts",
    maxLines: 85,
    role: "FHIR DiagnosticReport public mapper and workflow references"
  },
  {
    path: "packages/domain/src/fhir/map-diagnostic-report-codings.ts",
    maxLines: 75,
    role: "FHIR DiagnosticReport profile, category and code mapping"
  },
  {
    path: "packages/domain/src/fhir/fhir-imaging-study.types.ts",
    maxLines: 80,
    role: "FHIR ImagingStudy resource type"
  },
  {
    path: "packages/domain/src/fhir/fhir-patient.types.ts",
    maxLines: 60,
    role: "FHIR patient resource types"
  },
  {
    path: "packages/domain/src/fhir/fhir-operation-outcome.types.ts",
    maxLines: 80,
    role: "FHIR OperationOutcome resource types"
  },
  {
    path: "packages/domain/src/fhir/fhir-capability-statement.types.ts",
    maxLines: 80,
    role: "FHIR CapabilityStatement resource types"
  },
  {
    path: "packages/domain/src/fhir/build-capability-statement.ts",
    maxLines: 90,
    role: "FHIR CapabilityStatement instance builder"
  },
  {
    path: "packages/domain/src/fhir/capability-statement-resources.ts",
    maxLines: 130,
    role: "FHIR CapabilityStatement supported resource catalog"
  },
  {
    path: "packages/domain/src/fhir/fhir-bundle.types.ts",
    maxLines: 90,
    role: "FHIR Bundle entry and bundle resource types"
  },
  {
    path: "packages/domain/src/fhir/map-patient-record-to-fhir-bundle.ts",
    maxLines: 60,
    role: "FHIR patient-record collection Bundle envelope mapper"
  },
  {
    path: "packages/domain/src/fhir/patient-record-bundle-resources.ts",
    maxLines: 150,
    role: "FHIR patient-record Bundle resource collection and entry mapping"
  },
  {
    path: "packages/domain/src/fhir/map-patient-record-to-fhir-document-bundle.ts",
    maxLines: 100,
    role: "FHIR patient-record document Bundle and Composition mapper"
  },
  {
    path: "packages/domain/src/fhir/patient-record-document-sections.ts",
    maxLines: 130,
    role: "FHIR patient-record document Composition section catalog"
  },
  {
    path: "packages/domain/src/fhir/map-provider-directory-to-fhir.ts",
    maxLines: 200,
    role: "FHIR ProviderDirectory public mapper and bundle orchestration"
  },
  {
    path: "packages/domain/src/fhir/map-provider-directory-codings.ts",
    maxLines: 110,
    role: "FHIR ProviderDirectory coding and identifier mapping"
  },
  {
    path: "packages/domain/src/fhir/map-record-transfer-to-fhir-task.ts",
    maxLines: 120,
    role: "FHIR RecordTransfer public Task mapper orchestration"
  },
  {
    path: "packages/domain/src/fhir/map-record-transfer-task-codings.ts",
    maxLines: 100,
    role: "FHIR RecordTransfer Task status, code and businessStatus mapping"
  },
  {
    path: "packages/domain/src/fhir/map-audit-event-to-fhir.ts",
    maxLines: 130,
    role: "FHIR AuditEvent public mapper and bundle orchestration"
  },
  {
    path: "packages/domain/src/fhir/map-audit-event-labels.ts",
    maxLines: 120,
    role: "FHIR AuditEvent action label catalog"
  },
  {
    path: "packages/domain/src/fhir/map-audit-event-details.ts",
    maxLines: 60,
    role: "FHIR AuditEvent entity detail mapping"
  },
  {
    path: "packages/domain/src/fhir/map-audit-event-outcome.ts",
    maxLines: 100,
    role: "FHIR AuditEvent action, outcome and purpose coding"
  },
  {
    path: "packages/domain/src/fhir/map-audit-event-references.ts",
    maxLines: 110,
    role: "FHIR AuditEvent actor and entity reference mapping"
  }
];

const recordTransferAggregatePath = resolve(
  "packages/domain/src/record-transfer/record-transfer.ts"
);
const recordTransferFactoryPath = resolve(
  "packages/domain/src/record-transfer/record-transfer.factory.ts"
);
const recordTransferSnapshotValidationPath = resolve(
  "packages/domain/src/record-transfer/record-transfer.snapshot-validation.ts"
);
const recordTransferLifecyclePath = resolve(
  "packages/domain/src/record-transfer/record-transfer.lifecycle.ts"
);
const recordTransferValidationPath = resolve(
  "packages/domain/src/record-transfer/record-transfer.validation.ts"
);
const recordTransferTypesPath = resolve(
  "packages/domain/src/record-transfer/record-transfer.types.ts"
);
const providerDirectoryAggregatePath = resolve(
  "packages/domain/src/provider-directory/provider-directory.ts"
);
const providerDirectoryValidationPath = resolve(
  "packages/domain/src/provider-directory/provider-directory.validation.ts"
);
const providerDirectoryPrimitivesPath = resolve(
  "packages/domain/src/provider-directory/provider-directory.primitives.ts"
);
const providerDirectoryReferencesPath = resolve(
  "packages/domain/src/provider-directory/provider-directory.references.ts"
);
const providerDirectorySnapshotsPath = resolve(
  "packages/domain/src/provider-directory/provider-directory.snapshots.ts"
);
const providerDirectoryTypesPath = resolve(
  "packages/domain/src/provider-directory/provider-directory.types.ts"
);
const auditEventAggregatePath = resolve("packages/domain/src/audit-event/audit-event.ts");
const auditEventIntegrityPath = resolve("packages/domain/src/audit-event/audit-event.integrity.ts");
const auditEventValidationPath = resolve(
  "packages/domain/src/audit-event/audit-event.validation.ts"
);
const auditEventTypesPath = resolve("packages/domain/src/audit-event/audit-event.types.ts");
const auditEventCatalogPath = resolve("packages/domain/src/audit-event/audit-event.catalog.ts");
const accessControlBehaviorPath = resolve(
  "packages/domain/src/access-control/access-control.ts"
);
const accessControlOrganizationScopePath = resolve(
  "packages/domain/src/access-control/access-control.organization-scope.ts"
);
const accessControlOrganizationTreePath = resolve(
  "packages/domain/src/access-control/access-control.organization-tree.ts"
);
const accessControlPolicyPath = resolve(
  "packages/domain/src/access-control/access-control.policy.ts"
);
const accessControlClinicalPermissionsPath = resolve(
  "packages/domain/src/access-control/access-control.clinical-permissions.ts"
);
const accessControlPermissionGroupsPath = resolve(
  "packages/domain/src/access-control/access-control.permission-groups.ts"
);
const accessControlPermissionsPath = resolve(
  "packages/domain/src/access-control/access-control.permissions.ts"
);
const patientAggregatePath = resolve("packages/domain/src/patient/patient.ts");
const patientFactoryPath = resolve("packages/domain/src/patient/patient.factory.ts");
const patientValidationPath = resolve("packages/domain/src/patient/patient.validation.ts");
const patientTypesPath = resolve("packages/domain/src/patient/patient.types.ts");
const workflowTaskAggregatePath = resolve(
  "packages/domain/src/workflow-task/workflow-task.ts"
);
const workflowTaskFactoryPath = resolve(
  "packages/domain/src/workflow-task/workflow-task.factory.ts"
);
const workflowTaskValidationPath = resolve(
  "packages/domain/src/workflow-task/workflow-task.validation.ts"
);
const workflowTaskCodeSetGuardsPath = resolve(
  "packages/domain/src/workflow-task/workflow-task.code-set-guards.ts"
);
const workflowTaskTypesPath = resolve(
  "packages/domain/src/workflow-task/workflow-task.types.ts"
);
const procedureAggregatePath = resolve("packages/domain/src/procedure/procedure.ts");
const procedureValidationPath = resolve("packages/domain/src/procedure/procedure.validation.ts");
const procedureCodeSetGuardsPath = resolve(
  "packages/domain/src/procedure/procedure.code-set-guards.ts"
);
const procedureTypesPath = resolve("packages/domain/src/procedure/procedure.types.ts");
const deliveryAttemptAggregatePath = resolve(
  "packages/domain/src/record-transfer-delivery-attempt/record-transfer-delivery-attempt.ts"
);
const deliveryAttemptFactoryPath = resolve(
  "packages/domain/src/record-transfer-delivery-attempt/record-transfer-delivery-attempt.factory.ts"
);
const deliveryAttemptValidationPath = resolve(
  "packages/domain/src/record-transfer-delivery-attempt/record-transfer-delivery-attempt.validation.ts"
);
const deliveryAttemptTypesPath = resolve(
  "packages/domain/src/record-transfer-delivery-attempt/record-transfer-delivery-attempt.types.ts"
);
const medicationRequestAggregatePath = resolve(
  "packages/domain/src/medication-request/medication-request.ts"
);
const medicationRequestValidationPath = resolve(
  "packages/domain/src/medication-request/medication-request.validation.ts"
);
const medicationRequestTypesPath = resolve(
  "packages/domain/src/medication-request/medication-request.types.ts"
);
const medicationDispenseAggregatePath = resolve(
  "packages/domain/src/medication-dispense/medication-dispense.ts"
);
const medicationDispenseValidationPath = resolve(
  "packages/domain/src/medication-dispense/medication-dispense.validation.ts"
);
const medicationDispenseTypesPath = resolve(
  "packages/domain/src/medication-dispense/medication-dispense.types.ts"
);
const medicationAdministrationAggregatePath = resolve(
  "packages/domain/src/medication-administration/medication-administration.ts"
);
const medicationAdministrationValidationPath = resolve(
  "packages/domain/src/medication-administration/medication-administration.validation.ts"
);
const medicationAdministrationCodeSetGuardsPath = resolve(
  "packages/domain/src/medication-administration/medication-administration.code-set-guards.ts"
);
const medicationAdministrationTypesPath = resolve(
  "packages/domain/src/medication-administration/medication-administration.types.ts"
);
const serviceRequestAggregatePath = resolve(
  "packages/domain/src/service-request/service-request.ts"
);
const serviceRequestValidationPath = resolve(
  "packages/domain/src/service-request/service-request.validation.ts"
);
const serviceRequestTypesPath = resolve(
  "packages/domain/src/service-request/service-request.types.ts"
);
const imagingStudyAggregatePath = resolve("packages/domain/src/imaging-study/imaging-study.ts");
const imagingStudyValidationPath = resolve("packages/domain/src/imaging-study/imaging-study.validation.ts");
const imagingStudyTypesPath = resolve("packages/domain/src/imaging-study/imaging-study.types.ts");
const clinicalDocumentAggregatePath = resolve(
  "packages/domain/src/clinical-document/clinical-document.ts"
);
const clinicalDocumentFactoryPath = resolve(
  "packages/domain/src/clinical-document/clinical-document.factory.ts"
);
const clinicalDocumentValidationPath = resolve(
  "packages/domain/src/clinical-document/clinical-document.validation.ts"
);
const clinicalDocumentTypesPath = resolve(
  "packages/domain/src/clinical-document/clinical-document.types.ts"
);
const diagnosticReportAggregatePath = resolve(
  "packages/domain/src/diagnostic-report/diagnostic-report.ts"
);
const diagnosticReportValidationPath = resolve(
  "packages/domain/src/diagnostic-report/diagnostic-report.validation.ts"
);
const diagnosticReportTypesPath = resolve(
  "packages/domain/src/diagnostic-report/diagnostic-report.types.ts"
);
const observationAggregatePath = resolve("packages/domain/src/observation/observation.ts");
const observationValidationPath = resolve("packages/domain/src/observation/observation.validation.ts");
const observationTypesPath = resolve("packages/domain/src/observation/observation.types.ts");
const conditionAggregatePath = resolve("packages/domain/src/condition/condition.ts");
const conditionValidationPath = resolve("packages/domain/src/condition/condition.validation.ts");
const conditionTypesPath = resolve("packages/domain/src/condition/condition.types.ts");
const allergyIntoleranceAggregatePath = resolve(
  "packages/domain/src/allergy-intolerance/allergy-intolerance.ts"
);
const allergyIntoleranceValidationPath = resolve(
  "packages/domain/src/allergy-intolerance/allergy-intolerance.validation.ts"
);
const allergyIntoleranceTypesPath = resolve(
  "packages/domain/src/allergy-intolerance/allergy-intolerance.types.ts"
);
const encounterAggregatePath = resolve("packages/domain/src/encounter/encounter.ts");
const encounterValidationPath = resolve("packages/domain/src/encounter/encounter.validation.ts");
const encounterTypesPath = resolve("packages/domain/src/encounter/encounter.types.ts");
const consentAggregatePath = resolve("packages/domain/src/consent/consent.ts");
const consentFactoryPath = resolve("packages/domain/src/consent/consent.factory.ts");
const consentValidationPath = resolve("packages/domain/src/consent/consent.validation.ts");
const consentTypesPath = resolve("packages/domain/src/consent/consent.types.ts");
const fhirTypesPath = resolve("packages/domain/src/fhir/fhir-types.ts");
const fhirClinicalBarrelPath = resolve("packages/domain/src/fhir/fhir-clinical.types.ts");
const fhirSharedTypesPath = resolve("packages/domain/src/fhir/fhir-shared.types.ts");
const fhirProviderTypesPath = resolve("packages/domain/src/fhir/fhir-provider.types.ts");
const fhirDocumentTypesPath = resolve("packages/domain/src/fhir/fhir-document.types.ts");
const fhirPrivacyTypesPath = resolve("packages/domain/src/fhir/fhir-privacy.types.ts");
const mapConsentToFhirPath = resolve("packages/domain/src/fhir/map-consent-to-fhir.ts");
const mapConsentCodingsPath = resolve("packages/domain/src/fhir/map-consent-codings.ts");
const fhirAuditTypesPath = resolve("packages/domain/src/fhir/fhir-audit.types.ts");
const mapProviderDirectoryToFhirPath = resolve(
  "packages/domain/src/fhir/map-provider-directory-to-fhir.ts"
);
const mapProviderDirectoryCodingsPath = resolve(
  "packages/domain/src/fhir/map-provider-directory-codings.ts"
);
const mapRecordTransferToFhirTaskPath = resolve(
  "packages/domain/src/fhir/map-record-transfer-to-fhir-task.ts"
);
const mapRecordTransferTaskCodingsPath = resolve(
  "packages/domain/src/fhir/map-record-transfer-task-codings.ts"
);
const mapAuditEventToFhirPath = resolve("packages/domain/src/fhir/map-audit-event-to-fhir.ts");
const mapAuditEventLabelsPath = resolve("packages/domain/src/fhir/map-audit-event-labels.ts");
const mapAuditEventDetailsPath = resolve("packages/domain/src/fhir/map-audit-event-details.ts");
const mapAuditEventOutcomePath = resolve("packages/domain/src/fhir/map-audit-event-outcome.ts");
const mapAuditEventReferencesPath = resolve("packages/domain/src/fhir/map-audit-event-references.ts");
const fhirClinicalCoreTypesPath = resolve(
  "packages/domain/src/fhir/fhir-clinical-core.types.ts"
);
const fhirEncounterTypesPath = resolve("packages/domain/src/fhir/fhir-encounter.types.ts");
const fhirConditionTypesPath = resolve("packages/domain/src/fhir/fhir-condition.types.ts");
const mapConditionToFhirPath = resolve("packages/domain/src/fhir/map-condition-to-fhir.ts");
const mapConditionCodingsPath = resolve("packages/domain/src/fhir/map-condition-codings.ts");
const fhirObservationTypesPath = resolve("packages/domain/src/fhir/fhir-observation.types.ts");
const mapObservationToFhirPath = resolve("packages/domain/src/fhir/map-observation-to-fhir.ts");
const mapObservationCodingsPath = resolve("packages/domain/src/fhir/map-observation-codings.ts");
const fhirAllergyIntoleranceTypesPath = resolve(
  "packages/domain/src/fhir/fhir-allergy-intolerance.types.ts"
);
const mapAllergyIntoleranceToFhirPath = resolve(
  "packages/domain/src/fhir/map-allergy-intolerance-to-fhir.ts"
);
const mapAllergyIntoleranceCodingsPath = resolve(
  "packages/domain/src/fhir/map-allergy-intolerance-codings.ts"
);
const fhirMedicationTypesPath = resolve("packages/domain/src/fhir/fhir-medication.types.ts");
const fhirMedicationRequestTypesPath = resolve(
  "packages/domain/src/fhir/fhir-medication-request.types.ts"
);
const mapMedicationRequestToFhirPath = resolve(
  "packages/domain/src/fhir/map-medication-request-to-fhir.ts"
);
const mapMedicationRequestCodingsPath = resolve(
  "packages/domain/src/fhir/map-medication-request-codings.ts"
);
const fhirMedicationDispenseTypesPath = resolve(
  "packages/domain/src/fhir/fhir-medication-dispense.types.ts"
);
const mapMedicationDispenseToFhirPath = resolve(
  "packages/domain/src/fhir/map-medication-dispense-to-fhir.ts"
);
const mapMedicationDispenseCodingsPath = resolve(
  "packages/domain/src/fhir/map-medication-dispense-codings.ts"
);
const fhirMedicationAdministrationTypesPath = resolve(
  "packages/domain/src/fhir/fhir-medication-administration.types.ts"
);
const mapMedicationAdministrationToFhirPath = resolve(
  "packages/domain/src/fhir/map-medication-administration-to-fhir.ts"
);
const mapMedicationAdministrationCodingsPath = resolve(
  "packages/domain/src/fhir/map-medication-administration-codings.ts"
);
const fhirCareflowTypesPath = resolve("packages/domain/src/fhir/fhir-careflow.types.ts");
const fhirServiceRequestTypesPath = resolve(
  "packages/domain/src/fhir/fhir-service-request.types.ts"
);
const mapServiceRequestToFhirPath = resolve(
  "packages/domain/src/fhir/map-service-request-to-fhir.ts"
);
const mapServiceRequestCodingsPath = resolve(
  "packages/domain/src/fhir/map-service-request-codings.ts"
);
const fhirTaskTypesPath = resolve("packages/domain/src/fhir/fhir-task.types.ts");
const mapWorkflowTaskToFhirPath = resolve(
  "packages/domain/src/fhir/map-workflow-task-to-fhir.ts"
);
const mapWorkflowTaskCodingsPath = resolve(
  "packages/domain/src/fhir/map-workflow-task-codings.ts"
);
const fhirProcedureTypesPath = resolve("packages/domain/src/fhir/fhir-procedure.types.ts");
const mapProcedureToFhirPath = resolve("packages/domain/src/fhir/map-procedure-to-fhir.ts");
const mapProcedureCodingsPath = resolve("packages/domain/src/fhir/map-procedure-codings.ts");
const fhirDiagnosticsTypesPath = resolve("packages/domain/src/fhir/fhir-diagnostics.types.ts");
const fhirDiagnosticReportTypesPath = resolve(
  "packages/domain/src/fhir/fhir-diagnostic-report.types.ts"
);
const mapDiagnosticReportToFhirPath = resolve(
  "packages/domain/src/fhir/map-diagnostic-report-to-fhir.ts"
);
const mapDiagnosticReportCodingsPath = resolve(
  "packages/domain/src/fhir/map-diagnostic-report-codings.ts"
);
const fhirImagingStudyTypesPath = resolve("packages/domain/src/fhir/fhir-imaging-study.types.ts");
const fhirPatientTypesPath = resolve("packages/domain/src/fhir/fhir-patient.types.ts");
const fhirOperationOutcomeTypesPath = resolve(
  "packages/domain/src/fhir/fhir-operation-outcome.types.ts"
);
const fhirCapabilityStatementTypesPath = resolve(
  "packages/domain/src/fhir/fhir-capability-statement.types.ts"
);
const buildCapabilityStatementPath = resolve(
  "packages/domain/src/fhir/build-capability-statement.ts"
);
const capabilityStatementResourcesPath = resolve(
  "packages/domain/src/fhir/capability-statement-resources.ts"
);
const fhirBundleTypesPath = resolve("packages/domain/src/fhir/fhir-bundle.types.ts");
const mapPatientRecordToFhirBundlePath = resolve(
  "packages/domain/src/fhir/map-patient-record-to-fhir-bundle.ts"
);
const patientRecordBundleResourcesPath = resolve(
  "packages/domain/src/fhir/patient-record-bundle-resources.ts"
);
const mapPatientRecordToFhirDocumentBundlePath = resolve(
  "packages/domain/src/fhir/map-patient-record-to-fhir-document-bundle.ts"
);
const patientRecordDocumentSectionsPath = resolve(
  "packages/domain/src/fhir/patient-record-document-sections.ts"
);

const domainReports = [];

for (const budget of domainBudgets) {
  const absolutePath = resolve(budget.path);
  await stat(absolutePath);
  const source = await readFile(absolutePath, "utf8");
  const lineCount = source.split(/\r?\n/).length;

  if (lineCount > budget.maxLines) {
    throw new Error(
      `${budget.path} has ${lineCount} lines; keep it at or below ${budget.maxLines} so ${budget.role} stays maintainable.`
    );
  }

  domainReports.push({
    path: budget.path,
    lineCount,
    maxLines: budget.maxLines,
    role: budget.role
  });
}

const aggregateSource = await readFile(recordTransferAggregatePath, "utf8");
const recordTransferFactorySource = await readFile(recordTransferFactoryPath, "utf8");
const recordTransferSnapshotValidationSource = await readFile(
  recordTransferSnapshotValidationPath,
  "utf8"
);
const recordTransferLifecycleSource = await readFile(recordTransferLifecyclePath, "utf8");
const recordTransferValidationSource = await readFile(recordTransferValidationPath, "utf8");
const typesSource = await readFile(recordTransferTypesPath, "utf8");
const providerDirectoryAggregateSource = await readFile(
  providerDirectoryAggregatePath,
  "utf8"
);
const providerDirectoryValidationSource = await readFile(
  providerDirectoryValidationPath,
  "utf8"
);
const providerDirectoryPrimitivesSource = await readFile(
  providerDirectoryPrimitivesPath,
  "utf8"
);
const providerDirectoryReferencesSource = await readFile(
  providerDirectoryReferencesPath,
  "utf8"
);
const providerDirectorySnapshotsSource = await readFile(
  providerDirectorySnapshotsPath,
  "utf8"
);
const providerDirectoryTypesSource = await readFile(providerDirectoryTypesPath, "utf8");
const auditEventAggregateSource = await readFile(auditEventAggregatePath, "utf8");
const auditEventIntegritySource = await readFile(auditEventIntegrityPath, "utf8");
const auditEventValidationSource = await readFile(auditEventValidationPath, "utf8");
const auditEventTypesSource = await readFile(auditEventTypesPath, "utf8");
const auditEventCatalogSource = await readFile(auditEventCatalogPath, "utf8");
const accessControlBehaviorSource = await readFile(accessControlBehaviorPath, "utf8");
const accessControlOrganizationScopeSource = await readFile(
  accessControlOrganizationScopePath,
  "utf8"
);
const accessControlOrganizationTreeSource = await readFile(
  accessControlOrganizationTreePath,
  "utf8"
);
const accessControlPolicySource = await readFile(accessControlPolicyPath, "utf8");
const accessControlClinicalPermissionsSource = await readFile(
  accessControlClinicalPermissionsPath,
  "utf8"
);
const accessControlPermissionGroupsSource = await readFile(
  accessControlPermissionGroupsPath,
  "utf8"
);
const accessControlPermissionsSource = await readFile(accessControlPermissionsPath, "utf8");
const patientAggregateSource = await readFile(patientAggregatePath, "utf8");
const patientFactorySource = await readFile(patientFactoryPath, "utf8");
const patientValidationSource = await readFile(patientValidationPath, "utf8");
const patientTypesSource = await readFile(patientTypesPath, "utf8");
const workflowTaskAggregateSource = await readFile(workflowTaskAggregatePath, "utf8");
const workflowTaskFactorySource = await readFile(workflowTaskFactoryPath, "utf8");
const workflowTaskValidationSource = await readFile(workflowTaskValidationPath, "utf8");
const workflowTaskCodeSetGuardsSource = await readFile(
  workflowTaskCodeSetGuardsPath,
  "utf8"
);
const workflowTaskTypesSource = await readFile(workflowTaskTypesPath, "utf8");
const procedureAggregateSource = await readFile(procedureAggregatePath, "utf8");
const procedureValidationSource = await readFile(procedureValidationPath, "utf8");
const procedureCodeSetGuardsSource = await readFile(
  procedureCodeSetGuardsPath,
  "utf8"
);
const procedureTypesSource = await readFile(procedureTypesPath, "utf8");
const deliveryAttemptAggregateSource = await readFile(deliveryAttemptAggregatePath, "utf8");
const deliveryAttemptFactorySource = await readFile(deliveryAttemptFactoryPath, "utf8");
const deliveryAttemptValidationSource = await readFile(deliveryAttemptValidationPath, "utf8");
const deliveryAttemptTypesSource = await readFile(deliveryAttemptTypesPath, "utf8");
const medicationRequestAggregateSource = await readFile(medicationRequestAggregatePath, "utf8");
const medicationRequestValidationSource = await readFile(
  medicationRequestValidationPath,
  "utf8"
);
const medicationRequestTypesSource = await readFile(medicationRequestTypesPath, "utf8");
const medicationDispenseAggregateSource = await readFile(medicationDispenseAggregatePath, "utf8");
const medicationDispenseValidationSource = await readFile(
  medicationDispenseValidationPath,
  "utf8"
);
const medicationDispenseTypesSource = await readFile(medicationDispenseTypesPath, "utf8");
const medicationAdministrationAggregateSource = await readFile(
  medicationAdministrationAggregatePath,
  "utf8"
);
const medicationAdministrationValidationSource = await readFile(
  medicationAdministrationValidationPath,
  "utf8"
);
const medicationAdministrationCodeSetGuardsSource = await readFile(
  medicationAdministrationCodeSetGuardsPath,
  "utf8"
);
const medicationAdministrationTypesSource = await readFile(
  medicationAdministrationTypesPath,
  "utf8"
);
const serviceRequestAggregateSource = await readFile(serviceRequestAggregatePath, "utf8");
const serviceRequestValidationSource = await readFile(serviceRequestValidationPath, "utf8");
const serviceRequestTypesSource = await readFile(serviceRequestTypesPath, "utf8");
const imagingStudyAggregateSource = await readFile(imagingStudyAggregatePath, "utf8");
const imagingStudyValidationSource = await readFile(imagingStudyValidationPath, "utf8");
const imagingStudyTypesSource = await readFile(imagingStudyTypesPath, "utf8");
const clinicalDocumentAggregateSource = await readFile(clinicalDocumentAggregatePath, "utf8");
const clinicalDocumentFactorySource = await readFile(clinicalDocumentFactoryPath, "utf8");
const clinicalDocumentValidationSource = await readFile(
  clinicalDocumentValidationPath,
  "utf8"
);
const clinicalDocumentTypesSource = await readFile(clinicalDocumentTypesPath, "utf8");
const diagnosticReportAggregateSource = await readFile(diagnosticReportAggregatePath, "utf8");
const diagnosticReportValidationSource = await readFile(
  diagnosticReportValidationPath,
  "utf8"
);
const diagnosticReportTypesSource = await readFile(diagnosticReportTypesPath, "utf8");
const observationAggregateSource = await readFile(observationAggregatePath, "utf8");
const observationValidationSource = await readFile(observationValidationPath, "utf8");
const observationTypesSource = await readFile(observationTypesPath, "utf8");
const conditionAggregateSource = await readFile(conditionAggregatePath, "utf8");
const conditionValidationSource = await readFile(conditionValidationPath, "utf8");
const conditionTypesSource = await readFile(conditionTypesPath, "utf8");
const allergyIntoleranceAggregateSource = await readFile(
  allergyIntoleranceAggregatePath,
  "utf8"
);
const allergyIntoleranceValidationSource = await readFile(
  allergyIntoleranceValidationPath,
  "utf8"
);
const allergyIntoleranceTypesSource = await readFile(allergyIntoleranceTypesPath, "utf8");
const encounterAggregateSource = await readFile(encounterAggregatePath, "utf8");
const encounterValidationSource = await readFile(encounterValidationPath, "utf8");
const encounterTypesSource = await readFile(encounterTypesPath, "utf8");
const consentAggregateSource = await readFile(consentAggregatePath, "utf8");
const consentFactorySource = await readFile(consentFactoryPath, "utf8");
const consentValidationSource = await readFile(consentValidationPath, "utf8");
const consentTypesSource = await readFile(consentTypesPath, "utf8");
const fhirTypesSource = await readFile(fhirTypesPath, "utf8");
const fhirClinicalBarrelSource = await readFile(fhirClinicalBarrelPath, "utf8");
const fhirSharedTypesSource = await readFile(fhirSharedTypesPath, "utf8");
const fhirProviderTypesSource = await readFile(fhirProviderTypesPath, "utf8");
const fhirDocumentTypesSource = await readFile(fhirDocumentTypesPath, "utf8");
const fhirPrivacyTypesSource = await readFile(fhirPrivacyTypesPath, "utf8");
const mapConsentToFhirSource = await readFile(mapConsentToFhirPath, "utf8");
const mapConsentCodingsSource = await readFile(mapConsentCodingsPath, "utf8");
const fhirAuditTypesSource = await readFile(fhirAuditTypesPath, "utf8");
const mapProviderDirectoryToFhirSource = await readFile(
  mapProviderDirectoryToFhirPath,
  "utf8"
);
const mapProviderDirectoryCodingsSource = await readFile(
  mapProviderDirectoryCodingsPath,
  "utf8"
);
const mapRecordTransferToFhirTaskSource = await readFile(
  mapRecordTransferToFhirTaskPath,
  "utf8"
);
const mapRecordTransferTaskCodingsSource = await readFile(
  mapRecordTransferTaskCodingsPath,
  "utf8"
);
const mapAuditEventToFhirSource = await readFile(mapAuditEventToFhirPath, "utf8");
const mapAuditEventLabelsSource = await readFile(mapAuditEventLabelsPath, "utf8");
const mapAuditEventDetailsSource = await readFile(mapAuditEventDetailsPath, "utf8");
const mapAuditEventOutcomeSource = await readFile(mapAuditEventOutcomePath, "utf8");
const mapAuditEventReferencesSource = await readFile(
  mapAuditEventReferencesPath,
  "utf8"
);
const fhirClinicalCoreTypesSource = await readFile(fhirClinicalCoreTypesPath, "utf8");
const fhirEncounterTypesSource = await readFile(fhirEncounterTypesPath, "utf8");
const fhirConditionTypesSource = await readFile(fhirConditionTypesPath, "utf8");
const mapConditionToFhirSource = await readFile(mapConditionToFhirPath, "utf8");
const mapConditionCodingsSource = await readFile(mapConditionCodingsPath, "utf8");
const fhirObservationTypesSource = await readFile(fhirObservationTypesPath, "utf8");
const mapObservationToFhirSource = await readFile(mapObservationToFhirPath, "utf8");
const mapObservationCodingsSource = await readFile(mapObservationCodingsPath, "utf8");
const fhirAllergyIntoleranceTypesSource = await readFile(
  fhirAllergyIntoleranceTypesPath,
  "utf8"
);
const mapAllergyIntoleranceToFhirSource = await readFile(
  mapAllergyIntoleranceToFhirPath,
  "utf8"
);
const mapAllergyIntoleranceCodingsSource = await readFile(
  mapAllergyIntoleranceCodingsPath,
  "utf8"
);
const fhirMedicationTypesSource = await readFile(fhirMedicationTypesPath, "utf8");
const fhirMedicationRequestTypesSource = await readFile(
  fhirMedicationRequestTypesPath,
  "utf8"
);
const mapMedicationRequestToFhirSource = await readFile(
  mapMedicationRequestToFhirPath,
  "utf8"
);
const mapMedicationRequestCodingsSource = await readFile(
  mapMedicationRequestCodingsPath,
  "utf8"
);
const fhirMedicationDispenseTypesSource = await readFile(
  fhirMedicationDispenseTypesPath,
  "utf8"
);
const mapMedicationDispenseToFhirSource = await readFile(
  mapMedicationDispenseToFhirPath,
  "utf8"
);
const mapMedicationDispenseCodingsSource = await readFile(
  mapMedicationDispenseCodingsPath,
  "utf8"
);
const fhirMedicationAdministrationTypesSource = await readFile(
  fhirMedicationAdministrationTypesPath,
  "utf8"
);
const mapMedicationAdministrationToFhirSource = await readFile(
  mapMedicationAdministrationToFhirPath,
  "utf8"
);
const mapMedicationAdministrationCodingsSource = await readFile(
  mapMedicationAdministrationCodingsPath,
  "utf8"
);
const fhirCareflowTypesSource = await readFile(fhirCareflowTypesPath, "utf8");
const fhirServiceRequestTypesSource = await readFile(fhirServiceRequestTypesPath, "utf8");
const mapServiceRequestToFhirSource = await readFile(mapServiceRequestToFhirPath, "utf8");
const mapServiceRequestCodingsSource = await readFile(mapServiceRequestCodingsPath, "utf8");
const fhirTaskTypesSource = await readFile(fhirTaskTypesPath, "utf8");
const mapWorkflowTaskToFhirSource = await readFile(mapWorkflowTaskToFhirPath, "utf8");
const mapWorkflowTaskCodingsSource = await readFile(mapWorkflowTaskCodingsPath, "utf8");
const fhirProcedureTypesSource = await readFile(fhirProcedureTypesPath, "utf8");
const mapProcedureToFhirSource = await readFile(mapProcedureToFhirPath, "utf8");
const mapProcedureCodingsSource = await readFile(mapProcedureCodingsPath, "utf8");
const fhirDiagnosticsTypesSource = await readFile(fhirDiagnosticsTypesPath, "utf8");
const fhirDiagnosticReportTypesSource = await readFile(
  fhirDiagnosticReportTypesPath,
  "utf8"
);
const mapDiagnosticReportToFhirSource = await readFile(
  mapDiagnosticReportToFhirPath,
  "utf8"
);
const mapDiagnosticReportCodingsSource = await readFile(
  mapDiagnosticReportCodingsPath,
  "utf8"
);
const fhirImagingStudyTypesSource = await readFile(fhirImagingStudyTypesPath, "utf8");
const fhirPatientTypesSource = await readFile(fhirPatientTypesPath, "utf8");
const fhirOperationOutcomeTypesSource = await readFile(
  fhirOperationOutcomeTypesPath,
  "utf8"
);
const fhirCapabilityStatementTypesSource = await readFile(
  fhirCapabilityStatementTypesPath,
  "utf8"
);
const buildCapabilityStatementSource = await readFile(
  buildCapabilityStatementPath,
  "utf8"
);
const capabilityStatementResourcesSource = await readFile(
  capabilityStatementResourcesPath,
  "utf8"
);
const fhirBundleTypesSource = await readFile(fhirBundleTypesPath, "utf8");
const mapPatientRecordToFhirBundleSource = await readFile(
  mapPatientRecordToFhirBundlePath,
  "utf8"
);
const patientRecordBundleResourcesSource = await readFile(
  patientRecordBundleResourcesPath,
  "utf8"
);
const mapPatientRecordToFhirDocumentBundleSource = await readFile(
  mapPatientRecordToFhirDocumentBundlePath,
  "utf8"
);
const patientRecordDocumentSectionsSource = await readFile(
  patientRecordDocumentSectionsPath,
  "utf8"
);

for (const forbidden of [
  /export type RecordTransferStatus/,
  /export type RecordTransferSnapshot/,
  /const recordTransferStatuses/,
  /function validateRecordTransferSnapshot/,
  /function buildRecordTransferSnapshot/,
  /function normalizePersistedRecordTransferSnapshot/
]) {
  if (forbidden.test(aggregateSource)) {
    throw new Error(
      "RecordTransfer aggregate must keep lifecycle behavior only; types stay in record-transfer.types.ts, snapshot construction stays in record-transfer.factory.ts and snapshot invariants stay in record-transfer.snapshot-validation.ts."
    );
  }
}

for (const required of [
  /export type RecordTransferStatus/,
  /export type RecordTransferSnapshot/,
  /export type CreateRecordTransferInput/,
  /export const recordTransferStatuses/
]) {
  if (!required.test(typesSource)) {
    throw new Error(
      "record-transfer.types.ts must keep RecordTransfer status, snapshot, command input and status-set definitions."
    );
  }
}

if (!/from "\.\/record-transfer\.types\.js"/.test(aggregateSource)) {
  throw new Error("RecordTransfer aggregate must depend on record-transfer.types.ts for shared types.");
}

if (!/from "\.\/record-transfer\.factory\.js"/.test(aggregateSource)) {
  throw new Error("RecordTransfer aggregate must depend on record-transfer.factory.ts for create/rehydrate snapshot construction.");
}

if (!/from "\.\/record-transfer\.lifecycle\.js"/.test(aggregateSource)) {
  throw new Error(
    "RecordTransfer aggregate must depend on record-transfer.lifecycle.ts for status transition guards."
  );
}

if (!/from "\.\/record-transfer\.validation\.js"/.test(aggregateSource)) {
  throw new Error(
    "RecordTransfer aggregate must depend on record-transfer.validation.ts for lifecycle date and text guards."
  );
}

for (const required of [
  /export function buildRecordTransferSnapshot/,
  /export function normalizePersistedRecordTransferSnapshot/,
  /from "\.\/record-transfer\.validation\.js"/,
  /from "\.\/record-transfer\.snapshot-validation\.js"/,
  /from "\.\/record-transfer\.types\.js"/
]) {
  if (!required.test(recordTransferFactorySource)) {
    throw new Error(
      "record-transfer.factory.ts must keep RecordTransfer snapshot creation and rehydration normalization."
    );
  }
}

if (/DomainError/.test(recordTransferFactorySource)) {
  throw new Error(
    "record-transfer.factory.ts must build normalized snapshots; invariant errors stay in record-transfer.snapshot-validation.ts."
  );
}

for (const required of [
  /export function validateRecordTransferSnapshot/,
  /normalizeRequired/,
  /normalizeStatus/,
  /normalizePriority/,
  /normalizeBundleType/,
  /parseDate/,
  /from "\.\/record-transfer\.validation\.js"/,
  /from "\.\/record-transfer\.types\.js"/
]) {
  if (!required.test(recordTransferSnapshotValidationSource)) {
    throw new Error(
      "record-transfer.snapshot-validation.ts must keep RecordTransfer snapshot timeline and terminal-state invariants."
    );
  }
}

for (const forbidden of [
  /buildRecordTransferSnapshot/,
  /normalizePersistedRecordTransferSnapshot/,
  /export function normalizeRequired/,
  /export function parseDate/
]) {
  if (forbidden.test(recordTransferSnapshotValidationSource)) {
    throw new Error(
      "record-transfer.snapshot-validation.ts must not own factory behavior or primitive normalization definitions."
    );
  }
}

for (const required of [
  /export function assertCanMarkSent/,
  /export function assertCanMarkReceived/,
  /export function assertCanMarkFailed/,
  /export function assertCanRetry/,
  /export function assertCanMarkDeadLettered/,
  /RecordTransferStatus/,
  /DomainError/
]) {
  if (!required.test(recordTransferLifecycleSource)) {
    throw new Error(
      "record-transfer.lifecycle.ts must keep RecordTransfer status transition guard functions."
    );
  }
}

for (const forbidden of [
  /buildRecordTransferSnapshot/,
  /normalizePersistedRecordTransferSnapshot/,
  /validateRecordTransferSnapshot/,
  /this\.props/,
  /updatedAt/,
  /toSnapshot/
]) {
  if (forbidden.test(recordTransferLifecycleSource)) {
    throw new Error(
      "record-transfer.lifecycle.ts must stay a pure status guard module and must not own snapshot mutation or validation."
    );
  }
}

for (const required of [
  /export function normalizeRequired/,
  /export function parseDate/,
  /export function normalizeStatus/,
  /export function normalizePriority/,
  /export function normalizeBundleType/,
  /export function normalizeRetryCount/,
  /from "\.\/record-transfer\.types\.js"/
]) {
  if (!required.test(recordTransferValidationSource)) {
    throw new Error(
      "record-transfer.validation.ts must keep RecordTransfer primitive and code-set normalization guards."
    );
  }
}

for (const forbidden of [
  /validateRecordTransferSnapshot/,
  /RecordTransferSnapshot/,
  /sourceOrganizationId === recipientOrganizationId/,
  /status === "dead-lettered"/
]) {
  if (forbidden.test(recordTransferValidationSource)) {
    throw new Error(
      "RecordTransfer snapshot invariants must stay out of record-transfer.validation.ts."
    );
  }
}

for (const forbidden of [
  /export type ProviderDirectorySnapshot/,
  /export type ProviderOrganizationType/,
  /const providerOrganizationTypes/,
  /function normalizeOrganization/,
  /function validateReferences/,
  /function cloneOrganization/
]) {
  if (forbidden.test(providerDirectoryAggregateSource)) {
    throw new Error(
      "ProviderDirectory aggregate must keep assembly behavior only; types stay in provider-directory.types.ts, normalization stays in provider-directory.validation.ts, reference guards stay in provider-directory.references.ts, and snapshot cloning stays in provider-directory.snapshots.ts."
    );
  }
}

for (const required of [
  /export type ProviderDirectorySnapshot/,
  /export type ProviderDirectoryInput/,
  /export type ProviderEndpointConnectionType/,
  /export const providerOrganizationTypes/
]) {
  if (!required.test(providerDirectoryTypesSource)) {
    throw new Error(
      "provider-directory.types.ts must keep ProviderDirectory snapshot, input, endpoint connection and provider code-set definitions."
    );
  }
}

if (!/from "\.\/provider-directory\.types\.js"/.test(providerDirectoryAggregateSource)) {
  throw new Error(
    "ProviderDirectory aggregate must depend on provider-directory.types.ts for shared types."
  );
}

if (!/from "\.\/provider-directory\.validation\.js"/.test(providerDirectoryAggregateSource)) {
  throw new Error(
    "ProviderDirectory aggregate must depend on provider-directory.validation.ts for normalization guards."
  );
}

if (!/from "\.\/provider-directory\.primitives\.js"/.test(providerDirectoryAggregateSource)) {
  throw new Error(
    "ProviderDirectory aggregate must depend on provider-directory.primitives.ts for date and timestamp primitive guards."
  );
}

if (!/from "\.\/provider-directory\.references\.js"/.test(providerDirectoryAggregateSource)) {
  throw new Error(
    "ProviderDirectory aggregate must depend on provider-directory.references.ts for cross-resource reference guards."
  );
}

if (!/from "\.\/provider-directory\.snapshots\.js"/.test(providerDirectoryAggregateSource)) {
  throw new Error(
    "ProviderDirectory aggregate must depend on provider-directory.snapshots.ts for defensive snapshot cloning."
  );
}

for (const required of [
  /export function normalizeOrganization/,
  /export function normalizePersistedOrganization/,
  /from "\.\/provider-directory\.primitives\.js"/,
  /from "\.\/provider-directory\.types\.js"/
]) {
  if (!required.test(providerDirectoryValidationSource)) {
    throw new Error(
      "provider-directory.validation.ts must keep ProviderDirectory resource normalization guards."
    );
  }
}

for (const forbidden of [
  /export function validateReferences/,
  /export function cloneOrganization/,
  /export function normalizeIdentifier/,
  /export function normalizeTimestamp/
]) {
  if (forbidden.test(providerDirectoryValidationSource)) {
    throw new Error(
      "ProviderDirectory primitive guards, reference guards and snapshot cloning must stay out of provider-directory.validation.ts."
    );
  }
}

for (const required of [
  /export function normalizeIdentifier/,
  /export function normalizeTelecom/,
  /export function normalizeCoding/,
  /export function normalizeTimestamp/,
  /export function assertValidDate/,
  /from "\.\/provider-directory\.types\.js"/
]) {
  if (!required.test(providerDirectoryPrimitivesSource)) {
    throw new Error(
      "provider-directory.primitives.ts must keep ProviderDirectory coding, telecom, date and code-set primitive guards."
    );
  }
}

for (const required of [
  /export function validateReferences/,
  /export function validateUniqueIds/,
  /from "\.\/provider-directory\.types\.js"/
]) {
  if (!required.test(providerDirectoryReferencesSource)) {
    throw new Error(
      "provider-directory.references.ts must keep ProviderDirectory cross-resource reference and uniqueness guards."
    );
  }
}

for (const required of [
  /export function cloneOrganization/,
  /export function clonePractitioner/,
  /export function cloneEndpoint/,
  /export function clonePractitionerRole/,
  /from "\.\/provider-directory\.types\.js"/
]) {
  if (!required.test(providerDirectorySnapshotsSource)) {
    throw new Error(
      "provider-directory.snapshots.ts must keep ProviderDirectory defensive snapshot cloning."
    );
  }
}

for (const required of [
  /export function mapProviderDirectoryToFhirResources/,
  /export function mapProviderDirectoryToFhirBundle/,
  /export function mapProviderOrganizationToFhir/,
  /export function mapProviderPractitionerToFhir/,
  /export function mapProviderEndpointToFhir/,
  /export function mapProviderPractitionerRoleToFhir/,
  /from "\.\/map-provider-directory-codings\.js"/
]) {
  if (!required.test(mapProviderDirectoryToFhirSource)) {
    throw new Error(
      "map-provider-directory-to-fhir.ts must keep public ProviderDirectory resource mapping and delegate coding helpers to map-provider-directory-codings.ts."
    );
  }
}

for (const forbidden of [
  /function toFhirIdentifiers/,
  /function toCodeableConcept/,
  /function mapOrganizationType/,
  /function formatOrganizationType/,
  /function mapEndpointConnectionType/,
  /Record<ProviderOrganizationType, string>/,
  /Record<ProviderEndpointConnectionType, string>/
]) {
  if (forbidden.test(mapProviderDirectoryToFhirSource)) {
    throw new Error(
      "ProviderDirectory FHIR coding helpers belong in map-provider-directory-codings.ts, not in the public mapper."
    );
  }
}

for (const required of [
  /export function toFhirIdentifiers/,
  /export function toCodeableConcept/,
  /export function mapOrganizationType/,
  /export function formatOrganizationType/,
  /export function mapEndpointConnectionType/,
  /ProviderOrganizationType/,
  /ProviderEndpointConnectionType/
]) {
  if (!required.test(mapProviderDirectoryCodingsSource)) {
    throw new Error(
      "map-provider-directory-codings.ts must keep ProviderDirectory FHIR identifier, CodeableConcept and code-system mapping."
    );
  }
}

for (const forbidden of [
  /FhirOrganization/,
  /FhirPractitioner/,
  /FhirPractitionerRole/,
  /FhirEndpoint/,
  /FhirBundle/,
  /mapProviderDirectoryToFhirBundle/
]) {
  if (forbidden.test(mapProviderDirectoryCodingsSource)) {
    throw new Error(
      "map-provider-directory-codings.ts must stay a coding helper and must not own ProviderDirectory resource mapping."
    );
  }
}

for (const required of [
  /export function mapRecordTransferToFhirTask/,
  /resourceType:\s*"Task"/,
  /from "\.\/map-record-transfer-task-codings\.js"/,
  /buildRecordTransferBusinessStatus/,
  /buildRecordTransferCode/,
  /formatRecordTransferBundleOutput/,
  /mapRecordTransferStatus/
]) {
  if (!required.test(mapRecordTransferToFhirTaskSource)) {
    throw new Error(
      "map-record-transfer-to-fhir-task.ts must keep public RecordTransfer Task orchestration and delegate Task coding helpers to map-record-transfer-task-codings.ts."
    );
  }
}

for (const forbidden of [
  /function formatRecordTransferStatus/,
  /Record<RecordTransferStatus, string>/,
  /"urn:wiiicare:nexus:record-transfer-status"/,
  /"urn:wiiicare:nexus:task-code"/,
  /"inter-facility-record-transfer"/
]) {
  if (forbidden.test(mapRecordTransferToFhirTaskSource)) {
    throw new Error(
      "RecordTransfer Task coding helpers belong in map-record-transfer-task-codings.ts, not in the public FHIR Task mapper."
    );
  }
}

for (const required of [
  /export const recordTransferTaskProfile/,
  /export const recordTransferIdentifierSystem/,
  /export function mapRecordTransferStatus/,
  /export function buildRecordTransferBusinessStatus/,
  /export function buildRecordTransferCode/,
  /export function formatRecordTransferBundleOutput/,
  /export function formatRecordTransferStatus/,
  /from "\.\.\/record-transfer\/record-transfer\.types\.js"/,
  /from "\.\/fhir-types\.js"/
]) {
  if (!required.test(mapRecordTransferTaskCodingsSource)) {
    throw new Error(
      "map-record-transfer-task-codings.ts must keep RecordTransfer Task profile, identifier, status, businessStatus, code and bundle-output mapping."
    );
  }
}

for (const forbidden of [
  /resourceType:\s*"Task"/,
  /function buildRecordTransferNotes/,
  /mapRecordTransferToFhirTask/
]) {
  if (forbidden.test(mapRecordTransferTaskCodingsSource)) {
    throw new Error(
      "map-record-transfer-task-codings.ts must stay a Task coding helper and must not own RecordTransfer resource orchestration."
    );
  }
}

for (const forbidden of [
  /export type AuditAction/,
  /export type AuditEventSnapshot/,
  /const auditActions/,
  /function hashAuditPayload/,
  /function sealAuditEvent/,
  /function buildAuditIntegrityReport/
]) {
  if (forbidden.test(auditEventAggregateSource)) {
    throw new Error(
      "AuditEvent aggregate must keep record/rehydrate behavior only; seal/report behavior stays in audit-event.integrity.ts, types stay in audit-event.types.ts and hashing/normalization guards stay in audit-event.validation.ts."
    );
  }
}

for (const required of [
  /export type AuditAction/,
  /export type AuditResourceType/,
  /export type AuditEventSnapshot/,
  /export type AuditIntegrityReport/,
  /export const auditActions/,
  /from "\.\/audit-event\.catalog\.js"/
]) {
  if (!required.test(auditEventTypesSource)) {
    throw new Error(
      "audit-event.types.ts must keep AuditEvent snapshot/report types and derive action/resource sets from audit-event.catalog.ts."
    );
  }
}

for (const forbidden of [
  /\| "auth\.login\.success"/,
  /\| "Patient"/,
  /\[\s*"auth\.login\.success"/,
  /\[\s*"Patient"/
]) {
  if (forbidden.test(auditEventTypesSource)) {
    throw new Error(
      "AuditEvent action/resource literal catalogs must stay in audit-event.catalog.ts, not in audit-event.types.ts."
    );
  }
}

for (const required of [
  /export const auditActionValues/,
  /export const auditResourceTypeValues/,
  /"audit-event\.integrity-verify"/,
  /"RecordTransfer"/,
  /as const/
]) {
  if (!required.test(auditEventCatalogSource)) {
    throw new Error(
      "audit-event.catalog.ts must keep AuditEvent action and resource literal catalogs."
    );
  }
}

for (const forbidden of [
  /AuditEventSnapshot/,
  /AuditIntegrityReport/,
  /RecordAuditEventInput/,
  /new Set/
]) {
  if (forbidden.test(auditEventCatalogSource)) {
    throw new Error(
      "audit-event.catalog.ts must stay a literal catalog and must not own snapshot/report types or Set construction."
    );
  }
}

if (!/from "\.\/audit-event\.types\.js"/.test(auditEventAggregateSource)) {
  throw new Error("AuditEvent aggregate must depend on audit-event.types.ts for shared types.");
}

if (!/from "\.\/audit-event\.validation\.js"/.test(auditEventAggregateSource)) {
  throw new Error(
    "AuditEvent aggregate must depend on audit-event.validation.ts for canonical hashing and normalization guards."
  );
}

if (!/from "\.\/audit-event\.integrity\.js"/.test(auditEventAggregateSource)) {
  throw new Error(
    "AuditEvent aggregate module must re-export audit-event.integrity.ts to preserve public imports."
  );
}

for (const required of [
  /export function sealAuditEvent/,
  /export function buildAuditIntegrityReport/,
  /hashAuditPayload/,
  /hashCanonical/,
  /normalizeHash/,
  /assertValidDate/,
  /AuditIntegrityReport/,
  /from "\.\/audit-event\.js"/
]) {
  if (!required.test(auditEventIntegritySource)) {
    throw new Error(
      "audit-event.integrity.ts must keep AuditEvent sealing and integrity report behavior."
    );
  }
}

for (const forbidden of [
  /export class AuditEvent/,
  /normalizeAction/,
  /normalizeResourceType/,
  /normalizeSealMetadata/,
  /RecordAuditEventInput/
]) {
  if (forbidden.test(auditEventIntegritySource)) {
    throw new Error(
      "audit-event.integrity.ts must not own AuditEvent recording or rehydration behavior."
    );
  }
}

for (const required of [
  /export function hashAuditPayload/,
  /export function hashCanonical/,
  /export function normalizeSealMetadata/,
  /export function normalizeAction/,
  /from "\.\/audit-event\.types\.js"/
]) {
  if (!required.test(auditEventValidationSource)) {
    throw new Error(
      "audit-event.validation.ts must keep AuditEvent canonical hashing, normalization and seal metadata guards."
    );
  }
}

for (const forbidden of [
  /export type ActorRole/,
  /export type Permission/,
  /const rolePermissions/,
  /clinician: \[/,
  /\bfunction getActivePractitionerOrganizationIds\b/,
  /\bgetActiveOrganizationScopeIds\b/,
  /\bfunction findAncestorOrganizationIds\b/,
  /\bfunction findDescendantOrganizationIds\b/,
  /\bfunction isPractitionerRoleEffective\b/
]) {
  if (forbidden.test(accessControlBehaviorSource)) {
    throw new Error(
      "AccessControl role, purpose, permission catalog and organization scope traversal belong in focused policy/permissions/scope modules, not the behavior file."
    );
  }
}

for (const required of [
  /export type ActorRole/,
  /export type PurposeOfUse/,
  /export type Permission/,
  /export const actorRoles/,
  /export const purposesOfUse/
]) {
  if (!required.test(accessControlPolicySource)) {
    throw new Error(
      "access-control.policy.ts must keep AccessControl roles, purposes and permission definitions."
    );
  }
}

for (const forbidden of [
  /export const rolePermissions/,
  /clinicianPatientPermissions/,
  /clinicalFhirExportPermissions/,
  /clinicalDocumentExportPermissions/,
  /nurseClinicalWorkflowPermissions/
]) {
  if (forbidden.test(accessControlPolicySource)) {
    throw new Error(
      "AccessControl role-permission catalog and reusable permission groups must stay out of access-control.policy.ts."
    );
  }
}

if (!/from "\.\/access-control\.policy\.js"/.test(accessControlBehaviorSource)) {
  throw new Error(
    "AccessControl behavior must depend on access-control.policy.ts for shared policy types."
  );
}

if (!/from "\.\/access-control\.permissions\.js"/.test(accessControlBehaviorSource)) {
  throw new Error(
    "AccessControl behavior must depend on access-control.permissions.ts for the role-permission catalog."
  );
}

if (!/from "\.\/access-control\.organization-scope\.js"/.test(accessControlBehaviorSource)) {
  throw new Error(
    "AccessControl behavior must delegate practitioner organization scope traversal to access-control.organization-scope.ts."
  );
}

for (const required of [
  /export function getActivePractitionerOrganizationIds/,
  /\bfunction isPractitionerRoleEffective\b/,
  /from "\.\.\/provider-directory\/provider-directory\.js"/,
  /from "\.\/access-control\.organization-tree\.js"/
]) {
  if (!required.test(accessControlOrganizationScopeSource)) {
    throw new Error(
      "access-control.organization-scope.ts must keep active practitioner role period policy and delegate active organization hierarchy traversal."
    );
  }
}

for (const forbidden of [
  /rolePermissions/,
  /actorRoles/,
  /purposesOfUse/,
  /\bcanAccess\b/,
  /\bcanAccessPatientRecord\b/,
  /\bfunction findAncestorOrganizationIds\b/,
  /\bfunction findDescendantOrganizationIds\b/,
  /\bfunction isActiveOrganization\b/
]) {
  if (forbidden.test(accessControlOrganizationScopeSource)) {
    throw new Error(
      "AccessControl organization scope module must not own RBAC permission, public patient access decisions or organization tree traversal."
    );
  }
}

for (const required of [
  /export function getActiveOrganizationScopeIds/,
  /\bfunction findAncestorOrganizationIds\b/,
  /\bfunction findDescendantOrganizationIds\b/,
  /\bfunction isActiveOrganization\b/,
  /from "\.\.\/provider-directory\/provider-directory\.js"/
]) {
  if (!required.test(accessControlOrganizationTreeSource)) {
    throw new Error(
      "access-control.organization-tree.ts must keep active organization hierarchy traversal."
    );
  }
}

for (const forbidden of [
  /rolePermissions/,
  /actorRoles/,
  /purposesOfUse/,
  /\bcanAccess\b/,
  /\bcanAccessPatientRecord\b/,
  /\bgetActivePractitionerOrganizationIds\b/,
  /\bisPractitionerRoleEffective\b/
]) {
  if (forbidden.test(accessControlOrganizationTreeSource)) {
    throw new Error(
      "AccessControl organization tree module must not own RBAC permission, patient access decisions or practitioner role policy."
    );
  }
}

for (const required of [
  /export const clinicalFhirExportPermissions/,
  /export const clinicalDocumentExportPermissions/,
  /export const nurseClinicalWorkflowPermissions/,
  /satisfies readonly Permission\[\]/,
  /from "\.\/access-control\.policy\.js"/
]) {
  if (!required.test(accessControlClinicalPermissionsSource)) {
    throw new Error(
      "access-control.clinical-permissions.ts must keep typed clinical workflow and FHIR-export permission groups."
    );
  }
}

for (const forbidden of [
  /rolePermissions/,
  /ActorContext/,
  /PurposeOfUse/,
  /clinicianPatientPermissions/,
  /\bcanAccess\b/,
  /\bcanAccessPatientRecord\b/
]) {
  if (forbidden.test(accessControlClinicalPermissionsSource)) {
    throw new Error(
      "AccessControl clinical permission groups must not own role catalog, patient groups or authorization behavior."
    );
  }
}

for (const required of [
  /export const clinicianPatientPermissions/,
  /export const adminPatientPermissions/,
  /export const providerDirectoryExportPermissions/,
  /export const recordTransferManagementPermissions/,
  /export const adminRecordTransferPermissions/,
  /export const consentManagementPermissions/,
  /export const auditorReadPermissions/,
  /satisfies readonly Permission\[\]/,
  /from "\.\/access-control\.policy\.js"/
]) {
  if (!required.test(accessControlPermissionGroupsSource)) {
    throw new Error(
      "access-control.permission-groups.ts must keep reusable typed role-permission groups."
    );
  }
}

for (const forbidden of [
  /rolePermissions/,
  /ActorContext/,
  /PurposeOfUse/,
  /clinicalFhirExportPermissions/,
  /clinicalDocumentExportPermissions/,
  /nurseClinicalWorkflowPermissions/,
  /\bcanAccess\b/,
  /\bcanAccessPatientRecord\b/
]) {
  if (forbidden.test(accessControlPermissionGroupsSource)) {
    throw new Error(
      "AccessControl permission groups must not own role catalog exports or authorization behavior."
    );
  }
}

for (const required of [
  /export const rolePermissions/,
  /from "\.\/access-control\.policy\.js"/,
  /from "\.\/access-control\.clinical-permissions\.js"/,
  /from "\.\/access-control\.permission-groups\.js"/,
  /clinician:/,
  /nurse:/,
  /auditor:/,
  /admin:/,
  /integration:/
]) {
  if (!required.test(accessControlPermissionsSource)) {
    throw new Error(
      "access-control.permissions.ts must keep AccessControl role-permission catalog definitions."
    );
  }
}

for (const forbidden of [
  /export type ActorRole/,
  /export type PurposeOfUse/,
  /export type Permission/,
  /satisfies readonly Permission\[\]/,
  /export const clinicianPatientPermissions/
]) {
  if (forbidden.test(accessControlPermissionsSource)) {
    throw new Error(
      "AccessControl policy types and reusable permission groups must stay out of access-control.permissions.ts."
    );
  }
}

for (const forbidden of [
  /export type AdministrativeGender/,
  /export type PatientSnapshot/,
  /const administrativeGenders/,
  /function normalizeIdentifier/,
  /\bassertUniqueIdentifiers\b/,
  /\bassertMergeState\b/,
  /\bvalidateTimeline\b/,
  /\bparseDate\b/,
  /\bnormalizeStatus\b/
]) {
  if (forbidden.test(patientAggregateSource)) {
    throw new Error(
      "Patient aggregate must keep demographic update and merge behavior only; registration/rehydration props stay in patient.factory.ts, types stay in patient.types.ts and identifier/date/merge guards stay in patient.validation.ts."
    );
  }
}

for (const required of [
  /export type AdministrativeGender/,
  /export type PatientIdentifier/,
  /export type PatientProps/,
  /export type PatientSnapshot/,
  /export type RegisterPatientInput/,
  /export const administrativeGenders/
]) {
  if (!required.test(patientTypesSource)) {
    throw new Error(
      "patient.types.ts must keep Patient gender, identifier, props, snapshot, registration input and code-set definitions."
    );
  }
}

if (!/from "\.\/patient\.types\.js"/.test(patientAggregateSource)) {
  throw new Error("Patient aggregate must depend on patient.types.ts for shared types.");
}

if (!/from "\.\/patient\.factory\.js"/.test(patientAggregateSource)) {
  throw new Error(
    "Patient aggregate must delegate registration and rehydration props to patient.factory.ts."
  );
}

if (!/from "\.\/patient\.validation\.js"/.test(patientAggregateSource)) {
  throw new Error(
    "Patient aggregate must depend on patient.validation.ts for identifier, FHIR birth date, merge state and timeline guards."
  );
}

for (const required of [
  /export function buildRegisteredPatientProps/,
  /export function buildRehydratedPatientProps/,
  /assertUniqueIdentifiers/,
  /assertMergeState/,
  /validateTimeline/,
  /from "\.\/patient\.validation\.js"/,
  /from "\.\/patient\.types\.js"/
]) {
  if (!required.test(patientFactorySource)) {
    throw new Error(
      "patient.factory.ts must keep Patient registration and rehydration props normalization."
    );
  }
}

for (const forbidden of [
  /export class Patient/,
  /private constructor/,
  /updateDemographics/,
  /markMerged/,
  /toSnapshot/
]) {
  if (forbidden.test(patientFactorySource)) {
    throw new Error(
      "patient.factory.ts must not own Patient aggregate behavior."
    );
  }
}

for (const required of [
  /export function normalizeIdentifier/,
  /export function assertUniqueIdentifiers/,
  /export function assertMergeState/,
  /export function normalizeBirthDate/,
  /from "\.\/patient\.types\.js"/
]) {
  if (!required.test(patientValidationSource)) {
    throw new Error(
      "patient.validation.ts must keep Patient identifier, FHIR birth date, merge state and timeline guards."
    );
  }
}

for (const forbidden of [
  /export type WorkflowTaskStatus/,
  /export type WorkflowTaskSnapshot/,
  /const workflowTaskStatuses/,
  /\bassertCompletedTaskHasOutputReferences\b/,
  /\bnormalizeRequired\b/,
  /\bparseDate\b/,
  /function normalizeCode/,
  /function normalizeReferences/,
  /function validateTimeline/
]) {
  if (forbidden.test(workflowTaskAggregateSource)) {
    throw new Error(
      "WorkflowTask aggregate must keep lifecycle behavior only; create/rehydrate normalization stays in workflow-task.factory.ts, types stay in workflow-task.types.ts, code/reference/timeline guards stay in workflow-task.validation.ts, and code-set guards stay in workflow-task.code-set-guards.ts."
    );
  }
}

for (const required of [
  /export type WorkflowTaskStatus/,
  /export type WorkflowTaskReferenceResourceType/,
  /export type WorkflowTaskSnapshot/,
  /export type CreateWorkflowTaskInput/,
  /export const workflowTaskStatuses/
]) {
  if (!required.test(workflowTaskTypesSource)) {
    throw new Error(
      "workflow-task.types.ts must keep WorkflowTask status, reference, snapshot, command input and code-set definitions."
    );
  }
}

if (!/from "\.\/workflow-task\.types\.js"/.test(workflowTaskAggregateSource)) {
  throw new Error("WorkflowTask aggregate must depend on workflow-task.types.ts for shared types.");
}

if (!/from "\.\/workflow-task\.factory\.js"/.test(workflowTaskAggregateSource)) {
  throw new Error(
    "WorkflowTask aggregate must delegate create and rehydrate normalization to workflow-task.factory.ts."
  );
}

for (const required of [
  /export function buildWorkflowTaskSnapshot/,
  /export function normalizePersistedWorkflowTaskSnapshot/,
  /export type WorkflowTaskProps/,
  /from "\.\/workflow-task\.types\.js"/,
  /from "\.\/workflow-task\.validation\.js"/,
  /from "\.\/workflow-task\.code-set-guards\.js"/
]) {
  if (!required.test(workflowTaskFactorySource)) {
    throw new Error(
      "workflow-task.factory.ts must keep WorkflowTask creation, persisted snapshot normalization and props construction."
    );
  }
}

for (const forbidden of [
  /class WorkflowTask/,
  /\btoSnapshot\b/
]) {
  if (forbidden.test(workflowTaskFactorySource)) {
    throw new Error(
      "workflow-task.factory.ts must not own WorkflowTask aggregate behavior or presentation snapshots."
    );
  }
}

for (const required of [
  /export function normalizeCode/,
  /export function normalizeReferences/,
  /export function validateTimeline/,
  /export function assertCompletedTaskHasOutputReferences/,
  /from "\.\/workflow-task\.code-set-guards\.js"/,
  /from "\.\/workflow-task\.types\.js"/
]) {
  if (!required.test(workflowTaskValidationSource)) {
    throw new Error(
      "workflow-task.validation.ts must keep WorkflowTask code, reference structure and timeline guards."
    );
  }
}

for (const forbidden of [
  /export function normalizeStatus/,
  /export function normalizeIntent/,
  /export function normalizePriority/,
  /\bworkflowTaskStatuses\b|\bworkflowTaskIntents\b|\bworkflowTaskPriorities\b/
]) {
  if (forbidden.test(workflowTaskValidationSource)) {
    throw new Error(
      "WorkflowTask status, intent and priority code-set guards belong in workflow-task.code-set-guards.ts."
    );
  }
}

for (const required of [
  /export function normalizeStatus/,
  /export function normalizeIntent/,
  /export function normalizePriority/,
  /export function normalizeReferenceResourceType/,
  /from "\.\/workflow-task\.types\.js"/
]) {
  if (!required.test(workflowTaskCodeSetGuardsSource)) {
    throw new Error(
      "workflow-task.code-set-guards.ts must keep WorkflowTask status, intent, priority and reference resource code-set guards."
    );
  }
}

for (const forbidden of [
  /export type ProcedureStatus/,
  /export type ProcedureSnapshot/,
  /const procedureStatuses/,
  /function normalizeRequiredCoding/,
  /function normalizePerformers/,
  /function normalizeReportReferences/,
  /function assertProcedureLifecycle/
]) {
  if (forbidden.test(procedureAggregateSource)) {
    throw new Error(
      "Procedure aggregate must keep record/rehydrate behavior only; types stay in procedure.types.ts, coding/performer/report/lifecycle guards stay in procedure.validation.ts, and code-set guards stay in procedure.code-set-guards.ts."
    );
  }
}

for (const required of [
  /export type ProcedureStatus/,
  /export type ProcedureCategory/,
  /export type ProcedureSnapshot/,
  /export type CreateProcedureInput/,
  /export const procedureStatuses/
]) {
  if (!required.test(procedureTypesSource)) {
    throw new Error(
      "procedure.types.ts must keep Procedure status, category, snapshot, command input and code-set definitions."
    );
  }
}

if (!/from "\.\/procedure\.types\.js"/.test(procedureAggregateSource)) {
  throw new Error("Procedure aggregate must depend on procedure.types.ts for shared types.");
}

if (!/from "\.\/procedure\.validation\.js"/.test(procedureAggregateSource)) {
  throw new Error(
    "Procedure aggregate must depend on procedure.validation.ts for coding, performer, report and lifecycle guards."
  );
}

if (!/from "\.\/procedure\.code-set-guards\.js"/.test(procedureAggregateSource)) {
  throw new Error(
    "Procedure aggregate must depend on procedure.code-set-guards.ts for status and category guards."
  );
}

for (const required of [
  /export function normalizeRequiredCoding/,
  /export function normalizePerformers/,
  /export function normalizeReportReferences/,
  /export function assertProcedureLifecycle/,
  /export function validateSelfReference/,
  /from "\.\/procedure\.code-set-guards\.js"/,
  /from "\.\/procedure\.types\.js"/
]) {
  if (!required.test(procedureValidationSource)) {
    throw new Error(
      "procedure.validation.ts must keep Procedure coding, performer structure, report reference and lifecycle guards."
    );
  }
}

for (const forbidden of [
  /export function normalizeStatus/,
  /export function normalizeCategory/,
  /\bprocedureStatuses\b|\bprocedureCategories\b|\bprocedurePerformerActorTypes\b|\bprocedureReportReferenceResourceTypes\b/
]) {
  if (forbidden.test(procedureValidationSource)) {
    throw new Error(
      "Procedure status, category, performer actor and report reference code-set guards belong in procedure.code-set-guards.ts."
    );
  }
}

for (const required of [
  /export function normalizeStatus/,
  /export function normalizeCategory/,
  /export function normalizePerformerActorType/,
  /export function normalizeReportReferenceResourceType/,
  /from "\.\/procedure\.types\.js"/
]) {
  if (!required.test(procedureCodeSetGuardsSource)) {
    throw new Error(
      "procedure.code-set-guards.ts must keep Procedure status, category, performer actor and report reference code-set guards."
    );
  }
}

for (const forbidden of [
  /export type RecordTransferDeliveryAttemptStatus/,
  /export type RecordTransferDeliveryAttemptSnapshot/,
  /const deliveryAttemptStatuses/,
  /function normalizeRequired/,
  /function validateTerminalState/,
  /normalizeEndpointAddress/,
  /normalizeAttemptNumber/,
  /normalizeBundleType/,
  /normalizeStatus/,
  /normalizeOptional/,
  /validatePersistenceTimeline/,
  /validateTerminalState/
]) {
  if (forbidden.test(deliveryAttemptAggregateSource)) {
    throw new Error(
      "RecordTransferDeliveryAttempt aggregate must keep terminal behavior only; queue/rehydrate normalization stays in record-transfer-delivery-attempt.factory.ts, types stay in record-transfer-delivery-attempt.types.ts and guards stay in record-transfer-delivery-attempt.validation.ts."
    );
  }
}

for (const required of [
  /export type RecordTransferDeliveryAttemptStatus/,
  /export type RecordTransferDeliveryAttemptBundleType/,
  /export type RecordTransferDeliveryAttemptSnapshot/,
  /export type QueueRecordTransferDeliveryAttemptInput/,
  /export const deliveryAttemptStatuses/
]) {
  if (!required.test(deliveryAttemptTypesSource)) {
    throw new Error(
      "record-transfer-delivery-attempt.types.ts must keep delivery status, bundle, snapshot, command input and code-set definitions."
    );
  }
}

if (!/from "\.\/record-transfer-delivery-attempt\.types\.js"/.test(
  deliveryAttemptAggregateSource
)) {
  throw new Error(
    "RecordTransferDeliveryAttempt aggregate must depend on record-transfer-delivery-attempt.types.ts for shared types."
  );
}

if (!/from "\.\/record-transfer-delivery-attempt\.validation\.js"/.test(
  deliveryAttemptAggregateSource
)) {
  throw new Error(
    "RecordTransferDeliveryAttempt aggregate must depend on record-transfer-delivery-attempt.validation.ts for terminal update guards."
  );
}

if (!/from "\.\/record-transfer-delivery-attempt\.factory\.js"/.test(
  deliveryAttemptAggregateSource
)) {
  throw new Error(
    "RecordTransferDeliveryAttempt aggregate must delegate queue and rehydrate normalization to record-transfer-delivery-attempt.factory.ts."
  );
}

for (const required of [
  /export function buildQueuedDeliveryAttemptSnapshot/,
  /export function buildRehydratedDeliveryAttemptSnapshot/,
  /normalizeEndpointAddress/,
  /normalizeAttemptNumber/,
  /normalizeBundleType/,
  /normalizeStatus/,
  /validatePersistenceTimeline/,
  /validateTerminalState/,
  /from "\.\/record-transfer-delivery-attempt\.validation\.js"/,
  /from "\.\/record-transfer-delivery-attempt\.types\.js"/
]) {
  if (!required.test(deliveryAttemptFactorySource)) {
    throw new Error(
      "record-transfer-delivery-attempt.factory.ts must keep delivery attempt queue and rehydrate snapshot normalization."
    );
  }
}

for (const forbidden of [
  /export class RecordTransferDeliveryAttempt/,
  /markSucceeded\(/,
  /markFailed\(/,
  /toSnapshot\(/
]) {
  if (forbidden.test(deliveryAttemptFactorySource)) {
    throw new Error(
      "RecordTransferDeliveryAttempt factory must not own terminal aggregate behavior."
    );
  }
}

for (const required of [
  /export function normalizeEndpointAddress/,
  /export function normalizeAttemptNumber/,
  /export function normalizeStatus/,
  /export function validateTerminalState/,
  /export function assertCompletedAtIsNotBeforeQueuedAt/,
  /from "\.\/record-transfer-delivery-attempt\.types\.js"/
]) {
  if (!required.test(deliveryAttemptValidationSource)) {
    throw new Error(
      "record-transfer-delivery-attempt.validation.ts must keep delivery attempt normalization, status and terminal-state guards."
    );
  }
}

for (const forbidden of [
  /export type MedicationRequestStatus/,
  /export type MedicationRequestSnapshot/,
  /const medicationRequestStatuses/,
  /function normalizeMedicationCode/,
  /function normalizeDosageInstruction/,
  /function validatePersistenceTimeline/
]) {
  if (forbidden.test(medicationRequestAggregateSource)) {
    throw new Error(
      "MedicationRequest aggregate must keep prescribe/rehydrate behavior only; types stay in medication-request.types.ts and code/dosage/status/timeline guards stay in medication-request.validation.ts."
    );
  }
}

for (const required of [
  /export type MedicationRequestStatus/,
  /export type MedicationTimingUnit/,
  /export type MedicationRequestSnapshot/,
  /export type CreateMedicationRequestInput/,
  /export const medicationRequestStatuses/
]) {
  if (!required.test(medicationRequestTypesSource)) {
    throw new Error(
      "medication-request.types.ts must keep MedicationRequest status, timing, snapshot, command input and code-set definitions."
    );
  }
}

if (!/from "\.\/medication-request\.types\.js"/.test(medicationRequestAggregateSource)) {
  throw new Error(
    "MedicationRequest aggregate must depend on medication-request.types.ts for shared types."
  );
}

if (!/from "\.\/medication-request\.validation\.js"/.test(medicationRequestAggregateSource)) {
  throw new Error(
    "MedicationRequest aggregate must depend on medication-request.validation.ts for code, dosage, status and timeline guards."
  );
}

for (const required of [
  /export function normalizeMedicationCode/,
  /export function normalizeDosageInstruction/,
  /export function normalizeStatus/,
  /export function normalizeIntent/,
  /export function validatePersistenceTimeline/,
  /from "\.\/medication-request\.types\.js"/
]) {
  if (!required.test(medicationRequestValidationSource)) {
    throw new Error(
      "medication-request.validation.ts must keep MedicationRequest code, dosage, status, intent and timeline guards."
    );
  }
}

for (const forbidden of [
  /export type MedicationDispenseStatus/,
  /export type MedicationDispenseSnapshot/,
  /const medicationDispenseStatuses/,
  /function normalizeRequiredCoding/,
  /function normalizeQuantity/,
  /function normalizeDosageInstruction/,
  /function validatePersistenceTimeline/
]) {
  if (forbidden.test(medicationDispenseAggregateSource)) {
    throw new Error(
      "MedicationDispense aggregate must keep record/rehydrate behavior only; types stay in medication-dispense.types.ts and quantity/dosage/status/lifecycle guards stay in medication-dispense.validation.ts."
    );
  }
}

for (const required of [
  /export type MedicationDispenseStatus/,
  /export type MedicationDispenseCategory/,
  /export type MedicationDispenseSnapshot/,
  /export type RecordMedicationDispenseInput/,
  /export const medicationDispenseStatuses/
]) {
  if (!required.test(medicationDispenseTypesSource)) {
    throw new Error(
      "medication-dispense.types.ts must keep MedicationDispense status, category, snapshot, command input and code-set definitions."
    );
  }
}

if (!/from "\.\/medication-dispense\.types\.js"/.test(medicationDispenseAggregateSource)) {
  throw new Error(
    "MedicationDispense aggregate must depend on medication-dispense.types.ts for shared types."
  );
}

if (!/from "\.\/medication-dispense\.validation\.js"/.test(medicationDispenseAggregateSource)) {
  throw new Error(
    "MedicationDispense aggregate must depend on medication-dispense.validation.ts for quantity, dosage, status and handover lifecycle guards."
  );
}

for (const required of [
  /export function assertMedicationDispenseLifecycle/,
  /export function normalizeRequiredCoding/,
  /export function normalizeQuantity/,
  /export function normalizeDosageInstruction/,
  /export function normalizeStatus/,
  /from "\.\/medication-dispense\.types\.js"/
]) {
  if (!required.test(medicationDispenseValidationSource)) {
    throw new Error(
      "medication-dispense.validation.ts must keep MedicationDispense quantity, dosage, status and handover lifecycle guards."
    );
  }
}

for (const forbidden of [
  /export type MedicationAdministrationStatus/,
  /export type MedicationAdministrationSnapshot/,
  /const medicationAdministrationStatuses/,
  /function normalizeEffectivePeriod/,
  /function normalizePerformers/,
  /function normalizeDosage/,
  /function assertMedicationAdministrationLifecycle/
]) {
  if (forbidden.test(medicationAdministrationAggregateSource)) {
    throw new Error(
      "MedicationAdministration aggregate must keep record/rehydrate behavior only; types stay in medication-administration.types.ts, effective-period/performer/dosage/lifecycle guards stay in medication-administration.validation.ts, and code-set guards stay in medication-administration.code-set-guards.ts."
    );
  }
}

for (const required of [
  /export type MedicationAdministrationStatus/,
  /export type MedicationAdministrationCategory/,
  /export type MedicationAdministrationSnapshot/,
  /export type RecordMedicationAdministrationInput/,
  /export const medicationAdministrationStatuses/
]) {
  if (!required.test(medicationAdministrationTypesSource)) {
    throw new Error(
      "medication-administration.types.ts must keep MedicationAdministration status, category, snapshot, command input and code-set definitions."
    );
  }
}

if (!/from "\.\/medication-administration\.types\.js"/.test(
  medicationAdministrationAggregateSource
)) {
  throw new Error(
    "MedicationAdministration aggregate must depend on medication-administration.types.ts for shared types."
  );
}

if (!/from "\.\/medication-administration\.validation\.js"/.test(
  medicationAdministrationAggregateSource
)) {
  throw new Error(
    "MedicationAdministration aggregate must depend on medication-administration.validation.ts for effective period, performer, dosage and lifecycle guards."
  );
}

if (!/from "\.\/medication-administration\.code-set-guards\.js"/.test(
  medicationAdministrationAggregateSource
)) {
  throw new Error(
    "MedicationAdministration aggregate must depend on medication-administration.code-set-guards.ts for status and category guards."
  );
}

for (const required of [
  /export function normalizeEffectivePeriod/,
  /export function normalizePerformers/,
  /export function normalizeDosage/,
  /export function assertMedicationAdministrationLifecycle/,
  /from "\.\/medication-administration\.code-set-guards\.js"/,
  /from "\.\/medication-administration\.types\.js"/
]) {
  if (!required.test(medicationAdministrationValidationSource)) {
    throw new Error(
      "medication-administration.validation.ts must keep MedicationAdministration effective-period, performer structure, dosage and lifecycle guards."
    );
  }
}

for (const forbidden of [
  /export function normalizeStatus/,
  /export function normalizeCategory/,
  /\bmedicationAdministrationStatuses\b|\bmedicationAdministrationCategories\b|\bmedicationAdministrationPerformerActorTypes\b/
]) {
  if (forbidden.test(medicationAdministrationValidationSource)) {
    throw new Error(
      "MedicationAdministration status, category and performer actor code-set guards belong in medication-administration.code-set-guards.ts."
    );
  }
}

for (const required of [
  /export function normalizeStatus/,
  /export function normalizeCategory/,
  /export function normalizePerformerActorType/,
  /from "\.\/medication-administration\.types\.js"/
]) {
  if (!required.test(medicationAdministrationCodeSetGuardsSource)) {
    throw new Error(
      "medication-administration.code-set-guards.ts must keep MedicationAdministration status, category and performer actor code-set guards."
    );
  }
}

for (const forbidden of [
  /export type ServiceRequestStatus/,
  /export type ServiceRequestSnapshot/,
  /const serviceRequestStatuses/,
  /function normalizeCode/,
  /function validateTimeline/
]) {
  if (forbidden.test(serviceRequestAggregateSource)) {
    throw new Error(
      "ServiceRequest aggregate must keep order/rehydrate behavior only; types stay in service-request.types.ts and code/status/priority/timeline guards stay in service-request.validation.ts."
    );
  }
}

for (const required of [
  /export type ServiceRequestStatus/,
  /export type ServiceRequestIntent/,
  /export type ServiceRequestSnapshot/,
  /export type CreateServiceRequestInput/,
  /export const serviceRequestStatuses/
]) {
  if (!required.test(serviceRequestTypesSource)) {
    throw new Error(
      "service-request.types.ts must keep ServiceRequest status, intent, snapshot, command input and code-set definitions."
    );
  }
}

if (!/from "\.\/service-request\.types\.js"/.test(serviceRequestAggregateSource)) {
  throw new Error(
    "ServiceRequest aggregate must depend on service-request.types.ts for shared types."
  );
}

if (!/from "\.\/service-request\.validation\.js"/.test(serviceRequestAggregateSource)) {
  throw new Error(
    "ServiceRequest aggregate must depend on service-request.validation.ts for code, status, priority and timeline guards."
  );
}

for (const required of [
  /export function normalizeCode/,
  /export function normalizeStatus/,
  /export function normalizePriority/,
  /export function validateTimeline/,
  /from "\.\/service-request\.types\.js"/
]) {
  if (!required.test(serviceRequestValidationSource)) {
    throw new Error(
      "service-request.validation.ts must keep ServiceRequest code, status, priority and timeline guards."
    );
  }
}

for (const forbidden of [
  /export type ImagingStudyStatus/,
  /export type ImagingStudySnapshot/,
  /const imagingStudyStatuses/,
  /function normalizeSeries/,
  /function validateCounts/,
  /function validateTimeline/
]) {
  if (forbidden.test(imagingStudyAggregateSource)) {
    throw new Error(
      "ImagingStudy aggregate must keep record/rehydrate behavior only; types stay in imaging-study.types.ts and DICOM UID, series count and timeline guards stay in imaging-study.validation.ts."
    );
  }
}

for (const required of [
  /export type ImagingStudyStatus/,
  /export type ImagingStudySeries/,
  /export type ImagingStudySnapshot/,
  /export type CreateImagingStudyInput/,
  /export const imagingStudyStatuses/
]) {
  if (!required.test(imagingStudyTypesSource)) {
    throw new Error(
      "imaging-study.types.ts must keep ImagingStudy status, series, snapshot, command input and code-set definitions."
    );
  }
}

if (!/from "\.\/imaging-study\.types\.js"/.test(imagingStudyAggregateSource)) {
  throw new Error(
    "ImagingStudy aggregate must depend on imaging-study.types.ts for shared types."
  );
}

if (!/from "\.\/imaging-study\.validation\.js"/.test(imagingStudyAggregateSource)) {
  throw new Error(
    "ImagingStudy aggregate must depend on imaging-study.validation.ts for DICOM UID, series count and timeline guards."
  );
}

for (const required of [
  /export function normalizeStudyInstanceUid/,
  /export function normalizeSeries/,
  /export function validateCounts/,
  /export function validateTimeline/,
  /export function normalizeStatus/,
  /from "\.\/imaging-study\.types\.js"/
]) {
  if (!required.test(imagingStudyValidationSource)) {
    throw new Error(
      "imaging-study.validation.ts must keep ImagingStudy DICOM UID, series count, status and timeline guards."
    );
  }
}

for (const forbidden of [
  /export type ClinicalDocumentType/,
  /export type ClinicalDocumentSnapshot/,
  /const clinicalDocumentStatuses/,
  /type ClinicalDocumentProps =/,
  /function normalizeAttachmentSize/,
  /normalizeAttachmentContentType/,
  /normalizeAttachmentHash/,
  /normalizeAttachmentSize/,
  /normalizeStatus/,
  /parseOptionalDate/,
  /parseRequiredDate/,
  /validateTimeline/
]) {
  if (forbidden.test(clinicalDocumentAggregateSource)) {
    throw new Error(
      "ClinicalDocument aggregate must keep signing behavior only; create/rehydrate normalization stays in clinical-document.factory.ts, types stay in clinical-document.types.ts and guards stay in clinical-document.validation.ts."
    );
  }
}

for (const required of [
  /export type ClinicalDocumentType/,
  /export type ClinicalDocumentStatus/,
  /export type ClinicalDocumentSnapshot/,
  /export type ClinicalDocumentProps/,
  /export type CreateClinicalDocumentInput/,
  /export const clinicalDocumentStatuses/
]) {
  if (!required.test(clinicalDocumentTypesSource)) {
    throw new Error(
      "clinical-document.types.ts must keep ClinicalDocument document type, status, props, snapshot, command input and code-set definitions."
    );
  }
}

if (!/from "\.\/clinical-document\.types\.js"/.test(clinicalDocumentAggregateSource)) {
  throw new Error(
    "ClinicalDocument aggregate must depend on clinical-document.types.ts for shared types."
  );
}

if (!/from "\.\/clinical-document\.validation\.js"/.test(clinicalDocumentAggregateSource)) {
  throw new Error(
    "ClinicalDocument aggregate must depend on clinical-document.validation.ts for signing timestamp guard."
  );
}

if (!/from "\.\/clinical-document\.factory\.js"/.test(clinicalDocumentAggregateSource)) {
  throw new Error(
    "ClinicalDocument aggregate must delegate create and rehydrate normalization to clinical-document.factory.ts."
  );
}

for (const required of [
  /export function buildClinicalDocumentProps/,
  /export function buildRehydratedClinicalDocumentProps/,
  /normalizeAttachmentContentType/,
  /normalizeAttachmentHash/,
  /normalizeAttachmentSize/,
  /normalizeStatus/,
  /parseOptionalDate/,
  /parseRequiredDate/,
  /validateTimeline/,
  /from "\.\/clinical-document\.validation\.js"/,
  /from "\.\/clinical-document\.types\.js"/
]) {
  if (!required.test(clinicalDocumentFactorySource)) {
    throw new Error(
      "clinical-document.factory.ts must keep ClinicalDocument create and rehydrate props normalization."
    );
  }
}

for (const forbidden of [
  /export class ClinicalDocument/,
  /\bsign\(/,
  /toSnapshot\(/
]) {
  if (forbidden.test(clinicalDocumentFactorySource)) {
    throw new Error(
      "ClinicalDocument factory must not own aggregate behavior."
    );
  }
}

for (const required of [
  /export function normalizeAttachmentSize/,
  /export function normalizeAttachmentContentType/,
  /export function normalizeAttachmentHash/,
  /export function normalizeStatus/,
  /from "\.\/clinical-document\.types\.js"/
]) {
  if (!required.test(clinicalDocumentValidationSource)) {
    throw new Error(
      "clinical-document.validation.ts must keep ClinicalDocument attachment, status and timeline guards."
    );
  }
}

for (const forbidden of [
  /export type DiagnosticReportStatus/,
  /export type DiagnosticReportSnapshot/,
  /const diagnosticReportStatuses/,
  /function normalizeCode/
]) {
  if (forbidden.test(diagnosticReportAggregateSource)) {
    throw new Error(
      "DiagnosticReport aggregate must keep issue/rehydrate behavior only; types stay in diagnostic-report.types.ts and code/content/status/timeline guards stay in diagnostic-report.validation.ts."
    );
  }
}

for (const required of [
  /export type DiagnosticReportStatus/,
  /export type DiagnosticReportCategory/,
  /export type DiagnosticReportSnapshot/,
  /export type CreateDiagnosticReportInput/,
  /export const diagnosticReportStatuses/,
  /export const diagnosticReportCategories/
]) {
  if (!required.test(diagnosticReportTypesSource)) {
    throw new Error(
      "diagnostic-report.types.ts must keep DiagnosticReport status, category, snapshot, command input and code-set definitions."
    );
  }
}

if (!/from "\.\/diagnostic-report\.types\.js"/.test(diagnosticReportAggregateSource)) {
  throw new Error(
    "DiagnosticReport aggregate must depend on diagnostic-report.types.ts for shared types."
  );
}

if (!/from "\.\/diagnostic-report\.validation\.js"/.test(diagnosticReportAggregateSource)) {
  throw new Error(
    "DiagnosticReport aggregate must depend on diagnostic-report.validation.ts for code, content, status and timeline guards."
  );
}

for (const required of [
  /export function normalizeCode/,
  /export function assertReportContent/,
  /export function normalizeStatus/,
  /export function normalizeCategory/,
  /from "\.\/diagnostic-report\.types\.js"/
]) {
  if (!required.test(diagnosticReportValidationSource)) {
    throw new Error(
      "diagnostic-report.validation.ts must keep DiagnosticReport code, content, status and timeline guards."
    );
  }
}

for (const forbidden of [
  /export type ObservationStatus/,
  /export type ObservationSnapshot/,
  /const observationStatuses/,
  /function normalizeQuantity/,
  /function validateObservationValue/
]) {
  if (forbidden.test(observationAggregateSource)) {
    throw new Error(
      "Observation aggregate must keep record/rehydrate behavior only; types stay in observation.types.ts and quantity/value/status/timeline guards stay in observation.validation.ts."
    );
  }
}

for (const required of [
  /export type ObservationStatus/,
  /export type ObservationCategory/,
  /export type ObservationQuantity/,
  /export type ObservationSnapshot/,
  /export type CreateObservationInput/,
  /export const observationStatuses/,
  /export const observationCategories/
]) {
  if (!required.test(observationTypesSource)) {
    throw new Error(
      "observation.types.ts must keep Observation status, category, quantity, snapshot, command input and code-set definitions."
    );
  }
}

if (!/from "\.\/observation\.types\.js"/.test(observationAggregateSource)) {
  throw new Error("Observation aggregate must depend on observation.types.ts for shared types.");
}

if (!/from "\.\/observation\.validation\.js"/.test(observationAggregateSource)) {
  throw new Error(
    "Observation aggregate must depend on observation.validation.ts for quantity, value, status and timeline guards."
  );
}

for (const required of [
  /export function normalizeQuantity/,
  /export function validateObservationValue/,
  /export function normalizeStatus/,
  /export function normalizeCategory/,
  /from "\.\/observation\.types\.js"/
]) {
  if (!required.test(observationValidationSource)) {
    throw new Error(
      "observation.validation.ts must keep Observation quantity, value, status and timeline guards."
    );
  }
}

for (const required of [
  /export function mapObservationToFhir/,
  /from "\.\/map-observation-codings\.js"/,
  /observationFhirProfile/,
  /toObservationCategory/,
  /toObservationCodeableConcept/,
  /resourceType:\s*"Observation"/,
  /valueQuantity/,
  /valueString/
]) {
  if (!required.test(mapObservationToFhirSource)) {
    throw new Error(
      "map-observation-to-fhir.ts must keep the public Observation mapper, value mapping and clinical references while delegating profile, category and CodeableConcept helpers to map-observation-codings.ts."
    );
  }
}

for (const forbidden of [
  /const categoryLabels/,
  /const categoryCodes/,
  /categoryCodings/,
  /\bObservationCategory\b/,
  /\bObservationCode\b/,
  /"http:\/\/terminology\.hl7\.org\/CodeSystem\/observation-category"/
]) {
  if (forbidden.test(mapObservationToFhirSource)) {
    throw new Error(
      "Observation FHIR profile, category coding and CodeableConcept mapping belong in map-observation-codings.ts, not in the public mapper."
    );
  }
}

for (const required of [
  /export const observationFhirProfile/,
  /export function toObservationCategory/,
  /export function toObservationCodeableConcept/,
  /ObservationCategory/,
  /ObservationCode/,
  /observation-category/,
  /\blaboratory:/,
  /"vital-signs"/
]) {
  if (!required.test(mapObservationCodingsSource)) {
    throw new Error(
      "map-observation-codings.ts must keep Observation FHIR profile, observation-category catalog and CodeableConcept mapping."
    );
  }
}

for (const forbidden of [
  /mapObservationToFhir/,
  /resourceType:\s*"Observation"/,
  /patientId/,
  /encounterId/,
  /effectiveAt/,
  /valueQuantity/,
  /valueString/,
  /performerPractitionerId/
]) {
  if (forbidden.test(mapObservationCodingsSource)) {
    throw new Error(
      "map-observation-codings.ts must stay a coding helper and must not own Observation resource orchestration, values or clinical references."
    );
  }
}

for (const forbidden of [
  /export type ConditionClinicalStatus/,
  /export type ConditionSnapshot/,
  /const conditionClinicalStatuses/,
  /function normalizeCode/,
  /function validateTimeline/
]) {
  if (forbidden.test(conditionAggregateSource)) {
    throw new Error(
      "Condition aggregate must keep record/rehydrate behavior only; types stay in condition.types.ts and code/status/timeline guards stay in condition.validation.ts."
    );
  }
}

for (const required of [
  /export type ConditionClinicalStatus/,
  /export type ConditionVerificationStatus/,
  /export type ConditionCategory/,
  /export type ConditionSeverity/,
  /export type ConditionSnapshot/,
  /export type CreateConditionInput/,
  /export const conditionClinicalStatuses/,
  /export const conditionVerificationStatuses/,
  /export const conditionCategories/,
  /export const conditionSeverities/
]) {
  if (!required.test(conditionTypesSource)) {
    throw new Error(
      "condition.types.ts must keep Condition statuses, category, severity, snapshot, command input and code-set definitions."
    );
  }
}

if (!/from "\.\/condition\.types\.js"/.test(conditionAggregateSource)) {
  throw new Error("Condition aggregate must depend on condition.types.ts for shared types.");
}

if (!/from "\.\/condition\.validation\.js"/.test(conditionAggregateSource)) {
  throw new Error(
    "Condition aggregate must depend on condition.validation.ts for code, status, severity and timeline guards."
  );
}

for (const required of [
  /export function normalizeCode/,
  /export function normalizeClinicalStatus/,
  /export function normalizeVerificationStatus/,
  /export function validateTimeline/,
  /from "\.\/condition\.types\.js"/
]) {
  if (!required.test(conditionValidationSource)) {
    throw new Error(
      "condition.validation.ts must keep Condition code, status, severity and timeline guards."
    );
  }
}

for (const required of [
  /export function mapConditionToFhir/,
  /from "\.\/map-condition-codings\.js"/,
  /conditionFhirProfile/,
  /toConditionClinicalStatus/,
  /toConditionVerificationStatus/,
  /toConditionCategory/,
  /toConditionSeverity/,
  /toConditionCodeableConcept/,
  /resourceType:\s*"Condition"/,
  /verificationStatus === "entered-in-error"/
]) {
  if (!required.test(mapConditionToFhirSource)) {
    throw new Error(
      "map-condition-to-fhir.ts must keep the public Condition mapper, clinical references and entered-in-error omission rule while delegating profile, labels and CodeableConcept helpers to map-condition-codings.ts."
    );
  }
}

for (const forbidden of [
  /const categoryLabels/,
  /\bConditionCategory\b/,
  /\bConditionClinicalStatus\b/,
  /\bConditionVerificationStatus\b/,
  /\bConditionSeverity\b/,
  /"http:\/\/terminology\.hl7\.org\/CodeSystem\/condition-/
]) {
  if (forbidden.test(mapConditionToFhirSource)) {
    throw new Error(
      "Condition FHIR profile, terminology labels and CodeableConcept mapping belong in map-condition-codings.ts, not in the public mapper."
    );
  }
}

for (const required of [
  /export const conditionFhirProfile/,
  /export function toConditionClinicalStatus/,
  /export function toConditionVerificationStatus/,
  /export function toConditionCategory/,
  /export function toConditionSeverity/,
  /export function toConditionCodeableConcept/,
  /ConditionClinicalStatus/,
  /ConditionVerificationStatus/,
  /ConditionCategory/,
  /condition-clinical/,
  /condition-ver-status/,
  /condition-category/
]) {
  if (!required.test(mapConditionCodingsSource)) {
    throw new Error(
      "map-condition-codings.ts must keep Condition FHIR profile, terminology status/category/severity labels and CodeableConcept mapping."
    );
  }
}

for (const forbidden of [
  /mapConditionToFhir/,
  /resourceType:\s*"Condition"/,
  /patientId/,
  /encounterId/,
  /recorderPractitionerId/,
  /onsetAt/,
  /recordedAt/,
  /note/
]) {
  if (forbidden.test(mapConditionCodingsSource)) {
    throw new Error(
      "map-condition-codings.ts must stay a coding helper and must not own Condition resource orchestration or clinical references."
    );
  }
}

for (const forbidden of [
  /export type AllergyClinicalStatus/,
  /export type AllergyIntoleranceSnapshot/,
  /const allergyClinicalStatuses/,
  /function normalizeReaction/,
  /function validatePersistenceTimeline/
]) {
  if (forbidden.test(allergyIntoleranceAggregateSource)) {
    throw new Error(
      "AllergyIntolerance aggregate must keep record/rehydrate behavior only; types stay in allergy-intolerance.types.ts and code/reaction/status/timeline guards stay in allergy-intolerance.validation.ts."
    );
  }
}

for (const required of [
  /export type AllergyClinicalStatus/,
  /export type AllergyVerificationStatus/,
  /export type AllergyType/,
  /export type AllergyCategory/,
  /export type AllergyCriticality/,
  /export type AllergyReactionSeverity/,
  /export type AllergyIntoleranceSnapshot/,
  /export type CreateAllergyIntoleranceInput/,
  /export const allergyClinicalStatuses/,
  /export const allergyVerificationStatuses/,
  /export const allergyTypes/,
  /export const allergyCategories/,
  /export const allergyCriticalities/,
  /export const allergyReactionSeverities/
]) {
  if (!required.test(allergyIntoleranceTypesSource)) {
    throw new Error(
      "allergy-intolerance.types.ts must keep AllergyIntolerance statuses, category, reaction, snapshot, command input and code-set definitions."
    );
  }
}

if (!/from "\.\/allergy-intolerance\.types\.js"/.test(allergyIntoleranceAggregateSource)) {
  throw new Error(
    "AllergyIntolerance aggregate must depend on allergy-intolerance.types.ts for shared types."
  );
}

if (!/from "\.\/allergy-intolerance\.validation\.js"/.test(
  allergyIntoleranceAggregateSource
)) {
  throw new Error(
    "AllergyIntolerance aggregate must depend on allergy-intolerance.validation.ts for code, reaction, status and timeline guards."
  );
}

for (const required of [
  /export function normalizeReaction/,
  /export function normalizeClinicalStatus/,
  /export function normalizeVerificationStatus/,
  /export function validatePersistenceTimeline/,
  /from "\.\/allergy-intolerance\.types\.js"/
]) {
  if (!required.test(allergyIntoleranceValidationSource)) {
    throw new Error(
      "allergy-intolerance.validation.ts must keep AllergyIntolerance code, reaction, status and timeline guards."
    );
  }
}

for (const required of [
  /export function mapAllergyIntoleranceToFhir/,
  /from "\.\/map-allergy-intolerance-codings\.js"/,
  /allergyIntoleranceFhirProfile/,
  /toAllergyClinicalStatus/,
  /toAllergyVerificationStatus/,
  /toAllergyCodeableConcept/,
  /toAllergyReaction/,
  /resourceType:\s*"AllergyIntolerance"/,
  /verificationStatus === "entered-in-error"/
]) {
  if (!required.test(mapAllergyIntoleranceToFhirSource)) {
    throw new Error(
      "map-allergy-intolerance-to-fhir.ts must keep the public AllergyIntolerance mapper, clinical references and entered-in-error omission rule while delegating profile, status, substance and reaction helpers to map-allergy-intolerance-codings.ts."
    );
  }
}

for (const forbidden of [
  /const clinicalStatusLabels/,
  /\bAllergyClinicalStatus\b/,
  /\bAllergyVerificationStatus\b/,
  /"http:\/\/terminology\.hl7\.org\/CodeSystem\/allergyintolerance-/
]) {
  if (forbidden.test(mapAllergyIntoleranceToFhirSource)) {
    throw new Error(
      "AllergyIntolerance FHIR profile, status labels and CodeableConcept mapping belong in map-allergy-intolerance-codings.ts, not in the public mapper."
    );
  }
}

for (const required of [
  /export const allergyIntoleranceFhirProfile/,
  /export function toAllergyClinicalStatus/,
  /export function toAllergyVerificationStatus/,
  /export function toAllergyCodeableConcept/,
  /export function toAllergyReaction/,
  /AllergyClinicalStatus/,
  /AllergyVerificationStatus/,
  /AllergyCode/,
  /AllergyReaction/,
  /allergyintolerance-clinical/,
  /allergyintolerance-verification/
]) {
  if (!required.test(mapAllergyIntoleranceCodingsSource)) {
    throw new Error(
      "map-allergy-intolerance-codings.ts must keep AllergyIntolerance FHIR profile, status labels, substance CodeableConcept and reaction manifestation mapping."
    );
  }
}

for (const forbidden of [
  /mapAllergyIntoleranceToFhir/,
  /resourceType:\s*"AllergyIntolerance"/,
  /patientId/,
  /encounterId/,
  /recorderPractitionerId/,
  /recordedAt/,
  /note/
]) {
  if (forbidden.test(mapAllergyIntoleranceCodingsSource)) {
    throw new Error(
      "map-allergy-intolerance-codings.ts must stay a coding helper and must not own AllergyIntolerance resource orchestration or clinical references."
    );
  }
}

for (const forbidden of [
  /export type EncounterClass/,
  /export type EncounterSnapshot/,
  /const encounterClasses/,
  /function normalizeRequired/,
  /function validateLifecycle/
]) {
  if (forbidden.test(encounterAggregateSource)) {
    throw new Error(
      "Encounter aggregate must keep creation/lifecycle behavior only; types stay in encounter.types.ts and class/status/timeline guards stay in encounter.validation.ts."
    );
  }
}

for (const required of [
  /export type EncounterClass/,
  /export type EncounterStatus/,
  /export type EncounterSnapshot/,
  /export type CreateEncounterInput/,
  /export const encounterClasses/,
  /export const encounterStatuses/
]) {
  if (!required.test(encounterTypesSource)) {
    throw new Error(
      "encounter.types.ts must keep Encounter class, status, snapshot, command input and code-set definitions."
    );
  }
}

if (!/from "\.\/encounter\.types\.js"/.test(encounterAggregateSource)) {
  throw new Error("Encounter aggregate must depend on encounter.types.ts for shared types.");
}

if (!/from "\.\/encounter\.validation\.js"/.test(encounterAggregateSource)) {
  throw new Error(
    "Encounter aggregate must depend on encounter.validation.ts for class, status and timeline guards."
  );
}

for (const required of [
  /export function normalizeClass/,
  /export function normalizeStatus/,
  /export function validateLifecycle/,
  /export function validatePersistenceTimeline/,
  /from "\.\/encounter\.types\.js"/
]) {
  if (!required.test(encounterValidationSource)) {
    throw new Error(
      "encounter.validation.ts must keep Encounter class, status and timeline guards."
    );
  }
}

for (const forbidden of [
  /export type ConsentStatus/,
  /export type ConsentSnapshot/,
  /const consentStatuses/,
  /function normalizeRequired/,
  /function assertValidPeriod/,
  /\bassertPersistenceTimeline\b/,
  /\bassertValidStatus\b/,
  /\bassertValidCategory\b/,
  /\bassertValidPeriod\b/,
  /\bparseDate\b/
]) {
  if (forbidden.test(consentAggregateSource)) {
    throw new Error(
      "Consent aggregate must keep revoke/authorization behavior only; grant/rehydrate normalization stays in consent.factory.ts, types stay in consent.types.ts and period/status/category guards stay in consent.validation.ts."
    );
  }
}

for (const required of [
  /export type ConsentStatus/,
  /export type ConsentCategory/,
  /export type ConsentSnapshot/,
  /export type CreateConsentInput/,
  /export type RevokeConsentInput/,
  /export const consentStatuses/,
  /export const consentCategories/
]) {
  if (!required.test(consentTypesSource)) {
    throw new Error(
      "consent.types.ts must keep Consent status, category, snapshot, command input and code-set definitions."
    );
  }
}

if (!/from "\.\/consent\.types\.js"/.test(consentAggregateSource)) {
  throw new Error("Consent aggregate must depend on consent.types.ts for shared types.");
}

if (!/from "\.\/consent\.validation\.js"/.test(consentAggregateSource)) {
  throw new Error(
    "Consent aggregate must depend on consent.validation.ts for period, revocation, status and category guards."
  );
}

if (!/from "\.\/consent\.factory\.js"/.test(consentAggregateSource)) {
  throw new Error("Consent aggregate must delegate grant and rehydrate normalization to consent.factory.ts.");
}

for (const required of [
  /export function buildConsentSnapshot/,
  /export function normalizePersistedConsentSnapshot/,
  /export type ConsentProps/,
  /from "\.\/consent\.types\.js"/,
  /from "\.\/consent\.validation\.js"/
]) {
  if (!required.test(consentFactorySource)) {
    throw new Error(
      "consent.factory.ts must keep Consent grant, persisted snapshot normalization and mutable props construction."
    );
  }
}

for (const forbidden of [
  /class Consent/,
  /\ballowsRecordSharing\b/,
  /\brevoke\(/
]) {
  if (forbidden.test(consentFactorySource)) {
    throw new Error(
      "consent.factory.ts must not own Consent aggregate behavior such as revoke or authorization."
    );
  }
}

for (const required of [
  /export function assertValidPeriod/,
  /export function assertRevocationWithinPeriod/,
  /export function assertValidStatus/,
  /export function assertValidCategory/,
  /from "\.\/consent\.types\.js"/
]) {
  if (!required.test(consentValidationSource)) {
    throw new Error(
      "consent.validation.ts must keep Consent period, revocation, status and category guards."
    );
  }
}

for (const required of [
  /export function mapAuditEventToFhir/,
  /export function mapAuditEventsToFhirBundle/,
  /from "\.\/map-audit-event-labels\.js"/,
  /from "\.\/map-audit-event-details\.js"/,
  /from "\.\/map-audit-event-outcome\.js"/,
  /from "\.\/map-audit-event-references\.js"/
]) {
  if (!required.test(mapAuditEventToFhirSource)) {
    throw new Error(
      "map-audit-event-to-fhir.ts must keep only public AuditEvent mapper orchestration and delegate labels/details/outcome/references to dedicated modules."
    );
  }
}

for (const forbidden of [
  /const auditActionLabels/,
  /"patient\.merge"/,
  /"record-transfer\.acknowledgement-callback"/
]) {
  if (forbidden.test(mapAuditEventToFhirSource)) {
    throw new Error(
      "AuditEvent action labels belong in map-audit-event-labels.ts, not in the public FHIR mapper."
    );
  }
}

for (const required of [
  /export const auditActionLabels/,
  /Record<AuditAction, string>/,
  /"audit-event\.integrity-verify"/
]) {
  if (!required.test(mapAuditEventLabelsSource)) {
    throw new Error(
      "map-audit-event-labels.ts must keep the complete AuditEvent action label catalog."
    );
  }
}

for (const forbidden of [
  /FhirAuditEvent/,
  /FhirBundle/,
  /resourceType/,
  /mapAuditEventToFhir/
]) {
  if (forbidden.test(mapAuditEventLabelsSource)) {
    throw new Error(
      "map-audit-event-labels.ts must stay a label catalog and must not own FHIR resource mapping."
    );
  }
}

for (const [source, required, fileName] of [
  [mapAuditEventDetailsSource, /export function buildEntityDetails/, "map-audit-event-details.ts"],
  [mapAuditEventOutcomeSource, /export function mapAuditAction/, "map-audit-event-outcome.ts"],
  [mapAuditEventReferencesSource, /export function buildAuditAgentReference/, "map-audit-event-references.ts"]
]) {
  if (!required.test(source)) {
    throw new Error(`${fileName} must retain its AuditEvent mapper helper export.`);
  }
}

for (const required of [
  /export function buildWiiiCareCapabilityStatement/,
  /from "\.\/capability-statement-resources\.js"/,
  /supportedCapabilityStatementResources\.map/,
  /defaultCapabilityStatementResourceInteractions/,
  /resourceType:\s*"CapabilityStatement"/
]) {
  if (!required.test(buildCapabilityStatementSource)) {
    throw new Error(
      "build-capability-statement.ts must keep the public CapabilityStatement builder and delegate supported resource metadata to capability-statement-resources.ts."
    );
  }
}

for (const forbidden of [
  /type SupportedFhirResource/,
  /const supportedResources/,
  /type:\s*"DocumentReference"/,
  /type:\s*"MedicationAdministration"/,
  /type:\s*"AuditEvent"/
]) {
  if (forbidden.test(buildCapabilityStatementSource)) {
    throw new Error(
      "CapabilityStatement supported resource catalog belongs in capability-statement-resources.ts, not in the public builder."
    );
  }
}

for (const required of [
  /export type SupportedCapabilityStatementResource/,
  /export const defaultCapabilityStatementResourceInteractions/,
  /export const supportedCapabilityStatementResources/,
  /type:\s*"DocumentReference"/,
  /type:\s*"Task"/,
  /type:\s*"AuditEvent"/,
  /from "\.\/fhir-types\.js"/
]) {
  if (!required.test(capabilityStatementResourcesSource)) {
    throw new Error(
      "capability-statement-resources.ts must keep the FHIR CapabilityStatement supported resource catalog and default interactions."
    );
  }
}

for (const forbidden of [
  /buildWiiiCareCapabilityStatement/,
  /resourceType:\s*"CapabilityStatement"/,
  /kind:\s*"instance"/,
  /implementation:/
]) {
  if (forbidden.test(capabilityStatementResourcesSource)) {
    throw new Error(
      "capability-statement-resources.ts must stay a resource catalog and must not build CapabilityStatement instances."
    );
  }
}

for (const required of [
  /export function mapPatientRecordToFhirBundle/,
  /export type \{ PatientRecordBundleInput \} from "\.\/patient-record-bundle-resources\.js"/,
  /buildPatientRecordBundleResources/,
  /toPatientRecordBundleEntry/,
  /resourceType:\s*"Bundle"/
]) {
  if (!required.test(mapPatientRecordToFhirBundleSource)) {
    throw new Error(
      "map-patient-record-to-fhir-bundle.ts must keep only the public collection Bundle envelope and delegate resource collection to patient-record-bundle-resources.ts."
    );
  }
}

for (const forbidden of [
  /mapAllergyIntoleranceToFhir/,
  /mapProviderDirectoryToFhirResources/,
  /function toBundleEntry/,
  /FhirMedicationAdministration/,
  /FhirDocumentReference/
]) {
  if (forbidden.test(mapPatientRecordToFhirBundleSource)) {
    throw new Error(
      "Patient-record resource mapping and entry union belong in patient-record-bundle-resources.ts, not in the public collection Bundle mapper."
    );
  }
}

for (const required of [
  /export type PatientRecordBundleInput/,
  /export type PatientRecordBundleResource/,
  /export function buildPatientRecordBundleResources/,
  /export function toPatientRecordBundleEntry/,
  /mapProviderDirectoryToFhirResources/,
  /mapClinicalDocumentToFhir/,
  /mapMedicationAdministrationToFhir/
]) {
  if (!required.test(patientRecordBundleResourcesSource)) {
    throw new Error(
      "patient-record-bundle-resources.ts must keep PatientRecord Bundle input, resource collection and FHIR entry mapping."
    );
  }
}

for (const forbidden of [
  /resourceType:\s*"Bundle"/,
  /patient-record-/,
  /mapPatientRecordToFhirBundle/
]) {
  if (forbidden.test(patientRecordBundleResourcesSource)) {
    throw new Error(
      "patient-record-bundle-resources.ts must stay a resource/entry helper and must not build patient-record Bundle envelopes."
    );
  }
}

for (const required of [
  /export function mapPatientRecordToFhirDocumentBundle/,
  /mapPatientRecordToFhirBundle/,
  /function buildComposition/,
  /buildPatientRecordDocumentSections/,
  /from "\.\/patient-record-document-sections\.js"/,
  /resourceType:\s*"Bundle"/
]) {
  if (!required.test(mapPatientRecordToFhirDocumentBundleSource)) {
    throw new Error(
      "map-patient-record-to-fhir-document-bundle.ts must keep the document Bundle envelope, Composition and sections."
    );
  }
}

for (const forbidden of [
  /mapMedicationAdministrationToFhir/,
  /mapProviderDirectoryToFhirResources/,
  /function buildSection/,
  /function escapeXml/,
  /"DocumentReference"/
]) {
  if (forbidden.test(mapPatientRecordToFhirDocumentBundleSource)) {
    throw new Error(
      "Document Bundle mapper must reuse the collection Bundle instead of remapping patient-record resources directly."
    );
  }
}

for (const required of [
  /type PatientRecordDocumentSectionDefinition/,
  /const patientRecordDocumentSectionDefinitions/,
  /export function buildPatientRecordDocumentSections/,
  /function buildPatientRecordDocumentSection/,
  /function escapeXml/,
  /"DocumentReference"/,
  /"MedicationAdministration"/
]) {
  if (!required.test(patientRecordDocumentSectionsSource)) {
    throw new Error(
      "patient-record-document-sections.ts must keep the Composition section catalog, resource filtering and generated XHTML narrative helper."
    );
  }
}

for (const forbidden of [
  /mapPatientRecordToFhirDocumentBundle/,
  /resourceType:\s*"Bundle"/,
  /resourceType:\s*"Composition"/,
  /mapPatientRecordToFhirBundle/
]) {
  if (forbidden.test(patientRecordDocumentSectionsSource)) {
    throw new Error(
      "patient-record-document-sections.ts must stay a Composition section helper and must not build Bundle or Composition envelopes."
    );
  }
}

for (const required of [
  /export function mapConsentToFhir/,
  /from "\.\/map-consent-codings\.js"/,
  /buildConsentIdentifier/,
  /buildConsentScope/,
  /buildConsentCategory/,
  /buildConsentProvision/,
  /mapConsentStatus/,
  /function buildRevocationExtension/,
  /resourceType:\s*"Consent"/
]) {
  if (!required.test(mapConsentToFhirSource)) {
    throw new Error(
      "map-consent-to-fhir.ts must keep the public Consent resource mapper, references and revocation extension while delegating coding/provision helpers to map-consent-codings.ts."
    );
  }
}

for (const forbidden of [
  /const consentCategoryLabels/,
  /function mapConsentStatus/,
  /"http:\/\/terminology\.hl7\.org\/CodeSystem\/consentscope"/,
  /"urn:wiiicare:nexus:consent-category"/,
  /"http:\/\/terminology\.hl7\.org\/CodeSystem\/consentaction"/,
  /"TREAT"/
]) {
  if (forbidden.test(mapConsentToFhirSource)) {
    throw new Error(
      "Consent FHIR status, category, scope, action, purpose and provision coding belong in map-consent-codings.ts, not in the public mapper."
    );
  }
}

for (const required of [
  /export const consentFhirProfile/,
  /export const consentIdentifierSystem/,
  /export function buildConsentIdentifier/,
  /export function mapConsentStatus/,
  /export function buildConsentScope/,
  /export function buildConsentCategory/,
  /export function buildConsentProvision/,
  /ConsentSnapshot/,
  /ConsentStatus/,
  /ConsentCategory/,
  /"patient-privacy"/,
  /"disclose"/,
  /"TREAT"/,
  /"DocumentReference"/
]) {
  if (!required.test(mapConsentCodingsSource)) {
    throw new Error(
      "map-consent-codings.ts must keep Consent FHIR profile, identifier, status, scope, category, provision action, purpose and class mapping."
    );
  }
}

for (const forbidden of [
  /mapConsentToFhir/,
  /buildRevocationExtension/,
  /resourceType:\s*"Consent"/,
  /revokedByActorId/
]) {
  if (forbidden.test(mapConsentCodingsSource)) {
    throw new Error(
      "map-consent-codings.ts must stay a coding/provision helper and must not own Consent resource orchestration or revocation extension mapping."
    );
  }
}

for (const required of [
  /export function mapServiceRequestToFhir/,
  /from "\.\/map-service-request-codings\.js"/,
  /serviceRequestFhirProfile/,
  /buildServiceRequestCategory/,
  /toServiceRequestCodeableConcept/,
  /resourceType:\s*"ServiceRequest"/
]) {
  if (!required.test(mapServiceRequestToFhirSource)) {
    throw new Error(
      "map-service-request-to-fhir.ts must keep the public ServiceRequest resource mapper and clinical references while delegating profile, SNOMED category and CodeableConcept helpers to map-service-request-codings.ts."
    );
  }
}

for (const forbidden of [
  /const categoryCodings/,
  /\bServiceRequestCategory\b/,
  /Record<ServiceRequestCategory/,
  /"http:\/\/snomed\.info\/sct"/,
  /categoryCoding/
]) {
  if (forbidden.test(mapServiceRequestToFhirSource)) {
    throw new Error(
      "ServiceRequest FHIR SNOMED category and CodeableConcept mapping belong in map-service-request-codings.ts, not in the public mapper."
    );
  }
}

for (const required of [
  /export const serviceRequestFhirProfile/,
  /export function buildServiceRequestCategory/,
  /export function toServiceRequestCodeableConcept/,
  /ServiceRequestCategory/,
  /ServiceRequestCode/,
  /snomed\.info\/sct/,
  /\blaboratory:/,
  /\bimaging:/,
  /\btherapy:/
]) {
  if (!required.test(mapServiceRequestCodingsSource)) {
    throw new Error(
      "map-service-request-codings.ts must keep ServiceRequest FHIR profile, SNOMED category catalog and CodeableConcept mapping."
    );
  }
}

for (const forbidden of [
  /mapServiceRequestToFhir/,
  /resourceType:\s*"ServiceRequest"/,
  /patientId/,
  /encounterId/,
  /requesterPractitionerId/,
  /performerOrganizationId/,
  /reasonConditionId/,
  /authoredOn/,
  /occurrenceAt/
]) {
  if (forbidden.test(mapServiceRequestCodingsSource)) {
    throw new Error(
      "map-service-request-codings.ts must stay a coding helper and must not own ServiceRequest resource orchestration or clinical references."
    );
  }
}

for (const required of [
  /export function mapWorkflowTaskToFhir/,
  /from "\.\/map-workflow-task-codings\.js"/,
  /workflowTaskFhirProfile/,
  /buildWorkflowTaskIdentifier/,
  /buildWorkflowTaskBusinessStatus/,
  /buildWorkflowTaskCode/,
  /mapWorkflowTaskOwner/,
  /toWorkflowTaskInput/,
  /toWorkflowTaskOutput/,
  /resourceType:\s*"Task"/
]) {
  if (!required.test(mapWorkflowTaskToFhirSource)) {
    throw new Error(
      "map-workflow-task-to-fhir.ts must keep the public WorkflowTask Task resource mapper and clinical references while delegating profile, identifier, businessStatus, code, owner and IO item helpers to map-workflow-task-codings.ts."
    );
  }
}

for (const forbidden of [
  /const taskBusinessStatusSystem/,
  /function mapOwner/,
  /function toFhirReference/,
  /WorkflowTaskReference/,
  /"urn:wiiicare:nexus:task-business-status"/,
  /"urn:wiiicare:nexus:workflow-task"/
]) {
  if (forbidden.test(mapWorkflowTaskToFhirSource)) {
    throw new Error(
      "WorkflowTask FHIR profile, identifier, businessStatus, code, owner and IO item mapping belong in map-workflow-task-codings.ts, not in the public mapper."
    );
  }
}

for (const required of [
  /export const workflowTaskFhirProfile/,
  /export const workflowTaskIdentifierSystem/,
  /export function buildWorkflowTaskIdentifier/,
  /export function buildWorkflowTaskBusinessStatus/,
  /export function buildWorkflowTaskCode/,
  /export function mapWorkflowTaskOwner/,
  /export function toWorkflowTaskInput/,
  /export function toWorkflowTaskOutput/,
  /export function toWorkflowTaskReference/,
  /WorkflowTaskBusinessStatus/,
  /WorkflowTaskCode/,
  /WorkflowTaskReference/,
  /task-business-status/,
  /workflow-task/
]) {
  if (!required.test(mapWorkflowTaskCodingsSource)) {
    throw new Error(
      "map-workflow-task-codings.ts must keep WorkflowTask FHIR profile, identifier, businessStatus, code, owner and IO item mapping."
    );
  }
}

for (const forbidden of [
  /mapWorkflowTaskToFhir/,
  /resourceType:\s*"Task"/,
  /patientId/,
  /encounterId/,
  /basedOnServiceRequestId/,
  /requesterPractitionerId/,
  /authoredOn/,
  /lastModified/,
  /executionPeriod/
]) {
  if (forbidden.test(mapWorkflowTaskCodingsSource)) {
    throw new Error(
      "map-workflow-task-codings.ts must stay a coding/owner/IO helper and must not own WorkflowTask resource orchestration or clinical references."
    );
  }
}

for (const required of [
  /export function mapProcedureToFhir/,
  /from "\.\/map-procedure-codings\.js"/,
  /buildProcedureIdentifier/,
  /buildProcedureCategory/,
  /toProcedureCodeableConcept/,
  /toFhirProcedurePerformer/,
  /resourceType:\s*"Procedure"/
]) {
  if (!required.test(mapProcedureToFhirSource)) {
    throw new Error(
      "map-procedure-to-fhir.ts must keep the public Procedure resource mapper and references while delegating identifier, category, CodeableConcept and performer helpers to map-procedure-codings.ts."
    );
  }
}

for (const forbidden of [
  /const procedureCategorySystem/,
  /function toCodeableConcept/,
  /function toFhirPerformer/,
  /function formatProcedureCategory/,
  /Record<ProcedureCategory, string>/,
  /"urn:wiiicare:nexus:procedure-category"/
]) {
  if (forbidden.test(mapProcedureToFhirSource)) {
    throw new Error(
      "Procedure FHIR category labels, CodeableConcept conversion and performer mapping belong in map-procedure-codings.ts, not in the public mapper."
    );
  }
}

for (const required of [
  /export const procedureFhirProfile/,
  /export const procedureIdentifierSystem/,
  /export function buildProcedureIdentifier/,
  /export function buildProcedureCategory/,
  /export function toProcedureCodeableConcept/,
  /export function toFhirProcedurePerformer/,
  /export function formatProcedureCategory/,
  /ProcedureCategory/,
  /ProcedureCoding/,
  /ProcedurePerformer/,
  /\bsurgical:/,
  /\brehabilitation:/
]) {
  if (!required.test(mapProcedureCodingsSource)) {
    throw new Error(
      "map-procedure-codings.ts must keep Procedure FHIR profile, identifier, category labels, CodeableConcept and performer mapping."
    );
  }
}

for (const forbidden of [
  /mapProcedureToFhir/,
  /resourceType:\s*"Procedure"/,
  /basedOnServiceRequestId/,
  /reasonConditionId/,
  /reportReferences/
]) {
  if (forbidden.test(mapProcedureCodingsSource)) {
    throw new Error(
      "map-procedure-codings.ts must stay a coding/performer helper and must not own Procedure resource orchestration or clinical references."
    );
  }
}

for (const required of [
  /export function mapDiagnosticReportToFhir/,
  /from "\.\/map-diagnostic-report-codings\.js"/,
  /diagnosticReportFhirProfile/,
  /toDiagnosticReportCategory/,
  /toDiagnosticReportCodeableConcept/,
  /resourceType:\s*"DiagnosticReport"/,
  /basedOnServiceRequestId/,
  /resultObservationIds/,
  /presentedFormUrl/
]) {
  if (!required.test(mapDiagnosticReportToFhirSource)) {
    throw new Error(
      "map-diagnostic-report-to-fhir.ts must keep the public DiagnosticReport mapper, workflow references, result references and presented form while delegating profile, category and CodeableConcept helpers to map-diagnostic-report-codings.ts."
    );
  }
}

for (const forbidden of [
  /const categoryCodings/,
  /\bDiagnosticReportCategory\b/,
  /\bDiagnosticReportCode\b/,
  /categoryCoding/,
  /"http:\/\/terminology\.hl7\.org\/CodeSystem\/v2-0074"/
]) {
  if (forbidden.test(mapDiagnosticReportToFhirSource)) {
    throw new Error(
      "DiagnosticReport FHIR profile, diagnostic service category and CodeableConcept mapping belong in map-diagnostic-report-codings.ts, not in the public mapper."
    );
  }
}

for (const required of [
  /export const diagnosticReportFhirProfile/,
  /export function toDiagnosticReportCategory/,
  /export function toDiagnosticReportCodeableConcept/,
  /DiagnosticReportCategory/,
  /DiagnosticReportCode/,
  /v2-0074/,
  /\bLAB\b/,
  /\bRAD\b/,
  /\bPAT\b/
]) {
  if (!required.test(mapDiagnosticReportCodingsSource)) {
    throw new Error(
      "map-diagnostic-report-codings.ts must keep DiagnosticReport FHIR profile, diagnostic service category catalog and CodeableConcept mapping."
    );
  }
}

for (const forbidden of [
  /mapDiagnosticReportToFhir/,
  /resourceType:\s*"DiagnosticReport"/,
  /patientId/,
  /encounterId/,
  /basedOnServiceRequestId/,
  /resultObservationIds/,
  /presentedFormUrl/,
  /performerOrganizationId/,
  /resultsInterpreterPractitionerId/,
  /effectiveAt/,
  /issuedAt/
]) {
  if (forbidden.test(mapDiagnosticReportCodingsSource)) {
    throw new Error(
      "map-diagnostic-report-codings.ts must stay a coding helper and must not own DiagnosticReport resource orchestration, workflow references or presented form mapping."
    );
  }
}

for (const forbidden of [
  /export type FhirPatient/,
  /export type FhirBundle/,
  /AdministrativeGender/
]) {
  if (forbidden.test(fhirTypesSource)) {
    throw new Error(
      "fhir-types.ts must remain a compatibility barrel; concrete FHIR resource declarations belong in focused fhir-*.types.ts modules."
    );
  }
}

for (const required of [
  /export \* from "\.\/fhir-shared\.types\.js"/,
  /export \* from "\.\/fhir-provider\.types\.js"/,
  /export \* from "\.\/fhir-clinical\.types\.js"/,
  /export \* from "\.\/fhir-bundle\.types\.js"/
]) {
  if (!required.test(fhirTypesSource)) {
    throw new Error("fhir-types.ts must re-export all focused FHIR type modules.");
  }
}

for (const forbidden of [/export type FhirMedicationRequest/, /export type FhirEncounter/]) {
  if (forbidden.test(fhirClinicalBarrelSource)) {
    throw new Error(
      "fhir-clinical.types.ts must remain a compatibility barrel; concrete clinical resource types belong in focused clinical submodules."
    );
  }
}

for (const forbidden of [
  /export type FhirEncounter/,
  /export type FhirCondition/,
  /export type FhirObservation/,
  /export type FhirAllergyIntolerance/
]) {
  if (forbidden.test(fhirClinicalCoreTypesSource)) {
    throw new Error(
      "fhir-clinical-core.types.ts must remain a compatibility barrel; concrete clinical core resource types belong in focused clinical submodules."
    );
  }
}

for (const required of [
  /export \* from "\.\/fhir-encounter\.types\.js"/,
  /export \* from "\.\/fhir-condition\.types\.js"/,
  /export \* from "\.\/fhir-observation\.types\.js"/,
  /export \* from "\.\/fhir-allergy-intolerance\.types\.js"/
]) {
  if (!required.test(fhirClinicalCoreTypesSource)) {
    throw new Error("fhir-clinical-core.types.ts must re-export all focused FHIR clinical core type modules.");
  }
}

for (const forbidden of [
  /export type FhirMedicationRequest/,
  /export type FhirMedicationDispense/,
  /export type FhirMedicationAdministration/
]) {
  if (forbidden.test(fhirMedicationTypesSource)) {
    throw new Error(
      "fhir-medication.types.ts must remain a compatibility barrel; concrete medication resource types belong in focused medication submodules."
    );
  }
}

for (const required of [
  /export \* from "\.\/fhir-medication-request\.types\.js"/,
  /export \* from "\.\/fhir-medication-dispense\.types\.js"/,
  /export \* from "\.\/fhir-medication-administration\.types\.js"/
]) {
  if (!required.test(fhirMedicationTypesSource)) {
    throw new Error("fhir-medication.types.ts must re-export all focused FHIR medication type modules.");
  }
}

for (const required of [
  /export function mapMedicationRequestToFhir/,
  /from "\.\/map-medication-request-codings\.js"/,
  /medicationRequestFhirProfile/,
  /buildMedicationRequestCategory/,
  /toMedicationRequestCodeableConcept/,
  /toMedicationRequestDosageInstruction/,
  /buildMedicationRequestDispenseRequest/,
  /resourceType:\s*"MedicationRequest"/
]) {
  if (!required.test(mapMedicationRequestToFhirSource)) {
    throw new Error(
      "map-medication-request-to-fhir.ts must keep the public MedicationRequest resource mapper and clinical references while delegating category, CodeableConcept, dosage and dispenseRequest helpers to map-medication-request-codings.ts."
    );
  }
}

for (const forbidden of [
  /const categoryLabels/,
  /Record<MedicationRequestCategory, string>/,
  /"http:\/\/terminology\.hl7\.org\/CodeSystem\/medicationrequest-category"/,
  /"http:\/\/unitsofmeasure\.org"/,
  /expectedSupplyDuration:\s*{/,
  /doseAndRate:/
]) {
  if (forbidden.test(mapMedicationRequestToFhirSource)) {
    throw new Error(
      "MedicationRequest FHIR category labels, CodeableConcept conversion, dosage and dispenseRequest mapping belong in map-medication-request-codings.ts, not in the public mapper."
    );
  }
}

for (const required of [
  /export const medicationRequestFhirProfile/,
  /export function buildMedicationRequestCategory/,
  /export function toMedicationRequestCodeableConcept/,
  /export function toMedicationRequestDosageInstruction/,
  /export function buildMedicationRequestDispenseRequest/,
  /export function formatMedicationRequestCategory/,
  /MedicationRequestCategory/,
  /MedicationCode/,
  /DosageInstruction/,
  /\binpatient:/,
  /\bdischarge:/,
  /medicationrequest-category/,
  /unitsofmeasure\.org/
]) {
  if (!required.test(mapMedicationRequestCodingsSource)) {
    throw new Error(
      "map-medication-request-codings.ts must keep MedicationRequest FHIR profile, category labels, CodeableConcept, dosage and dispenseRequest mapping."
    );
  }
}

for (const forbidden of [
  /mapMedicationRequestToFhir/,
  /resourceType:\s*"MedicationRequest"/,
  /patientId/,
  /encounterId/,
  /requesterPractitionerId/,
  /reasonConditionId/,
  /authoredOn/
]) {
  if (forbidden.test(mapMedicationRequestCodingsSource)) {
    throw new Error(
      "map-medication-request-codings.ts must stay a coding/dosage/supply helper and must not own MedicationRequest resource orchestration or clinical references."
    );
  }
}

for (const required of [
  /export function mapMedicationDispenseToFhir/,
  /from "\.\/map-medication-dispense-codings\.js"/,
  /buildMedicationDispenseIdentifier/,
  /buildMedicationDispenseCategory/,
  /toMedicationDispenseCodeableConcept/,
  /toMedicationDispenseDosageInstruction/,
  /resourceType:\s*"MedicationDispense"/
]) {
  if (!required.test(mapMedicationDispenseToFhirSource)) {
    throw new Error(
      "map-medication-dispense-to-fhir.ts must keep the public MedicationDispense resource mapper and clinical references while delegating identifier, category, CodeableConcept and dosage helpers to map-medication-dispense-codings.ts."
    );
  }
}

for (const forbidden of [
  /const categorySystem/,
  /function toCodeableConcept/,
  /function formatMedicationDispenseCategory/,
  /Record<MedicationDispenseCategory, string>/,
  /"http:\/\/terminology\.hl7\.org\/CodeSystem\/medicationdispense-category"/
]) {
  if (forbidden.test(mapMedicationDispenseToFhirSource)) {
    throw new Error(
      "MedicationDispense FHIR category labels, CodeableConcept conversion and dosage mapping belong in map-medication-dispense-codings.ts, not in the public mapper."
    );
  }
}

for (const required of [
  /export const medicationDispenseFhirProfile/,
  /export const medicationDispenseIdentifierSystem/,
  /export function buildMedicationDispenseIdentifier/,
  /export function buildMedicationDispenseCategory/,
  /export function toMedicationDispenseCodeableConcept/,
  /export function toMedicationDispenseDosageInstruction/,
  /export function formatMedicationDispenseCategory/,
  /MedicationDispenseCategory/,
  /MedicationCode/,
  /DosageInstruction/,
  /\binpatient:/,
  /\boutpatient:/,
  /medicationdispense-category/
]) {
  if (!required.test(mapMedicationDispenseCodingsSource)) {
    throw new Error(
      "map-medication-dispense-codings.ts must keep MedicationDispense FHIR profile, identifier, category labels, CodeableConcept and dosage mapping."
    );
  }
}

for (const forbidden of [
  /mapMedicationDispenseToFhir/,
  /resourceType:\s*"MedicationDispense"/,
  /patientId/,
  /encounterId/,
  /medicationRequestId/,
  /dispenserPractitionerId/,
  /receiverPractitionerId/,
  /destinationLocationId/
]) {
  if (forbidden.test(mapMedicationDispenseCodingsSource)) {
    throw new Error(
      "map-medication-dispense-codings.ts must stay a coding/dosage helper and must not own MedicationDispense resource orchestration or clinical references."
    );
  }
}

for (const required of [
  /export function mapMedicationAdministrationToFhir/,
  /from "\.\/map-medication-administration-codings\.js"/,
  /buildMedicationAdministrationIdentifier/,
  /buildMedicationAdministrationCategory/,
  /toMedicationAdministrationCodeableConcept/,
  /toFhirMedicationAdministrationPerformer/,
  /toMedicationAdministrationDosage/,
  /resourceType:\s*"MedicationAdministration"/
]) {
  if (!required.test(mapMedicationAdministrationToFhirSource)) {
    throw new Error(
      "map-medication-administration-to-fhir.ts must keep the public MedicationAdministration resource mapper and clinical references while delegating identifier, category, CodeableConcept, performer and dosage helpers to map-medication-administration-codings.ts."
    );
  }
}

for (const forbidden of [
  /const categorySystem/,
  /function toCodeableConcept/,
  /function toFhirPerformer/,
  /function formatMedicationAdministrationCategory/,
  /Record<MedicationAdministrationCategory, string>/,
  /"http:\/\/terminology\.hl7\.org\/CodeSystem\/medication-admin-category"/
]) {
  if (forbidden.test(mapMedicationAdministrationToFhirSource)) {
    throw new Error(
      "MedicationAdministration FHIR category labels, CodeableConcept conversion, performer and dosage mapping belong in map-medication-administration-codings.ts, not in the public mapper."
    );
  }
}

for (const required of [
  /export const medicationAdministrationFhirProfile/,
  /export const medicationAdministrationIdentifierSystem/,
  /export function buildMedicationAdministrationIdentifier/,
  /export function buildMedicationAdministrationCategory/,
  /export function toMedicationAdministrationCodeableConcept/,
  /export function toFhirMedicationAdministrationPerformer/,
  /export function toMedicationAdministrationDosage/,
  /export function formatMedicationAdministrationCategory/,
  /MedicationAdministrationCategory/,
  /MedicationAdministrationPerformer/,
  /MedicationAdministrationDosage/,
  /MedicationCode/,
  /patient-specified/,
  /medication-admin-category/
]) {
  if (!required.test(mapMedicationAdministrationCodingsSource)) {
    throw new Error(
      "map-medication-administration-codings.ts must keep MedicationAdministration FHIR profile, identifier, category labels, CodeableConcept, performer and dosage mapping."
    );
  }
}

for (const forbidden of [
  /mapMedicationAdministrationToFhir/,
  /resourceType:\s*"MedicationAdministration"/,
  /patientId/,
  /encounterId/,
  /medicationRequestId/,
  /reasonConditionId/,
  /effectivePeriod/
]) {
  if (forbidden.test(mapMedicationAdministrationCodingsSource)) {
    throw new Error(
      "map-medication-administration-codings.ts must stay a coding/performer/dosage helper and must not own MedicationAdministration resource orchestration or clinical references."
    );
  }
}

for (const forbidden of [
  /export type FhirServiceRequest/,
  /export type FhirTask/,
  /export type FhirProcedure/
]) {
  if (forbidden.test(fhirCareflowTypesSource)) {
    throw new Error(
      "fhir-careflow.types.ts must remain a compatibility barrel; concrete careflow resource types belong in focused careflow submodules."
    );
  }
}

for (const required of [
  /export \* from "\.\/fhir-service-request\.types\.js"/,
  /export \* from "\.\/fhir-task\.types\.js"/,
  /export \* from "\.\/fhir-procedure\.types\.js"/
]) {
  if (!required.test(fhirCareflowTypesSource)) {
    throw new Error("fhir-careflow.types.ts must re-export all focused FHIR careflow type modules.");
  }
}

for (const forbidden of [
  /export type FhirDiagnosticReport/,
  /export type FhirImagingStudy/
]) {
  if (forbidden.test(fhirDiagnosticsTypesSource)) {
    throw new Error(
      "fhir-diagnostics.types.ts must remain a compatibility barrel; concrete diagnostics resource types belong in focused diagnostics submodules."
    );
  }
}

for (const required of [
  /export \* from "\.\/fhir-diagnostic-report\.types\.js"/,
  /export \* from "\.\/fhir-imaging-study\.types\.js"/
]) {
  if (!required.test(fhirDiagnosticsTypesSource)) {
    throw new Error("fhir-diagnostics.types.ts must re-export all focused FHIR diagnostics type modules.");
  }
}

for (const required of [
  /export type FhirIdentifier/,
  /export type FhirContactPoint/
]) {
  if (!required.test(fhirSharedTypesSource)) {
    throw new Error("fhir-shared.types.ts must keep shared FHIR identifier and contact point types.");
  }
}

for (const required of [
  [fhirProviderTypesSource, /export type FhirOrganization/, "fhir-provider.types.ts"],
  [fhirProviderTypesSource, /export type FhirPractitionerRole/, "fhir-provider.types.ts"],
  [fhirDocumentTypesSource, /export type FhirDocumentReference/, "fhir-document.types.ts"],
  [fhirDocumentTypesSource, /export type FhirComposition/, "fhir-document.types.ts"],
  [fhirPrivacyTypesSource, /export type FhirConsent/, "fhir-privacy.types.ts"],
  [fhirAuditTypesSource, /export type FhirAuditEvent/, "fhir-audit.types.ts"],
  [fhirEncounterTypesSource, /export type FhirEncounter/, "fhir-encounter.types.ts"],
  [fhirConditionTypesSource, /export type FhirCondition/, "fhir-condition.types.ts"],
  [fhirObservationTypesSource, /export type FhirObservation/, "fhir-observation.types.ts"],
  [fhirAllergyIntoleranceTypesSource, /export type FhirAllergyIntolerance/, "fhir-allergy-intolerance.types.ts"],
  [fhirMedicationRequestTypesSource, /export type FhirMedicationRequest/, "fhir-medication-request.types.ts"],
  [fhirMedicationDispenseTypesSource, /export type FhirMedicationDispense/, "fhir-medication-dispense.types.ts"],
  [fhirMedicationAdministrationTypesSource, /export type FhirMedicationAdministration/, "fhir-medication-administration.types.ts"],
  [fhirServiceRequestTypesSource, /export type FhirServiceRequest/, "fhir-service-request.types.ts"],
  [fhirTaskTypesSource, /export type FhirTask/, "fhir-task.types.ts"],
  [fhirProcedureTypesSource, /export type FhirProcedure/, "fhir-procedure.types.ts"],
  [fhirDiagnosticReportTypesSource, /export type FhirDiagnosticReport/, "fhir-diagnostic-report.types.ts"],
  [fhirImagingStudyTypesSource, /export type FhirImagingStudy/, "fhir-imaging-study.types.ts"],
  [fhirPatientTypesSource, /export type FhirPatient/, "fhir-patient.types.ts"],
  [fhirOperationOutcomeTypesSource, /export type FhirOperationOutcome/, "fhir-operation-outcome.types.ts"],
  [fhirCapabilityStatementTypesSource, /export type FhirCapabilityStatement/, "fhir-capability-statement.types.ts"],
  [fhirBundleTypesSource, /export type FhirBundleEntry/, "fhir-bundle.types.ts"],
  [fhirBundleTypesSource, /export type FhirBundle/, "fhir-bundle.types.ts"]
]) {
  const [source, pattern, moduleName] = required;
  if (!pattern.test(source)) {
    throw new Error(`${moduleName} is missing its required focused FHIR type declaration.`);
  }
}

console.log(
  JSON.stringify(
    {
      status: "ok",
      check: "Domain composition budget",
      domainReports
    },
    null,
    2
  )
);

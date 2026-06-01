import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";

const domainBudgets = [
  {
    path: "packages/domain/src/record-transfer/record-transfer.ts",
    maxLines: 480,
    role: "RecordTransfer aggregate behavior"
  },
  {
    path: "packages/domain/src/record-transfer/record-transfer.validation.ts",
    maxLines: 230,
    role: "RecordTransfer normalization and snapshot invariant guards"
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
    maxLines: 440,
    role: "ProviderDirectory normalization, reference validation and snapshot cloning"
  },
  {
    path: "packages/domain/src/provider-directory/provider-directory.types.ts",
    maxLines: 190,
    role: "ProviderDirectory snapshot, coding, telecom and endpoint type definitions"
  },
  {
    path: "packages/domain/src/audit-event/audit-event.ts",
    maxLines: 270,
    role: "AuditEvent aggregate, sealing and integrity verification behavior"
  },
  {
    path: "packages/domain/src/audit-event/audit-event.validation.ts",
    maxLines: 180,
    role: "AuditEvent canonical hashing, normalization and seal metadata guards"
  },
  {
    path: "packages/domain/src/audit-event/audit-event.types.ts",
    maxLines: 300,
    role: "AuditEvent action, resource, snapshot and integrity report types"
  },
  {
    path: "packages/domain/src/access-control/access-control.ts",
    maxLines: 240,
    role: "AccessControl authorization decisions and patient organization scoping"
  },
  {
    path: "packages/domain/src/access-control/access-control.policy.ts",
    maxLines: 340,
    role: "AccessControl role, purpose and permission catalog"
  },
  {
    path: "packages/domain/src/patient/patient.ts",
    maxLines: 310,
    role: "Patient aggregate registration, demographic update and merge behavior"
  },
  {
    path: "packages/domain/src/patient/patient.validation.ts",
    maxLines: 190,
    role: "Patient identifier, FHIR birth date, merge state and timeline guards"
  },
  {
    path: "packages/domain/src/patient/patient.types.ts",
    maxLines: 90,
    role: "Patient identifier, snapshot and registration input types"
  },
  {
    path: "packages/domain/src/workflow-task/workflow-task.ts",
    maxLines: 340,
    role: "WorkflowTask aggregate lifecycle and reference normalization behavior"
  },
  {
    path: "packages/domain/src/workflow-task/workflow-task.types.ts",
    maxLines: 160,
    role: "WorkflowTask status, intent, priority, reference and snapshot types"
  },
  {
    path: "packages/domain/src/procedure/procedure.ts",
    maxLines: 330,
    role: "Procedure aggregate lifecycle, performer and report reference behavior"
  },
  {
    path: "packages/domain/src/procedure/procedure.types.ts",
    maxLines: 130,
    role: "Procedure status, category, performer, report reference and snapshot types"
  },
  {
    path: "packages/domain/src/record-transfer-delivery-attempt/record-transfer-delivery-attempt.ts",
    maxLines: 230,
    role: "RecordTransferDeliveryAttempt queue and terminal update behavior"
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
    maxLines: 290,
    role: "MedicationRequest prescribing and dosage validation behavior"
  },
  {
    path: "packages/domain/src/medication-request/medication-request.types.ts",
    maxLines: 130,
    role: "MedicationRequest status, intent, priority, dosage and snapshot types"
  },
  {
    path: "packages/domain/src/medication-dispense/medication-dispense.ts",
    maxLines: 330,
    role: "MedicationDispense dispensing lifecycle and quantity validation behavior"
  },
  {
    path: "packages/domain/src/medication-dispense/medication-dispense.types.ts",
    maxLines: 90,
    role: "MedicationDispense status, category, snapshot and command input types"
  },
  {
    path: "packages/domain/src/medication-administration/medication-administration.ts",
    maxLines: 300,
    role: "MedicationAdministration administration lifecycle and dosage validation behavior"
  },
  {
    path: "packages/domain/src/medication-administration/medication-administration.types.ts",
    maxLines: 120,
    role: "MedicationAdministration status, category, performer, dosage and snapshot types"
  },
  {
    path: "packages/domain/src/service-request/service-request.ts",
    maxLines: 240,
    role: "ServiceRequest ordering and scheduling validation behavior"
  },
  {
    path: "packages/domain/src/service-request/service-request.types.ts",
    maxLines: 120,
    role: "ServiceRequest status, intent, category, priority and snapshot types"
  },
  {
    path: "packages/domain/src/imaging-study/imaging-study.ts",
    maxLines: 300,
    role: "ImagingStudy DICOM UID, series count and timeline validation behavior"
  },
  {
    path: "packages/domain/src/imaging-study/imaging-study.types.ts",
    maxLines: 90,
    role: "ImagingStudy status, coding, series, snapshot and command input types"
  },
  {
    path: "packages/domain/src/clinical-document/clinical-document.ts",
    maxLines: 210,
    role: "ClinicalDocument signing, attachment validation and timeline behavior"
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
    maxLines: 210,
    role: "Observation recording, value and timeline validation behavior"
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
    maxLines: 240,
    role: "AllergyIntolerance recording, reaction and timeline validation behavior"
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
    maxLines: 190,
    role: "Consent grant, revoke and record-sharing authorization behavior"
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
    maxLines: 240,
    role: "FHIR encounter, condition, observation and allergy resource types"
  },
  {
    path: "packages/domain/src/fhir/fhir-medication.types.ts",
    maxLines: 330,
    role: "FHIR medication request, dispense and administration resource types"
  },
  {
    path: "packages/domain/src/fhir/fhir-careflow.types.ts",
    maxLines: 310,
    role: "FHIR service request, task and procedure resource types"
  },
  {
    path: "packages/domain/src/fhir/fhir-diagnostics.types.ts",
    maxLines: 150,
    role: "FHIR diagnostic report and imaging study resource types"
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
    path: "packages/domain/src/fhir/fhir-bundle.types.ts",
    maxLines: 90,
    role: "FHIR Bundle entry and bundle resource types"
  }
];

const recordTransferAggregatePath = resolve(
  "packages/domain/src/record-transfer/record-transfer.ts"
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
const providerDirectoryTypesPath = resolve(
  "packages/domain/src/provider-directory/provider-directory.types.ts"
);
const auditEventAggregatePath = resolve("packages/domain/src/audit-event/audit-event.ts");
const auditEventValidationPath = resolve(
  "packages/domain/src/audit-event/audit-event.validation.ts"
);
const auditEventTypesPath = resolve("packages/domain/src/audit-event/audit-event.types.ts");
const accessControlBehaviorPath = resolve(
  "packages/domain/src/access-control/access-control.ts"
);
const accessControlPolicyPath = resolve(
  "packages/domain/src/access-control/access-control.policy.ts"
);
const patientAggregatePath = resolve("packages/domain/src/patient/patient.ts");
const patientValidationPath = resolve("packages/domain/src/patient/patient.validation.ts");
const patientTypesPath = resolve("packages/domain/src/patient/patient.types.ts");
const workflowTaskAggregatePath = resolve(
  "packages/domain/src/workflow-task/workflow-task.ts"
);
const workflowTaskTypesPath = resolve(
  "packages/domain/src/workflow-task/workflow-task.types.ts"
);
const procedureAggregatePath = resolve("packages/domain/src/procedure/procedure.ts");
const procedureTypesPath = resolve("packages/domain/src/procedure/procedure.types.ts");
const deliveryAttemptAggregatePath = resolve(
  "packages/domain/src/record-transfer-delivery-attempt/record-transfer-delivery-attempt.ts"
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
const medicationRequestTypesPath = resolve(
  "packages/domain/src/medication-request/medication-request.types.ts"
);
const medicationDispenseAggregatePath = resolve(
  "packages/domain/src/medication-dispense/medication-dispense.ts"
);
const medicationDispenseTypesPath = resolve(
  "packages/domain/src/medication-dispense/medication-dispense.types.ts"
);
const medicationAdministrationAggregatePath = resolve(
  "packages/domain/src/medication-administration/medication-administration.ts"
);
const medicationAdministrationTypesPath = resolve(
  "packages/domain/src/medication-administration/medication-administration.types.ts"
);
const serviceRequestAggregatePath = resolve(
  "packages/domain/src/service-request/service-request.ts"
);
const serviceRequestTypesPath = resolve(
  "packages/domain/src/service-request/service-request.types.ts"
);
const imagingStudyAggregatePath = resolve("packages/domain/src/imaging-study/imaging-study.ts");
const imagingStudyTypesPath = resolve("packages/domain/src/imaging-study/imaging-study.types.ts");
const clinicalDocumentAggregatePath = resolve(
  "packages/domain/src/clinical-document/clinical-document.ts"
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
const observationTypesPath = resolve("packages/domain/src/observation/observation.types.ts");
const conditionAggregatePath = resolve("packages/domain/src/condition/condition.ts");
const conditionValidationPath = resolve("packages/domain/src/condition/condition.validation.ts");
const conditionTypesPath = resolve("packages/domain/src/condition/condition.types.ts");
const allergyIntoleranceAggregatePath = resolve(
  "packages/domain/src/allergy-intolerance/allergy-intolerance.ts"
);
const allergyIntoleranceTypesPath = resolve(
  "packages/domain/src/allergy-intolerance/allergy-intolerance.types.ts"
);
const encounterAggregatePath = resolve("packages/domain/src/encounter/encounter.ts");
const encounterValidationPath = resolve("packages/domain/src/encounter/encounter.validation.ts");
const encounterTypesPath = resolve("packages/domain/src/encounter/encounter.types.ts");
const consentAggregatePath = resolve("packages/domain/src/consent/consent.ts");
const consentValidationPath = resolve("packages/domain/src/consent/consent.validation.ts");
const consentTypesPath = resolve("packages/domain/src/consent/consent.types.ts");
const fhirTypesPath = resolve("packages/domain/src/fhir/fhir-types.ts");
const fhirClinicalBarrelPath = resolve("packages/domain/src/fhir/fhir-clinical.types.ts");
const fhirSharedTypesPath = resolve("packages/domain/src/fhir/fhir-shared.types.ts");
const fhirProviderTypesPath = resolve("packages/domain/src/fhir/fhir-provider.types.ts");
const fhirDocumentTypesPath = resolve("packages/domain/src/fhir/fhir-document.types.ts");
const fhirPrivacyTypesPath = resolve("packages/domain/src/fhir/fhir-privacy.types.ts");
const fhirAuditTypesPath = resolve("packages/domain/src/fhir/fhir-audit.types.ts");
const fhirClinicalCoreTypesPath = resolve(
  "packages/domain/src/fhir/fhir-clinical-core.types.ts"
);
const fhirMedicationTypesPath = resolve("packages/domain/src/fhir/fhir-medication.types.ts");
const fhirCareflowTypesPath = resolve("packages/domain/src/fhir/fhir-careflow.types.ts");
const fhirDiagnosticsTypesPath = resolve("packages/domain/src/fhir/fhir-diagnostics.types.ts");
const fhirPatientTypesPath = resolve("packages/domain/src/fhir/fhir-patient.types.ts");
const fhirOperationOutcomeTypesPath = resolve(
  "packages/domain/src/fhir/fhir-operation-outcome.types.ts"
);
const fhirCapabilityStatementTypesPath = resolve(
  "packages/domain/src/fhir/fhir-capability-statement.types.ts"
);
const fhirBundleTypesPath = resolve("packages/domain/src/fhir/fhir-bundle.types.ts");

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
const providerDirectoryTypesSource = await readFile(providerDirectoryTypesPath, "utf8");
const auditEventAggregateSource = await readFile(auditEventAggregatePath, "utf8");
const auditEventValidationSource = await readFile(auditEventValidationPath, "utf8");
const auditEventTypesSource = await readFile(auditEventTypesPath, "utf8");
const accessControlBehaviorSource = await readFile(accessControlBehaviorPath, "utf8");
const accessControlPolicySource = await readFile(accessControlPolicyPath, "utf8");
const patientAggregateSource = await readFile(patientAggregatePath, "utf8");
const patientValidationSource = await readFile(patientValidationPath, "utf8");
const patientTypesSource = await readFile(patientTypesPath, "utf8");
const workflowTaskAggregateSource = await readFile(workflowTaskAggregatePath, "utf8");
const workflowTaskTypesSource = await readFile(workflowTaskTypesPath, "utf8");
const procedureAggregateSource = await readFile(procedureAggregatePath, "utf8");
const procedureTypesSource = await readFile(procedureTypesPath, "utf8");
const deliveryAttemptAggregateSource = await readFile(deliveryAttemptAggregatePath, "utf8");
const deliveryAttemptValidationSource = await readFile(deliveryAttemptValidationPath, "utf8");
const deliveryAttemptTypesSource = await readFile(deliveryAttemptTypesPath, "utf8");
const medicationRequestAggregateSource = await readFile(medicationRequestAggregatePath, "utf8");
const medicationRequestTypesSource = await readFile(medicationRequestTypesPath, "utf8");
const medicationDispenseAggregateSource = await readFile(medicationDispenseAggregatePath, "utf8");
const medicationDispenseTypesSource = await readFile(medicationDispenseTypesPath, "utf8");
const medicationAdministrationAggregateSource = await readFile(
  medicationAdministrationAggregatePath,
  "utf8"
);
const medicationAdministrationTypesSource = await readFile(
  medicationAdministrationTypesPath,
  "utf8"
);
const serviceRequestAggregateSource = await readFile(serviceRequestAggregatePath, "utf8");
const serviceRequestTypesSource = await readFile(serviceRequestTypesPath, "utf8");
const imagingStudyAggregateSource = await readFile(imagingStudyAggregatePath, "utf8");
const imagingStudyTypesSource = await readFile(imagingStudyTypesPath, "utf8");
const clinicalDocumentAggregateSource = await readFile(clinicalDocumentAggregatePath, "utf8");
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
const observationTypesSource = await readFile(observationTypesPath, "utf8");
const conditionAggregateSource = await readFile(conditionAggregatePath, "utf8");
const conditionValidationSource = await readFile(conditionValidationPath, "utf8");
const conditionTypesSource = await readFile(conditionTypesPath, "utf8");
const allergyIntoleranceAggregateSource = await readFile(
  allergyIntoleranceAggregatePath,
  "utf8"
);
const allergyIntoleranceTypesSource = await readFile(allergyIntoleranceTypesPath, "utf8");
const encounterAggregateSource = await readFile(encounterAggregatePath, "utf8");
const encounterValidationSource = await readFile(encounterValidationPath, "utf8");
const encounterTypesSource = await readFile(encounterTypesPath, "utf8");
const consentAggregateSource = await readFile(consentAggregatePath, "utf8");
const consentValidationSource = await readFile(consentValidationPath, "utf8");
const consentTypesSource = await readFile(consentTypesPath, "utf8");
const fhirTypesSource = await readFile(fhirTypesPath, "utf8");
const fhirClinicalBarrelSource = await readFile(fhirClinicalBarrelPath, "utf8");
const fhirSharedTypesSource = await readFile(fhirSharedTypesPath, "utf8");
const fhirProviderTypesSource = await readFile(fhirProviderTypesPath, "utf8");
const fhirDocumentTypesSource = await readFile(fhirDocumentTypesPath, "utf8");
const fhirPrivacyTypesSource = await readFile(fhirPrivacyTypesPath, "utf8");
const fhirAuditTypesSource = await readFile(fhirAuditTypesPath, "utf8");
const fhirClinicalCoreTypesSource = await readFile(fhirClinicalCoreTypesPath, "utf8");
const fhirMedicationTypesSource = await readFile(fhirMedicationTypesPath, "utf8");
const fhirCareflowTypesSource = await readFile(fhirCareflowTypesPath, "utf8");
const fhirDiagnosticsTypesSource = await readFile(fhirDiagnosticsTypesPath, "utf8");
const fhirPatientTypesSource = await readFile(fhirPatientTypesPath, "utf8");
const fhirOperationOutcomeTypesSource = await readFile(
  fhirOperationOutcomeTypesPath,
  "utf8"
);
const fhirCapabilityStatementTypesSource = await readFile(
  fhirCapabilityStatementTypesPath,
  "utf8"
);
const fhirBundleTypesSource = await readFile(fhirBundleTypesPath, "utf8");

for (const forbidden of [
  /export type RecordTransferStatus/,
  /export type RecordTransferSnapshot/,
  /const recordTransferStatuses/,
  /function validateRecordTransferSnapshot/
]) {
  if (forbidden.test(aggregateSource)) {
    throw new Error(
      "RecordTransfer aggregate must keep behavior only; types stay in record-transfer.types.ts and snapshot invariants stay in record-transfer.validation.ts."
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

if (!/from "\.\/record-transfer\.validation\.js"/.test(aggregateSource)) {
  throw new Error(
    "RecordTransfer aggregate must depend on record-transfer.validation.ts for normalization and snapshot invariants."
  );
}

for (const required of [
  /export function validateRecordTransferSnapshot/,
  /export function normalizeRequired/,
  /export function parseDate/,
  /from "\.\/record-transfer\.types\.js"/
]) {
  if (!required.test(recordTransferValidationSource)) {
    throw new Error(
      "record-transfer.validation.ts must keep RecordTransfer normalization and snapshot invariant guards."
    );
  }
}

for (const forbidden of [
  /export type ProviderDirectorySnapshot/,
  /export type ProviderOrganizationType/,
  /const providerOrganizationTypes/,
  /function normalizeOrganization/
]) {
  if (forbidden.test(providerDirectoryAggregateSource)) {
    throw new Error(
      "ProviderDirectory aggregate must keep assembly behavior only; types stay in provider-directory.types.ts and normalization/reference guards stay in provider-directory.validation.ts."
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
    "ProviderDirectory aggregate must depend on provider-directory.validation.ts for normalization and reference guards."
  );
}

for (const required of [
  /export function normalizeOrganization/,
  /export function normalizePersistedOrganization/,
  /export function validateReferences/,
  /export function cloneOrganization/,
  /from "\.\/provider-directory\.types\.js"/
]) {
  if (!required.test(providerDirectoryValidationSource)) {
    throw new Error(
      "provider-directory.validation.ts must keep ProviderDirectory normalization, reference validation and snapshot cloning."
    );
  }
}

for (const forbidden of [
  /export type AuditAction/,
  /export type AuditEventSnapshot/,
  /const auditActions/,
  /function hashAuditPayload/
]) {
  if (forbidden.test(auditEventAggregateSource)) {
    throw new Error(
      "AuditEvent aggregate must keep record/seal/report behavior only; types stay in audit-event.types.ts and hashing/normalization guards stay in audit-event.validation.ts."
    );
  }
}

for (const required of [
  /export type AuditAction/,
  /export type AuditResourceType/,
  /export type AuditEventSnapshot/,
  /export type AuditIntegrityReport/,
  /export const auditActions/
]) {
  if (!required.test(auditEventTypesSource)) {
    throw new Error(
      "audit-event.types.ts must keep AuditEvent actions, resources, snapshots, integrity reports and action-set definitions."
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
  /clinician: \[/
]) {
  if (forbidden.test(accessControlBehaviorSource)) {
    throw new Error(
      "AccessControl role, purpose and permission catalog belongs in access-control.policy.ts, not the behavior file."
    );
  }
}

for (const required of [
  /export type ActorRole/,
  /export type PurposeOfUse/,
  /export type Permission/,
  /export const actorRoles/,
  /export const purposesOfUse/,
  /export const rolePermissions/
]) {
  if (!required.test(accessControlPolicySource)) {
    throw new Error(
      "access-control.policy.ts must keep AccessControl roles, purposes, permissions and role-permission catalog definitions."
    );
  }
}

if (!/from "\.\/access-control\.policy\.js"/.test(accessControlBehaviorSource)) {
  throw new Error(
    "AccessControl behavior must depend on access-control.policy.ts for shared policy catalog types."
  );
}

for (const forbidden of [
  /export type AdministrativeGender/,
  /export type PatientSnapshot/,
  /const administrativeGenders/,
  /function normalizeIdentifier/
]) {
  if (forbidden.test(patientAggregateSource)) {
    throw new Error(
      "Patient aggregate must keep registration, demographic update and merge behavior only; types stay in patient.types.ts and identifier/date/merge guards stay in patient.validation.ts."
    );
  }
}

for (const required of [
  /export type AdministrativeGender/,
  /export type PatientIdentifier/,
  /export type PatientSnapshot/,
  /export type RegisterPatientInput/,
  /export const administrativeGenders/
]) {
  if (!required.test(patientTypesSource)) {
    throw new Error(
      "patient.types.ts must keep Patient gender, identifier, snapshot, registration input and code-set definitions."
    );
  }
}

if (!/from "\.\/patient\.types\.js"/.test(patientAggregateSource)) {
  throw new Error("Patient aggregate must depend on patient.types.ts for shared types.");
}

if (!/from "\.\/patient\.validation\.js"/.test(patientAggregateSource)) {
  throw new Error(
    "Patient aggregate must depend on patient.validation.ts for identifier, FHIR birth date, merge state and timeline guards."
  );
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
  /const workflowTaskStatuses/
]) {
  if (forbidden.test(workflowTaskAggregateSource)) {
    throw new Error(
      "WorkflowTask type declarations and code sets belong in workflow-task.types.ts, not the aggregate file."
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

for (const forbidden of [
  /export type ProcedureStatus/,
  /export type ProcedureSnapshot/,
  /const procedureStatuses/
]) {
  if (forbidden.test(procedureAggregateSource)) {
    throw new Error(
      "Procedure type declarations and code sets belong in procedure.types.ts, not the aggregate file."
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

for (const forbidden of [
  /export type RecordTransferDeliveryAttemptStatus/,
  /export type RecordTransferDeliveryAttemptSnapshot/,
  /const deliveryAttemptStatuses/,
  /function normalizeRequired/,
  /function validateTerminalState/
]) {
  if (forbidden.test(deliveryAttemptAggregateSource)) {
    throw new Error(
      "RecordTransferDeliveryAttempt aggregate must keep queue/terminal behavior only; types stay in record-transfer-delivery-attempt.types.ts and delivery validation guards stay in record-transfer-delivery-attempt.validation.ts."
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
    "RecordTransferDeliveryAttempt aggregate must depend on record-transfer-delivery-attempt.validation.ts for delivery normalization and terminal-state guards."
  );
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
  /const medicationRequestStatuses/
]) {
  if (forbidden.test(medicationRequestAggregateSource)) {
    throw new Error(
      "MedicationRequest type declarations and code sets belong in medication-request.types.ts, not the aggregate file."
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

for (const forbidden of [
  /export type MedicationDispenseStatus/,
  /export type MedicationDispenseSnapshot/,
  /const medicationDispenseStatuses/
]) {
  if (forbidden.test(medicationDispenseAggregateSource)) {
    throw new Error(
      "MedicationDispense type declarations and code sets belong in medication-dispense.types.ts, not the aggregate file."
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

for (const forbidden of [
  /export type MedicationAdministrationStatus/,
  /export type MedicationAdministrationSnapshot/,
  /const medicationAdministrationStatuses/
]) {
  if (forbidden.test(medicationAdministrationAggregateSource)) {
    throw new Error(
      "MedicationAdministration type declarations and code sets belong in medication-administration.types.ts, not the aggregate file."
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

for (const forbidden of [
  /export type ServiceRequestStatus/,
  /export type ServiceRequestSnapshot/,
  /const serviceRequestStatuses/
]) {
  if (forbidden.test(serviceRequestAggregateSource)) {
    throw new Error(
      "ServiceRequest type declarations and code sets belong in service-request.types.ts, not the aggregate file."
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

for (const forbidden of [
  /export type ImagingStudyStatus/,
  /export type ImagingStudySnapshot/,
  /const imagingStudyStatuses/
]) {
  if (forbidden.test(imagingStudyAggregateSource)) {
    throw new Error(
      "ImagingStudy type declarations and code sets belong in imaging-study.types.ts, not the aggregate file."
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

for (const forbidden of [
  /export type ClinicalDocumentType/,
  /export type ClinicalDocumentSnapshot/,
  /const clinicalDocumentStatuses/,
  /function normalizeAttachmentSize/
]) {
  if (forbidden.test(clinicalDocumentAggregateSource)) {
    throw new Error(
      "ClinicalDocument aggregate must keep create/sign behavior only; types stay in clinical-document.types.ts and attachment/status/timeline guards stay in clinical-document.validation.ts."
    );
  }
}

for (const required of [
  /export type ClinicalDocumentType/,
  /export type ClinicalDocumentStatus/,
  /export type ClinicalDocumentSnapshot/,
  /export type CreateClinicalDocumentInput/,
  /export const clinicalDocumentStatuses/
]) {
  if (!required.test(clinicalDocumentTypesSource)) {
    throw new Error(
      "clinical-document.types.ts must keep ClinicalDocument document type, status, snapshot, command input and code-set definitions."
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
    "ClinicalDocument aggregate must depend on clinical-document.validation.ts for attachment, status and timeline guards."
  );
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
  /const observationStatuses/
]) {
  if (forbidden.test(observationAggregateSource)) {
    throw new Error(
      "Observation type declarations and code sets belong in observation.types.ts, not the aggregate file."
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

for (const forbidden of [
  /export type AllergyClinicalStatus/,
  /export type AllergyIntoleranceSnapshot/,
  /const allergyClinicalStatuses/
]) {
  if (forbidden.test(allergyIntoleranceAggregateSource)) {
    throw new Error(
      "AllergyIntolerance type declarations and code sets belong in allergy-intolerance.types.ts, not the aggregate file."
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
  /function assertValidPeriod/
]) {
  if (forbidden.test(consentAggregateSource)) {
    throw new Error(
      "Consent aggregate must keep grant/revoke/authorization behavior only; types stay in consent.types.ts and period/status/category guards stay in consent.validation.ts."
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
  [fhirClinicalCoreTypesSource, /export type FhirEncounter/, "fhir-clinical-core.types.ts"],
  [fhirClinicalCoreTypesSource, /export type FhirAllergyIntolerance/, "fhir-clinical-core.types.ts"],
  [fhirMedicationTypesSource, /export type FhirMedicationRequest/, "fhir-medication.types.ts"],
  [fhirMedicationTypesSource, /export type FhirMedicationAdministration/, "fhir-medication.types.ts"],
  [fhirCareflowTypesSource, /export type FhirServiceRequest/, "fhir-careflow.types.ts"],
  [fhirCareflowTypesSource, /export type FhirProcedure/, "fhir-careflow.types.ts"],
  [fhirDiagnosticsTypesSource, /export type FhirDiagnosticReport/, "fhir-diagnostics.types.ts"],
  [fhirDiagnosticsTypesSource, /export type FhirImagingStudy/, "fhir-diagnostics.types.ts"],
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

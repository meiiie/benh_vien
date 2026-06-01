import { readdir, stat, readFile } from "node:fs/promises";
import { relative, resolve } from "node:path";

const appPath = resolve("apps/web/src/App.tsx");
const webSrcPath = resolve("apps/web/src");
const allowedFetchModulePath = resolve("apps/web/src/api/clinicalApi.ts");
const sharedClinicalFormatterPath = resolve("apps/web/src/lib/clinicalFormatters.ts");
const clinicalTypeBarrelImportPattern =
  /(?:from|import\s*\()\s*["'][^"']*types\/clinical\.js["']/;
const requiredModules = [
  "apps/web/src/api/clinicalApi.ts",
  "apps/web/src/auth/authApi.ts",
  "apps/web/src/auth/demoLogin.ts",
  "apps/web/src/application/appAuditLoaders.ts",
  "apps/web/src/application/appAuthSessionHandlers.ts",
  "apps/web/src/application/appClinicalRecordHandlers.ts",
  "apps/web/src/application/appDerivedContext.ts",
  "apps/web/src/application/appFhirPreviewLoaders.ts",
  "apps/web/src/application/appLifecycleEffects.ts",
  "apps/web/src/application/appPatientRegistryHandlers.ts",
  "apps/web/src/application/appPatientRegistryLoaders.ts",
  "apps/web/src/application/appPatientWorkspaceLifecycle.ts",
  "apps/web/src/application/appPatientWorkspaceLoaders.ts",
  "apps/web/src/application/appPlatformLoaders.ts",
  "apps/web/src/application/appRecordTransferHandlers.ts",
  "apps/web/src/application/appRoutePanels.ts",
  "apps/web/src/application/appRuntimeEffects.ts",
  "apps/web/src/application/appShellState.ts",
  "apps/web/src/application/auditPanelContext.ts",
  "apps/web/src/application/clinicalDocumentPanelContext.ts",
  "apps/web/src/application/clinicalRecordPanelContext.ts",
  "apps/web/src/application/dashboardMetrics.ts",
  "apps/web/src/application/interopPanelContext.ts",
  "apps/web/src/application/patientPanelContext.ts",
  "apps/web/src/application/workspaceSelection.ts",
  "apps/web/src/components/AppShell.tsx",
  "apps/web/src/config/demoClinicalDefaults.ts",
  "apps/web/src/features/audit/AuditPanels.tsx",
  "apps/web/src/features/audit/auditPanelRenderers.tsx",
  "apps/web/src/features/audit/auditApi.ts",
  "apps/web/src/features/clinical-documents/ClinicalDocumentForm.tsx",
  "apps/web/src/features/clinical-documents/ClinicalDocumentPanel.tsx",
  "apps/web/src/features/clinical-documents/clinicalDocumentApi.ts",
  "apps/web/src/features/clinical-documents/clinicalDocumentCommandBuilders.ts",
  "apps/web/src/features/clinical-documents/clinicalDocumentFormatters.ts",
  "apps/web/src/features/clinical-documents/clinicalDocumentPanelRenderers.tsx",
  "apps/web/src/features/clinical-records/AllergyIntoleranceForm.tsx",
  "apps/web/src/features/clinical-records/AllergyIntolerancePanel.tsx",
  "apps/web/src/features/clinical-records/allergyFormatters.ts",
  "apps/web/src/features/clinical-records/carePlanCommandBuilders.ts",
  "apps/web/src/features/clinical-records/careWorkflowFormatters.ts",
  "apps/web/src/features/clinical-records/clinicalEntryCommandBuilders.ts",
  "apps/web/src/features/clinical-records/clinicalRecordPanelRenderers.tsx",
  "apps/web/src/features/clinical-records/clinicalRecordPanelRendererTypes.ts",
  "apps/web/src/features/clinical-records/ConditionForm.tsx",
  "apps/web/src/features/clinical-records/ConditionPanel.tsx",
  "apps/web/src/features/clinical-records/conditionFormatters.ts",
  "apps/web/src/features/clinical-records/diagnosticResultFormatters.ts",
  "apps/web/src/features/clinical-records/DiagnosticReportForm.tsx",
  "apps/web/src/features/clinical-records/DiagnosticReportPanel.tsx",
  "apps/web/src/features/clinical-records/EncounterPanel.tsx",
  "apps/web/src/features/clinical-records/encounterFormatters.ts",
  "apps/web/src/features/clinical-records/encounterScopedFormUpdater.ts",
  "apps/web/src/features/clinical-records/encounterSelectors.ts",
  "apps/web/src/features/clinical-records/ImagingStudyForm.tsx",
  "apps/web/src/features/clinical-records/ImagingStudyPanel.tsx",
  "apps/web/src/features/clinical-records/MedicationAdministrationContextFields.tsx",
  "apps/web/src/features/clinical-records/MedicationAdministrationDosageFields.tsx",
  "apps/web/src/features/clinical-records/MedicationAdministrationForm.tsx",
  "apps/web/src/features/clinical-records/MedicationAdministrationPanel.tsx",
  "apps/web/src/features/clinical-records/MedicationAdministrationPerformerFields.tsx",
  "apps/web/src/features/clinical-records/MedicationDispenseContextFields.tsx",
  "apps/web/src/features/clinical-records/MedicationDispenseDosageFields.tsx",
  "apps/web/src/features/clinical-records/MedicationDispenseForm.tsx",
  "apps/web/src/features/clinical-records/MedicationDispensePanel.tsx",
  "apps/web/src/features/clinical-records/MedicationDispenseSupplyFields.tsx",
  "apps/web/src/features/clinical-records/MedicationRequestForm.tsx",
  "apps/web/src/features/clinical-records/MedicationRequestPanel.tsx",
  "apps/web/src/features/clinical-records/medicationFormatters.ts",
  "apps/web/src/features/clinical-records/medicationAdministrationCommandBuilders.ts",
  "apps/web/src/features/clinical-records/medicationCommandBuilders.ts",
  "apps/web/src/features/clinical-records/medicationDispenseCommandBuilders.ts",
  "apps/web/src/features/clinical-records/medicationRequestCommandBuilders.ts",
  "apps/web/src/features/clinical-records/ObservationForm.tsx",
  "apps/web/src/features/clinical-records/ObservationPanel.tsx",
  "apps/web/src/features/clinical-records/ProcedureForm.tsx",
  "apps/web/src/features/clinical-records/ProcedurePanel.tsx",
  "apps/web/src/features/clinical-records/ServiceRequestForm.tsx",
  "apps/web/src/features/clinical-records/ServiceRequestPanel.tsx",
  "apps/web/src/features/clinical-records/WorkflowTaskPanel.tsx",
  "apps/web/src/features/clinical-records/careWorkflowApi.ts",
  "apps/web/src/features/clinical-records/clinicalEntryApi.ts",
  "apps/web/src/features/clinical-records/clinicalRecordApi.ts",
  "apps/web/src/features/clinical-records/clinicalRecordCollectionState.ts",
  "apps/web/src/features/clinical-records/clinicalRecordFormState.ts",
  "apps/web/src/features/clinical-records/clinicalRecordHttp.ts",
  "apps/web/src/features/clinical-records/clinicalRecordState.ts",
  "apps/web/src/features/clinical-records/clinicalRecordStatusState.ts",
  "apps/web/src/features/clinical-records/diagnosticResultApi.ts",
  "apps/web/src/features/clinical-records/encounterApi.ts",
  "apps/web/src/features/clinical-records/medicationApi.ts",
  "apps/web/src/features/consents/ConsentInteropPanel.tsx",
  "apps/web/src/features/consents/consentApi.ts",
  "apps/web/src/features/consents/consentCommandBuilders.ts",
  "apps/web/src/features/consents/consentFormatters.ts",
  "apps/web/src/features/fhir-preview/fhirPreviewLoaders.ts",
  "apps/web/src/features/interoperability/interopPanelRenderers.tsx",
  "apps/web/src/features/patient-registry/CreatePatientPanel.tsx",
  "apps/web/src/features/patient-registry/PatientDetailPanel.tsx",
  "apps/web/src/features/patient-registry/PatientListPanel.tsx",
  "apps/web/src/features/patient-registry/PatientMergePanel.tsx",
  "apps/web/src/features/patient-registry/patientPanelRenderers.tsx",
  "apps/web/src/features/patient-registry/patientRegistryCommandBuilders.ts",
  "apps/web/src/features/patient-registry/patientRegistryApi.ts",
  "apps/web/src/features/patient-registry/patientRegistryFormatters.ts",
  "apps/web/src/features/patient-registry/patientRegistrySelectors.ts",
  "apps/web/src/features/patient-workspace/patientWorkspaceCollectionLoaders.ts",
  "apps/web/src/features/platform/platformApi.ts",
  "apps/web/src/features/provider-directory/ProviderDirectoryPanel.tsx",
  "apps/web/src/features/provider-directory/providerDirectoryApi.ts",
  "apps/web/src/features/provider-directory/providerDirectoryFormatters.ts",
  "apps/web/src/features/record-transfers/RecordTransferDeliveryAttemptList.tsx",
  "apps/web/src/features/record-transfers/RecordTransferInteropPanel.tsx",
  "apps/web/src/features/record-transfers/RecordTransferOperationalSummary.tsx",
  "apps/web/src/features/record-transfers/recordTransferApi.ts",
  "apps/web/src/features/record-transfers/recordTransferCommandBuilders.ts",
  "apps/web/src/features/record-transfers/recordTransferFormatters.ts",
  "apps/web/src/lib/auditFormatters.ts",
  "apps/web/src/lib/clinicalFormatters.ts",
  "apps/web/src/lib/commandDrafts.ts",
  "apps/web/src/lib/fhirPreviewLoader.ts",
  "apps/web/src/lib/patientScopedCollectionLoader.ts",
  "apps/web/src/pages/AppRouteRenderer.tsx",
  "apps/web/src/pages/AuditLogPage.tsx",
  "apps/web/src/pages/DashboardPage.tsx",
  "apps/web/src/pages/DocumentsPage.tsx",
  "apps/web/src/pages/GatewayAcknowledgementPage.tsx",
  "apps/web/src/pages/InteropPage.tsx",
  "apps/web/src/pages/LandingPage.tsx",
  "apps/web/src/pages/LoginPage.tsx",
  "apps/web/src/pages/SettingsPage.tsx",
  "apps/web/src/pages/WorkspacePage.tsx",
  "apps/web/src/types/allergies.ts",
  "apps/web/src/types/appRuntime.ts",
  "apps/web/src/types/audit.ts",
  "apps/web/src/types/careWorkflow.ts",
  "apps/web/src/types/clinicalDocuments.ts",
  "apps/web/src/types/clinical.ts",
  "apps/web/src/types/conditions.ts",
  "apps/web/src/types/consents.ts",
  "apps/web/src/types/diagnosticResults.ts",
  "apps/web/src/types/encounters.ts",
  "apps/web/src/types/medications.ts",
  "apps/web/src/types/observations.ts",
  "apps/web/src/types/patientRegistry.ts",
  "apps/web/src/types/providerDirectory.ts",
  "apps/web/src/types/recordTransfers.ts"
];
const forbiddenPageCompositionModules = [
  "apps/web/src/pages/appAuditLoaders.ts",
  "apps/web/src/pages/appAuthSessionHandlers.ts",
  "apps/web/src/pages/appClinicalRecordHandlers.ts",
  "apps/web/src/pages/appDerivedContext.ts",
  "apps/web/src/pages/appFhirPreviewLoaders.ts",
  "apps/web/src/pages/appLifecycleEffects.ts",
  "apps/web/src/pages/appPatientRegistryHandlers.ts",
  "apps/web/src/pages/appPatientRegistryLoaders.ts",
  "apps/web/src/pages/appPatientWorkspaceLifecycle.ts",
  "apps/web/src/pages/appPatientWorkspaceLoaders.ts",
  "apps/web/src/pages/appPlatformLoaders.ts",
  "apps/web/src/pages/appRecordTransferHandlers.ts",
  "apps/web/src/pages/appRoutePanels.ts",
  "apps/web/src/pages/appRuntimeEffects.ts",
  "apps/web/src/pages/appShellState.ts",
  "apps/web/src/pages/auditPanelContext.ts",
  "apps/web/src/pages/clinicalDocumentPanelContext.ts",
  "apps/web/src/pages/clinicalRecordPanelContext.ts",
  "apps/web/src/pages/dashboardMetrics.ts",
  "apps/web/src/pages/interopPanelContext.ts",
  "apps/web/src/pages/patientPanelContext.ts",
  "apps/web/src/pages/workspaceSelection.ts"
];
const maxAppLines = 2_647;
const featureModuleBudgets = [
  {
    path: "apps/web/src/features/clinical-documents/ClinicalDocumentPanel.tsx",
    maxLines: 190,
    role: "Clinical document list, summary and form composition"
  },
  {
    path: "apps/web/src/features/clinical-documents/ClinicalDocumentForm.tsx",
    maxLines: 180,
    role: "Clinical document metadata and attachment command form"
  },
  {
    path: "apps/web/src/features/record-transfers/RecordTransferInteropPanel.tsx",
    maxLines: 340,
    role: "Record transfer panel layout, metadata and command form"
  },
  {
    path: "apps/web/src/features/record-transfers/RecordTransferDeliveryAttemptList.tsx",
    maxLines: 100,
    role: "Record transfer delivery-attempt timeline UI"
  },
  {
    path: "apps/web/src/features/record-transfers/RecordTransferOperationalSummary.tsx",
    maxLines: 60,
    role: "Record transfer operational status summary UI"
  },
  {
    path: "apps/web/src/features/clinical-records/clinicalRecordPanelRenderers.tsx",
    maxLines: 270,
    role: "Clinical record panel renderer composition"
  },
  {
    path: "apps/web/src/features/clinical-records/clinicalRecordPanelRendererTypes.ts",
    maxLines: 210,
    role: "Clinical record panel renderer type contracts"
  },
  {
    path: "apps/web/src/features/clinical-records/clinicalRecordState.ts",
    maxLines: 20,
    role: "Clinical record state compatibility facade"
  },
  {
    path: "apps/web/src/features/clinical-records/clinicalRecordCollectionState.ts",
    maxLines: 140,
    role: "Clinical record collection and selected-id state"
  },
  {
    path: "apps/web/src/features/clinical-records/clinicalRecordFormState.ts",
    maxLines: 110,
    role: "Clinical record command form state"
  },
  {
    path: "apps/web/src/features/clinical-records/clinicalRecordStatusState.ts",
    maxLines: 130,
    role: "Clinical record loading and submitting state"
  },
  {
    path: "apps/web/src/features/clinical-records/clinicalRecordApi.ts",
    maxLines: 20,
    role: "Clinical record API compatibility barrel"
  },
  {
    path: "apps/web/src/features/clinical-records/clinicalRecordHttp.ts",
    maxLines: 40,
    role: "Clinical record treatment-purpose HTTP helper"
  },
  {
    path: "apps/web/src/features/clinical-records/encounterApi.ts",
    maxLines: 60,
    role: "Encounter API adapter"
  },
  {
    path: "apps/web/src/features/clinical-records/clinicalEntryApi.ts",
    maxLines: 120,
    role: "Allergy, condition and observation API adapter"
  },
  {
    path: "apps/web/src/features/clinical-records/medicationApi.ts",
    maxLines: 150,
    role: "Medication workflow API adapter"
  },
  {
    path: "apps/web/src/features/clinical-records/careWorkflowApi.ts",
    maxLines: 130,
    role: "ServiceRequest, Task and Procedure API adapter"
  },
  {
    path: "apps/web/src/features/clinical-records/diagnosticResultApi.ts",
    maxLines: 120,
    role: "DiagnosticReport and ImagingStudy API adapter"
  },
  {
    path: "apps/web/src/features/clinical-records/medicationCommandBuilders.ts",
    maxLines: 20,
    role: "Medication command-builder compatibility barrel"
  },
  {
    path: "apps/web/src/features/clinical-records/medicationRequestCommandBuilders.ts",
    maxLines: 120,
    role: "MedicationRequest prescribing command builder"
  },
  {
    path: "apps/web/src/features/clinical-records/medicationDispenseCommandBuilders.ts",
    maxLines: 150,
    role: "MedicationDispense dispensing command builder"
  },
  {
    path: "apps/web/src/features/clinical-records/medicationAdministrationCommandBuilders.ts",
    maxLines: 120,
    role: "MedicationAdministration actual-use command builder"
  },
  {
    path: "apps/web/src/features/clinical-records/AllergyIntolerancePanel.tsx",
    maxLines: 180,
    role: "AllergyIntolerance safety list, summary and form composition"
  },
  {
    path: "apps/web/src/features/clinical-records/AllergyIntoleranceForm.tsx",
    maxLines: 230,
    role: "AllergyIntolerance safety command form"
  },
  {
    path: "apps/web/src/features/clinical-records/ConditionPanel.tsx",
    maxLines: 170,
    role: "Condition list, summary and form composition"
  },
  {
    path: "apps/web/src/features/clinical-records/ConditionForm.tsx",
    maxLines: 190,
    role: "Condition diagnosis/problem command form"
  },
  {
    path: "apps/web/src/features/clinical-records/ObservationPanel.tsx",
    maxLines: 150,
    role: "Observation list, summary and form composition"
  },
  {
    path: "apps/web/src/features/clinical-records/ObservationForm.tsx",
    maxLines: 180,
    role: "Observation value command form"
  },
  {
    path: "apps/web/src/features/clinical-records/MedicationDispensePanel.tsx",
    maxLines: 220,
    role: "MedicationDispense list, summary and form composition"
  },
  {
    path: "apps/web/src/features/clinical-records/MedicationDispenseForm.tsx",
    maxLines: 80,
    role: "MedicationDispense command form composition"
  },
  {
    path: "apps/web/src/features/clinical-records/MedicationDispenseContextFields.tsx",
    maxLines: 130,
    role: "MedicationDispense encounter, request and category fields"
  },
  {
    path: "apps/web/src/features/clinical-records/MedicationDispenseSupplyFields.tsx",
    maxLines: 160,
    role: "MedicationDispense supply, handover and dispenser fields"
  },
  {
    path: "apps/web/src/features/clinical-records/MedicationDispenseDosageFields.tsx",
    maxLines: 140,
    role: "MedicationDispense dosage instruction fields"
  },
  {
    path: "apps/web/src/features/clinical-records/MedicationAdministrationPanel.tsx",
    maxLines: 220,
    role: "MedicationAdministration list, summary and form composition"
  },
  {
    path: "apps/web/src/features/clinical-records/MedicationAdministrationForm.tsx",
    maxLines: 90,
    role: "MedicationAdministration command form composition"
  },
  {
    path: "apps/web/src/features/clinical-records/MedicationAdministrationContextFields.tsx",
    maxLines: 150,
    role: "MedicationAdministration encounter, request, condition and category fields"
  },
  {
    path: "apps/web/src/features/clinical-records/MedicationAdministrationPerformerFields.tsx",
    maxLines: 100,
    role: "MedicationAdministration effective time and performer fields"
  },
  {
    path: "apps/web/src/features/clinical-records/MedicationAdministrationDosageFields.tsx",
    maxLines: 120,
    role: "MedicationAdministration actual medication and dosage fields"
  },
  {
    path: "apps/web/src/features/clinical-records/ProcedurePanel.tsx",
    maxLines: 210,
    role: "Procedure list, summary and form composition"
  },
  {
    path: "apps/web/src/features/clinical-records/ProcedureForm.tsx",
    maxLines: 260,
    role: "Procedure field-heavy command form"
  },
  {
    path: "apps/web/src/features/clinical-records/ServiceRequestPanel.tsx",
    maxLines: 170,
    role: "ServiceRequest order list, summary and form composition"
  },
  {
    path: "apps/web/src/features/clinical-records/ServiceRequestForm.tsx",
    maxLines: 210,
    role: "ServiceRequest LIS/RIS/PACS order command form"
  },
  {
    path: "apps/web/src/features/clinical-records/MedicationRequestPanel.tsx",
    maxLines: 180,
    role: "MedicationRequest list, summary and form composition"
  },
  {
    path: "apps/web/src/features/clinical-records/MedicationRequestForm.tsx",
    maxLines: 230,
    role: "MedicationRequest prescribing command form"
  },
  {
    path: "apps/web/src/features/clinical-records/DiagnosticReportPanel.tsx",
    maxLines: 180,
    role: "DiagnosticReport list, summary and form composition"
  },
  {
    path: "apps/web/src/features/clinical-records/DiagnosticReportForm.tsx",
    maxLines: 260,
    role: "DiagnosticReport LIS/RIS result command form"
  },
  {
    path: "apps/web/src/features/clinical-records/ImagingStudyPanel.tsx",
    maxLines: 180,
    role: "ImagingStudy PACS/DICOM list, summary and form composition"
  },
  {
    path: "apps/web/src/features/clinical-records/ImagingStudyForm.tsx",
    maxLines: 240,
    role: "ImagingStudy PACS/DICOM command form"
  }
];

const appSource = await readFile(appPath, "utf8");
const sharedClinicalFormatterSource = await readFile(sharedClinicalFormatterPath, "utf8");
const appLineCount = appSource.split(/\r?\n/).length;
const directFetchPattern = /\bfetch\s*\(/;
const directClinicalApiRequestPattern = /\bclinicalApi\.requestJson\s*\(/;
const forbiddenSharedClinicalFormatterPatterns = [
  /\bformatRecordTransfer/,
  /\bbuildRecordTransferOperationalSummary/,
  /\bresolveSelectedRecordTransferId/,
  /\bisMissingRecordTransferDeliveryAttemptsRoute/,
  /\bformatMedication(?:Request|Dispense|Administration)/,
  /\bformatDosageInstruction/,
  /\bformatServiceRequest(?:Category|Status|Intent|Priority)/,
  /\bformatWorkflowTask(?:Status|References)/,
  /\bformatProcedure(?:Status|Category|Performers|References)/,
  /\bformatObservation(?:Category|Status|Value)/,
  /\bformatDiagnosticReport(?:Category|Status)/,
  /\bformatImagingStudyStatus/,
  /\bformatGender/,
  /\bformatPatientRecordStatus/,
  /\bnormalizeSearchText/,
  /\bformatIdentifierType/,
  /\bformatEncounter(?:Class|Status)/,
  /\bformatDocument(?:Type|Status)/,
  /\bformatProviderEndpointConnectionType/,
  /\bformatConsent(?:Status|Category)/,
  /\bformatAllergy(?:Type|Category|Criticality|ClinicalStatus|VerificationStatus)/,
  /\bformatCondition(?:Category|ClinicalStatus|VerificationStatus|Severity)/
];
const forbiddenAppApiPathPatterns = [
  {
    pattern: /[`'"]\/patients[`'"]/,
    message:
      "apps/web/src/App.tsx must use apps/web/src/features/patient-registry/patientRegistryApi.ts for patient registry HTTP routes."
  },
  {
    pattern: /[`'"]\/patients\/[^`'"]+\/(?:merge|fhir(?:-bundle|-document-bundle)?\b)/,
    message:
      "apps/web/src/App.tsx must use apps/web/src/features/patient-registry/patientRegistryApi.ts for patient merge and Patient FHIR HTTP routes."
  },
  {
    pattern:
      /[`'"]\/(?:patients\/[^`'"]+\/(?:encounters|allergy-intolerances|conditions|observations|medication-requests|medication-dispenses|medication-administrations|service-requests|workflow-tasks|procedures|diagnostic-reports|imaging-studies)\b|(?:encounters\/[^`'"]+\/(?:finish|fhir)|allergy-intolerances\/[^`'"]+\/fhir|conditions\/[^`'"]+\/fhir|observations\/[^`'"]+\/fhir|medication-requests\/[^`'"]+\/fhir|medication-dispenses\/[^`'"]+\/fhir|medication-administrations\/[^`'"]+\/fhir|service-requests\/[^`'"]+\/fhir|workflow-tasks\/[^`'"]+\/fhir|procedures\/[^`'"]+\/fhir|diagnostic-reports\/[^`'"]+\/fhir|imaging-studies\/[^`'"]+\/fhir))/,
    message:
      "apps/web/src/App.tsx must use apps/web/src/features/clinical-records/clinicalRecordApi.ts for clinical-record HTTP routes."
  },
  {
    pattern: /[`'"]\/(?:audit-events\b|patients\/[^`'"]+\/audit-(?:events|integrity)\b)/,
    message:
      "apps/web/src/App.tsx must use apps/web/src/features/audit/auditApi.ts for audit HTTP routes."
  },
  {
    pattern: /[`'"]\/(?:consents\b|patients\/[^`'"]+\/consents\b)/,
    message:
      "apps/web/src/App.tsx must use apps/web/src/features/consents/consentApi.ts for consent HTTP routes."
  },
  {
    pattern: /[`'"]\/(?:clinical-documents\b|patients\/[^`'"]+\/documents\b)/,
    message:
      "apps/web/src/App.tsx must use apps/web/src/features/clinical-documents/clinicalDocumentApi.ts for clinical-document HTTP routes."
  },
  {
    pattern: /[`'"]\/(?:record-transfers\b|patients\/[^`'"]+\/record-transfers\b)/,
    message:
      "apps/web/src/App.tsx must use apps/web/src/features/record-transfers/recordTransferApi.ts for record-transfer HTTP routes."
  }
];

if (appLineCount > maxAppLines) {
  throw new Error(
    `apps/web/src/App.tsx has ${appLineCount} lines; keep it at or below ${maxAppLines} by extracting pages, shell components, types, config, and pure helpers.`
  );
}

for (const budget of featureModuleBudgets) {
  const moduleSource = await readFile(resolve(budget.path), "utf8");
  const moduleLineCount = moduleSource.split(/\r?\n/).length;

  if (moduleLineCount > budget.maxLines) {
    throw new Error(
      `${budget.path} has ${moduleLineCount} lines; keep it at or below ${budget.maxLines}. Role: ${budget.role}.`
    );
  }
}

if (directClinicalApiRequestPattern.test(appSource)) {
  throw new Error(
    "apps/web/src/App.tsx must call feature/platform/auth API modules instead of clinicalApi.requestJson directly."
  );
}

for (const forbidden of forbiddenAppApiPathPatterns) {
  if (forbidden.pattern.test(appSource)) {
    throw new Error(forbidden.message);
  }
}

for (const pattern of forbiddenSharedClinicalFormatterPatterns) {
  if (pattern.test(sharedClinicalFormatterSource)) {
    throw new Error(
      "Feature-specific presentation helpers must live under their apps/web/src/features/* module, not apps/web/src/lib/clinicalFormatters.ts."
    );
  }
}

const webSourceFiles = await collectSourceFiles(webSrcPath);
const forbiddenFetchFiles = [];
const forbiddenClinicalTypeBarrelImportFiles = [];

for (const filePath of webSourceFiles) {
  const source = filePath === appPath ? appSource : await readFile(filePath, "utf8");

  if (filePath !== allowedFetchModulePath && directFetchPattern.test(source)) {
    forbiddenFetchFiles.push(relative(process.cwd(), filePath));
  }

  if (clinicalTypeBarrelImportPattern.test(source)) {
    forbiddenClinicalTypeBarrelImportFiles.push(relative(process.cwd(), filePath));
  }
}

if (forbiddenFetchFiles.length > 0) {
  throw new Error(
    `Frontend code must route HTTP through apps/web/src/api/clinicalApi.ts; direct fetch found in: ${forbiddenFetchFiles.join(", ")}`
  );
}

if (forbiddenClinicalTypeBarrelImportFiles.length > 0) {
  throw new Error(
    `Frontend code must import clinical domain types from their focused apps/web/src/types/* modules, not the compatibility barrel apps/web/src/types/clinical.ts: ${forbiddenClinicalTypeBarrelImportFiles.join(", ")}`
  );
}

const missingModules = [];

for (const modulePath of requiredModules) {
  try {
    await stat(resolve(modulePath));
  } catch {
    missingModules.push(modulePath);
  }
}

if (missingModules.length > 0) {
  throw new Error(
    `Expected web composition modules to exist: ${missingModules.join(", ")}`
  );
}

const misplacedPageCompositionModules = [];

for (const modulePath of forbiddenPageCompositionModules) {
  try {
    await stat(resolve(modulePath));
    misplacedPageCompositionModules.push(modulePath);
  } catch {
    // Expected: application orchestration belongs under apps/web/src/application.
  }
}

if (misplacedPageCompositionModules.length > 0) {
  throw new Error(
    `Web application orchestration must live under apps/web/src/application, not pages: ${misplacedPageCompositionModules.join(", ")}`
  );
}

console.log(
  JSON.stringify(
    {
      status: "ok",
      check: "Web app composition budget",
      appPath,
      appLineCount,
      maxAppLines,
      featureBudgetCount: featureModuleBudgets.length,
      moduleCount: requiredModules.length
    },
    null,
    2
  )
);

async function collectSourceFiles(directoryPath) {
  const entries = await readdir(directoryPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = resolve(directoryPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectSourceFiles(entryPath)));
      continue;
    }

    if (/\.(?:ts|tsx|js|jsx|mjs)$/.test(entry.name)) {
      files.push(entryPath);
    }
  }

  return files;
}

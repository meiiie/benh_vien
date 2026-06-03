import { readdir, stat, readFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";

const appPath = resolve("apps/web/src/App.tsx");
const appDerivedContextPath = resolve("apps/web/src/application/appDerivedContext.ts");
const appNavigationPath = resolve("apps/web/src/config/appNavigation.ts");
const appRouteModelsPath = resolve("apps/web/src/application/appRouteModels.ts");
const appRoutePanelsPath = resolve("apps/web/src/application/appRoutePanels.ts");
const appRouteRendererPath = resolve("apps/web/src/pages/AppRouteRenderer.tsx");
const appRouteRendererTypesPath = resolve("apps/web/src/pages/AppRouteRendererTypes.ts");
const appShellPath = resolve("apps/web/src/components/AppShell.tsx");
const auditLogPagePath = resolve("apps/web/src/pages/AuditLogPage.tsx");
const auditPanelsPath = resolve("apps/web/src/features/audit/AuditPanels.tsx");
const globalAuditPanelPath = resolve("apps/web/src/features/audit/GlobalAuditPanel.tsx");
const patientAuditPanelPath = resolve("apps/web/src/features/audit/PatientAuditPanel.tsx");
const patientAuditActionsPath = resolve("apps/web/src/features/audit/PatientAuditActions.tsx");
const patientAuditEventListPath = resolve("apps/web/src/features/audit/PatientAuditEventList.tsx");
const patientAuditIntegrityCardPath = resolve(
  "apps/web/src/features/audit/PatientAuditIntegrityCard.tsx"
);
const dashboardPagePath = resolve("apps/web/src/pages/DashboardPage.tsx");
const documentsPagePath = resolve("apps/web/src/pages/DocumentsPage.tsx");
const interopPagePath = resolve("apps/web/src/pages/InteropPage.tsx");
const landingPagePath = resolve("apps/web/src/pages/LandingPage.tsx");
const loginPagePath = resolve("apps/web/src/pages/LoginPage.tsx");
const mainPath = resolve("apps/web/src/main.tsx");
const settingsPagePath = resolve("apps/web/src/pages/SettingsPage.tsx");
const workspacePagePath = resolve("apps/web/src/pages/WorkspacePage.tsx");
const stylesPath = resolve("apps/web/src/styles.css");
const landingStylesPath = resolve("apps/web/src/styles/landing.css");
const demoLoginPath = resolve("apps/web/src/auth/demoLogin.ts");
const webSrcPath = resolve("apps/web/src");
const allowedFetchModulePath = resolve("apps/web/src/api/clinicalApi.ts");
const fhirTransferContextSummaryPath = resolve(
  "apps/web/src/features/interoperability/FhirTransferContextSummary.tsx"
);
const fhirDocumentBundleSummaryPath = resolve(
  "apps/web/src/features/interoperability/FhirDocumentBundleSummary.tsx"
);
const gatewayAcknowledgementPagePath = resolve(
  "apps/web/src/pages/GatewayAcknowledgementPage.tsx"
);
const integrationGatewayRouteRendererPath = resolve(
  "apps/web/src/pages/IntegrationGatewayRouteRenderer.tsx"
);
const interopRouteRendererPath = resolve("apps/web/src/pages/InteropRouteRenderer.tsx");
const workspaceRouteRendererPath = resolve(
  "apps/web/src/pages/WorkspaceRouteRenderer.tsx"
);
const consentInteropPanelPath = resolve(
  "apps/web/src/features/consents/ConsentInteropPanel.tsx"
);
const providerDirectoryFormattersPath = resolve(
  "apps/web/src/features/provider-directory/providerDirectoryFormatters.ts"
);
const recordTransferListPath = resolve(
  "apps/web/src/features/record-transfers/RecordTransferList.tsx"
);
const recordTransferMetadataPath = resolve(
  "apps/web/src/features/record-transfers/RecordTransferMetadata.tsx"
);
const clinicalDocumentApiPath = resolve(
  "apps/web/src/features/clinical-documents/clinicalDocumentApi.ts"
);
const clinicalDocumentListPath = resolve(
  "apps/web/src/features/clinical-documents/ClinicalDocumentList.tsx"
);
const clinicalDocumentPanelPath = resolve(
  "apps/web/src/features/clinical-documents/ClinicalDocumentPanel.tsx"
);
const clinicalDocumentSummaryPath = resolve(
  "apps/web/src/features/clinical-documents/ClinicalDocumentSummary.tsx"
);
const encounterPanelPath = resolve("apps/web/src/features/clinical-records/EncounterPanel.tsx");
const patientRegistryApiPath = resolve(
  "apps/web/src/features/patient-registry/patientRegistryApi.ts"
);
const patientDetailPanelPath = resolve(
  "apps/web/src/features/patient-registry/PatientDetailPanel.tsx"
);
const sharedClinicalFormatterPath = resolve("apps/web/src/lib/clinicalFormatters.ts");
const clinicalTypeBarrelImportPattern =
  /(?:from|import\s*\()\s*["'][^"']*types\/clinical\.js["']/;
const webLayerImportRules = [
  {
    sourcePrefix: "apps/web/src/application/",
    forbiddenTargetPrefixes: [
      "apps/web/src/App",
      "apps/web/src/main",
      "apps/web/src/components/",
      "apps/web/src/pages/"
    ],
    message:
      "Application composition must depend on API/auth/config/features/types, not UI shell or page modules."
  },
  {
    sourcePrefix: "apps/web/src/features/",
    forbiddenTargetPrefixes: [
      "apps/web/src/App",
      "apps/web/src/main",
      "apps/web/src/application/",
      "apps/web/src/pages/"
    ],
    message:
      "Feature modules must stay reusable below page/application orchestration."
  },
  {
    sourcePrefix: "apps/web/src/components/",
    forbiddenTargetPrefixes: [
      "apps/web/src/App",
      "apps/web/src/main",
      "apps/web/src/application/",
      "apps/web/src/features/",
      "apps/web/src/pages/"
    ],
    message:
      "Shared components must not depend on feature, application or page modules."
  },
  {
    sourcePrefix: "apps/web/src/types/",
    forbiddenTargetPrefixes: [
      "apps/web/src/App",
      "apps/web/src/main",
      "apps/web/src/application/",
      "apps/web/src/components/",
      "apps/web/src/features/",
      "apps/web/src/pages/"
    ],
    message:
      "Type modules must remain a low-level contract surface."
  },
  {
    sourcePrefix: "apps/web/src/lib/",
    forbiddenTargetPrefixes: [
      "apps/web/src/App",
      "apps/web/src/main",
      "apps/web/src/application/",
      "apps/web/src/components/",
      "apps/web/src/features/",
      "apps/web/src/pages/"
    ],
    message:
      "Shared lib modules must stay UI-layer independent."
  },
  {
    sourcePrefix: "apps/web/src/api/",
    forbiddenTargetPrefixes: [
      "apps/web/src/App",
      "apps/web/src/main",
      "apps/web/src/application/",
      "apps/web/src/components/",
      "apps/web/src/features/",
      "apps/web/src/pages/"
    ],
    message:
      "API client modules must stay below feature and UI orchestration."
  },
  {
    sourcePrefix: "apps/web/src/config/",
    forbiddenTargetPrefixes: [
      "apps/web/src/App",
      "apps/web/src/main",
      "apps/web/src/application/",
      "apps/web/src/components/",
      "apps/web/src/features/",
      "apps/web/src/pages/"
    ],
    message:
      "Configuration modules must not depend on runtime feature or UI layers."
  },
  {
    sourcePrefix: "apps/web/src/auth/",
    forbiddenTargetPrefixes: [
      "apps/web/src/App",
      "apps/web/src/main",
      "apps/web/src/application/",
      "apps/web/src/components/",
      "apps/web/src/features/",
      "apps/web/src/pages/"
    ],
    message:
      "Auth modules must stay below feature and UI orchestration."
  }
];
const requiredModules = [
  "apps/web/src/api/clinicalApi.ts",
  "apps/web/src/auth/authApi.ts",
  "apps/web/src/auth/demoLogin.ts",
  "apps/web/src/application/appAuditLoaders.ts",
  "apps/web/src/application/appAuthSessionHandlers.ts",
  "apps/web/src/application/appClinicalRecordHandlers.ts",
  "apps/web/src/application/appClinicalRecordPanelHandlers.ts",
  "apps/web/src/application/appDerivedContext.ts",
  "apps/web/src/application/appFhirPreviewLoaders.ts",
  "apps/web/src/application/appLifecycleEffects.ts",
  "apps/web/src/application/appPanelComposition.ts",
  "apps/web/src/application/appPatientRegistryHandlers.ts",
  "apps/web/src/application/appPatientRegistryLoaders.ts",
  "apps/web/src/application/appPatientWorkspaceLifecycle.ts",
  "apps/web/src/application/appPatientWorkspaceLoaders.ts",
  "apps/web/src/application/appPlatformLoaders.ts",
  "apps/web/src/application/appRecordTransferHandlers.ts",
  "apps/web/src/application/appRouteModels.ts",
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
  "apps/web/src/config/appNavigation.ts",
  "apps/web/src/config/demoCareWorkflowDefaults.ts",
  "apps/web/src/config/demoClinicalDefaults.ts",
  "apps/web/src/config/demoClinicalEntryDefaults.ts",
  "apps/web/src/config/demoMedicationDefaults.ts",
  "apps/web/src/config/demoPatientDefaults.ts",
  "apps/web/src/config/demoReferenceContent.ts",
  "apps/web/src/config/demoTransferDefaults.ts",
  "apps/web/src/features/audit/AuditPanels.tsx",
  "apps/web/src/features/audit/GlobalAuditPanel.tsx",
  "apps/web/src/features/audit/PatientAuditActions.tsx",
  "apps/web/src/features/audit/PatientAuditEventList.tsx",
  "apps/web/src/features/audit/PatientAuditIntegrityCard.tsx",
  "apps/web/src/features/audit/PatientAuditPanel.tsx",
  "apps/web/src/features/audit/auditPanelRenderers.tsx",
  "apps/web/src/features/audit/auditApi.ts",
  "apps/web/src/features/clinical-documents/ClinicalDocumentForm.tsx",
  "apps/web/src/features/clinical-documents/ClinicalDocumentList.tsx",
  "apps/web/src/features/clinical-documents/ClinicalDocumentPanel.tsx",
  "apps/web/src/features/clinical-documents/ClinicalDocumentSummary.tsx",
  "apps/web/src/features/clinical-documents/clinicalDocumentApi.ts",
  "apps/web/src/features/clinical-documents/clinicalDocumentCommandBuilders.ts",
  "apps/web/src/features/clinical-documents/clinicalDocumentFormatters.ts",
  "apps/web/src/features/clinical-documents/clinicalDocumentPanelRenderers.tsx",
  "apps/web/src/features/clinical-records/AllergyIntoleranceClassificationFields.tsx",
  "apps/web/src/features/clinical-records/AllergyIntoleranceCodeFields.tsx",
  "apps/web/src/features/clinical-records/AllergyIntoleranceContextFields.tsx",
  "apps/web/src/features/clinical-records/AllergyIntoleranceForm.tsx",
  "apps/web/src/features/clinical-records/AllergyIntoleranceNoteFields.tsx",
  "apps/web/src/features/clinical-records/AllergyIntolerancePanel.tsx",
  "apps/web/src/features/clinical-records/AllergyIntoleranceReactionFields.tsx",
  "apps/web/src/features/clinical-records/AllergyIntoleranceRecordFields.tsx",
  "apps/web/src/features/clinical-records/allergyIntoleranceHandlers.ts",
  "apps/web/src/features/clinical-records/allergyFormatters.ts",
  "apps/web/src/features/clinical-records/carePlanCommandBuilders.ts",
  "apps/web/src/features/clinical-records/carePlanHandlers.ts",
  "apps/web/src/features/clinical-records/carePlanHandlerTypes.ts",
  "apps/web/src/features/clinical-records/careWorkflowFormatterPrimitives.ts",
  "apps/web/src/features/clinical-records/careWorkflowFormatters.ts",
  "apps/web/src/features/clinical-records/careWorkflowHandlers.ts",
  "apps/web/src/features/clinical-records/clinicalEntryCommandBuilders.ts",
  "apps/web/src/features/clinical-records/clinicalEntryHandlers.ts",
  "apps/web/src/features/clinical-records/clinicalEntryHandlerTypes.ts",
  "apps/web/src/features/clinical-records/clinicalRecordCorePanelRenderers.tsx",
  "apps/web/src/features/clinical-records/clinicalRecordDiagnosticPanelRenderers.tsx",
  "apps/web/src/features/clinical-records/clinicalRecordMedicationPanelRenderers.tsx",
  "apps/web/src/features/clinical-records/clinicalRecordPanelRenderers.tsx",
  "apps/web/src/features/clinical-records/clinicalRecordPanelRendererTypes.ts",
  "apps/web/src/features/clinical-records/clinicalRecordPanelRendererDataTypes.ts",
  "apps/web/src/features/clinical-records/clinicalRecordPanelRendererCommandTypes.ts",
  "apps/web/src/features/clinical-records/clinicalRecordPanelRendererStatusTypes.ts",
  "apps/web/src/features/clinical-records/ConditionForm.tsx",
  "apps/web/src/features/clinical-records/ConditionPanel.tsx",
  "apps/web/src/features/clinical-records/conditionHandlers.ts",
  "apps/web/src/features/clinical-records/conditionFormatters.ts",
  "apps/web/src/features/clinical-records/diagnosticResultFormatters.ts",
  "apps/web/src/features/clinical-records/diagnosticResultHandlers.ts",
  "apps/web/src/features/clinical-records/diagnosticReportCommandBuilders.ts",
  "apps/web/src/features/clinical-records/DiagnosticReportClassificationFields.tsx",
  "apps/web/src/features/clinical-records/DiagnosticReportConclusionFields.tsx",
  "apps/web/src/features/clinical-records/DiagnosticReportContextFields.tsx",
  "apps/web/src/features/clinical-records/DiagnosticReportForm.tsx",
  "apps/web/src/features/clinical-records/DiagnosticReportObservationFields.tsx",
  "apps/web/src/features/clinical-records/DiagnosticReportPanel.tsx",
  "apps/web/src/features/clinical-records/DiagnosticReportPerformerFields.tsx",
  "apps/web/src/features/clinical-records/DiagnosticReportTimingFields.tsx",
  "apps/web/src/features/clinical-records/EncounterForm.tsx",
  "apps/web/src/features/clinical-records/EncounterPanel.tsx",
  "apps/web/src/features/clinical-records/EncounterPanelTypes.ts",
  "apps/web/src/features/clinical-records/EncounterSummary.tsx",
  "apps/web/src/features/clinical-records/EncounterTimeline.tsx",
  "apps/web/src/features/clinical-records/encounterFormatters.ts",
  "apps/web/src/features/clinical-records/encounterScopedFormUpdater.ts",
  "apps/web/src/features/clinical-records/encounterSelectors.ts",
  "apps/web/src/features/clinical-records/ImagingStudyContextFields.tsx",
  "apps/web/src/features/clinical-records/ImagingStudyForm.tsx",
  "apps/web/src/features/clinical-records/ImagingStudyPanel.tsx",
  "apps/web/src/features/clinical-records/ImagingStudyParticipantFields.tsx",
  "apps/web/src/features/clinical-records/ImagingStudySeriesDetailFields.tsx",
  "apps/web/src/features/clinical-records/ImagingStudySeriesReferenceFields.tsx",
  "apps/web/src/features/clinical-records/ImagingStudyStudyIdentityFields.tsx",
  "apps/web/src/features/clinical-records/imagingStudyCommandBuilders.ts",
  "apps/web/src/features/clinical-records/MedicationAdministrationContextFields.tsx",
  "apps/web/src/features/clinical-records/MedicationAdministrationDosageFields.tsx",
  "apps/web/src/features/clinical-records/MedicationAdministrationForm.tsx",
  "apps/web/src/features/clinical-records/MedicationAdministrationList.tsx",
  "apps/web/src/features/clinical-records/MedicationAdministrationPanel.tsx",
  "apps/web/src/features/clinical-records/MedicationAdministrationPerformerFields.tsx",
  "apps/web/src/features/clinical-records/MedicationAdministrationSummary.tsx",
  "apps/web/src/features/clinical-records/MedicationDispenseContextFields.tsx",
  "apps/web/src/features/clinical-records/MedicationDispenseDosageFields.tsx",
  "apps/web/src/features/clinical-records/MedicationDispenseForm.tsx",
  "apps/web/src/features/clinical-records/MedicationDispenseList.tsx",
  "apps/web/src/features/clinical-records/MedicationDispensePanel.tsx",
  "apps/web/src/features/clinical-records/MedicationDispenseSummary.tsx",
  "apps/web/src/features/clinical-records/MedicationDispenseSupplyFields.tsx",
  "apps/web/src/features/clinical-records/MedicationRequestForm.tsx",
  "apps/web/src/features/clinical-records/MedicationRequestContextFields.tsx",
  "apps/web/src/features/clinical-records/MedicationRequestReferenceFields.tsx",
  "apps/web/src/features/clinical-records/MedicationRequestClassificationFields.tsx",
  "apps/web/src/features/clinical-records/MedicationRequestMedicationFields.tsx",
  "apps/web/src/features/clinical-records/MedicationRequestDrugCodeFields.tsx",
  "apps/web/src/features/clinical-records/MedicationRequestDosageTimingFields.tsx",
  "apps/web/src/features/clinical-records/MedicationRequestPrescriptionFields.tsx",
  "apps/web/src/features/clinical-records/MedicationRequestPanel.tsx",
  "apps/web/src/features/clinical-records/medicationAdministrationHandlers.ts",
  "apps/web/src/features/clinical-records/medicationAdministrationFormatters.ts",
  "apps/web/src/features/clinical-records/medicationDispenseHandlers.ts",
  "apps/web/src/features/clinical-records/medicationDispenseFormatters.ts",
  "apps/web/src/features/clinical-records/medicationFormatterPrimitives.ts",
  "apps/web/src/features/clinical-records/medicationFormatters.ts",
  "apps/web/src/features/clinical-records/medicationHandlers.ts",
  "apps/web/src/features/clinical-records/medicationHandlerTypes.ts",
  "apps/web/src/features/clinical-records/medicationRequestHandlers.ts",
  "apps/web/src/features/clinical-records/medicationRequestFormatters.ts",
  "apps/web/src/features/clinical-records/medicationAdministrationCommandBuilders.ts",
  "apps/web/src/features/clinical-records/medicationCommandBuilders.ts",
  "apps/web/src/features/clinical-records/medicationDispenseCommandBuilders.ts",
  "apps/web/src/features/clinical-records/medicationRequestCommandBuilders.ts",
  "apps/web/src/features/clinical-records/ObservationForm.tsx",
  "apps/web/src/features/clinical-records/ObservationPanel.tsx",
  "apps/web/src/features/clinical-records/observationHandlers.ts",
  "apps/web/src/features/clinical-records/procedureCommandBuilders.ts",
  "apps/web/src/features/clinical-records/procedureFormatters.ts",
  "apps/web/src/features/clinical-records/ProcedureClassificationFields.tsx",
  "apps/web/src/features/clinical-records/ProcedureCodeFields.tsx",
  "apps/web/src/features/clinical-records/ProcedureContextFields.tsx",
  "apps/web/src/features/clinical-records/ProcedureForm.tsx",
  "apps/web/src/features/clinical-records/ProcedureOutcomeFields.tsx",
  "apps/web/src/features/clinical-records/ProcedurePanel.tsx",
  "apps/web/src/features/clinical-records/ProcedurePerformerFields.tsx",
  "apps/web/src/features/clinical-records/ProcedureTimingFields.tsx",
  "apps/web/src/features/clinical-records/serviceRequestCommandBuilders.ts",
  "apps/web/src/features/clinical-records/serviceRequestFormatters.ts",
  "apps/web/src/features/clinical-records/ServiceRequestForm.tsx",
  "apps/web/src/features/clinical-records/ServiceRequestPanel.tsx",
  "apps/web/src/features/clinical-records/WorkflowTaskPanel.tsx",
  "apps/web/src/features/clinical-records/workflowTaskFormatters.ts",
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
  "apps/web/src/features/interoperability/FhirTransferContextSummary.tsx",
  "apps/web/src/features/fhir-preview/clinicalResourceFhirPreviewLoaders.ts",
  "apps/web/src/features/fhir-preview/documentConsentFhirPreviewLoaders.ts",
  "apps/web/src/features/fhir-preview/fhirPreviewLoaderFactory.ts",
  "apps/web/src/features/fhir-preview/fhirPreviewLoaders.ts",
  "apps/web/src/features/fhir-preview/fhirPreviewLoaderTypes.ts",
  "apps/web/src/features/fhir-preview/operationalFhirPreviewLoaders.ts",
  "apps/web/src/features/fhir-preview/patientFhirPreviewLoaders.ts",
  "apps/web/src/features/fhir-preview/selectedClinicalResourceFhirPreviewEffects.ts",
  "apps/web/src/features/fhir-preview/selectedDocumentFhirPreviewEffect.ts",
  "apps/web/src/features/fhir-preview/selectedFhirPreviewEffects.ts",
  "apps/web/src/features/fhir-preview/selectedFhirPreviewEffectTypes.ts",
  "apps/web/src/features/fhir-preview/selectedPreviewEffectHook.ts",
  "apps/web/src/features/fhir-preview/selectedRecordTransferFhirPreviewEffect.ts",
  "apps/web/src/features/interoperability/FhirDocumentBundleSummary.tsx",
  "apps/web/src/features/interoperability/fhirDocumentBundleSummaryModel.ts",
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
  "apps/web/src/features/patient-workspace/patientWorkspaceCareWorkflowCollectionLoaders.ts",
  "apps/web/src/features/patient-workspace/patientWorkspaceCollectionLoaderFactory.ts",
  "apps/web/src/features/patient-workspace/patientWorkspaceCollectionLoaderTypes.ts",
  "apps/web/src/features/patient-workspace/patientWorkspaceCollectionLoaders.ts",
  "apps/web/src/features/patient-workspace/patientWorkspaceCoreCollectionLoaders.ts",
  "apps/web/src/features/patient-workspace/patientWorkspaceDocumentCollectionLoaders.ts",
  "apps/web/src/features/patient-workspace/patientWorkspaceLifecycle.ts",
  "apps/web/src/features/patient-workspace/patientWorkspaceMedicationCollectionLoaders.ts",
  "apps/web/src/features/patient-workspace/patientWorkspaceReset.ts",
  "apps/web/src/features/platform/platformApi.ts",
  "apps/web/src/features/provider-directory/ProviderDirectoryPanel.tsx",
  "apps/web/src/features/provider-directory/providerDirectoryApi.ts",
  "apps/web/src/features/provider-directory/providerDirectoryFormatters.ts",
  "apps/web/src/features/record-transfers/RecordTransferActions.tsx",
  "apps/web/src/features/record-transfers/RecordTransferDeliveryAttemptList.tsx",
  "apps/web/src/features/record-transfers/RecordTransferForm.tsx",
  "apps/web/src/features/record-transfers/RecordTransferInteropPanel.tsx",
  "apps/web/src/features/record-transfers/RecordTransferList.tsx",
  "apps/web/src/features/record-transfers/RecordTransferMetadata.tsx",
  "apps/web/src/features/record-transfers/RecordTransferOperationalSummary.tsx",
  "apps/web/src/features/record-transfers/recordTransferApi.ts",
  "apps/web/src/features/record-transfers/recordTransferCommandBuilders.ts",
  "apps/web/src/features/record-transfers/recordTransferCreateHandler.ts",
  "apps/web/src/features/record-transfers/recordTransferFormatters.ts",
  "apps/web/src/features/record-transfers/recordTransferGatewayHandler.ts",
  "apps/web/src/features/record-transfers/recordTransferHandlers.ts",
  "apps/web/src/features/record-transfers/recordTransferHandlerTypes.ts",
  "apps/web/src/features/record-transfers/recordTransferLabelFormatters.ts",
  "apps/web/src/features/record-transfers/recordTransferLifecycleHandlers.ts",
  "apps/web/src/features/record-transfers/recordTransferLoaderHelpers.ts",
  "apps/web/src/features/record-transfers/recordTransferOperationalSummaryMetrics.ts",
  "apps/web/src/features/record-transfers/recordTransferOperationalSummaryModel.ts",
  "apps/web/src/features/record-transfers/recordTransferOperationalSummaryStateModel.ts",
  "apps/web/src/features/record-transfers/recordTransferOperationalSummaryTypes.ts",
  "apps/web/src/lib/auditFormatters.ts",
  "apps/web/src/lib/clinicalFormatters.ts",
  "apps/web/src/lib/commandDrafts.ts",
  "apps/web/src/lib/fhirPreviewLoader.ts",
  "apps/web/src/lib/patientScopedCollectionLoader.ts",
  "apps/web/src/pages/AuthenticatedAppExperience.tsx",
  "apps/web/src/pages/AppRouteRenderer.tsx",
  "apps/web/src/pages/AppRouteRendererTypes.ts",
  "apps/web/src/pages/AuditLogPage.tsx",
  "apps/web/src/pages/DashboardPage.tsx",
  "apps/web/src/pages/DocumentsPage.tsx",
  "apps/web/src/pages/GatewayAcknowledgementPage.tsx",
  "apps/web/src/pages/IntegrationGatewayRouteRenderer.tsx",
  "apps/web/src/pages/InteropRouteRenderer.tsx",
  "apps/web/src/pages/InteropPage.tsx",
  "apps/web/src/pages/LandingPage.tsx",
  "apps/web/src/pages/LoginPage.tsx",
  "apps/web/src/pages/PublicAppExperience.tsx",
  "apps/web/src/pages/SettingsPage.tsx",
  "apps/web/src/pages/WorkspaceRouteRenderer.tsx",
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
  "apps/web/src/pages/appClinicalRecordPanelHandlers.ts",
  "apps/web/src/pages/appDerivedContext.ts",
  "apps/web/src/pages/appFhirPreviewLoaders.ts",
  "apps/web/src/pages/appLifecycleEffects.ts",
  "apps/web/src/pages/appPanelComposition.ts",
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
const maxAppLines = 650;
const featureModuleBudgets = [
  {
    path: "apps/web/src/application/appClinicalRecordPanelHandlers.ts",
    maxLines: 100,
    role: "Clinical record panel command and selection handler mapping"
  },
  {
    path: "apps/web/src/application/appPanelComposition.ts",
    maxLines: 170,
    role: "Application panel composition boundary for route renderers"
  },
  {
    path: "apps/web/src/application/appRuntimeEffects.ts",
    maxLines: 150,
    role: "Runtime effect composition with grouped loader contracts"
  },
  {
    path: "apps/web/src/application/appPatientWorkspaceLifecycle.ts",
    maxLines: 110,
    role: "Patient workspace lifecycle composition with grouped loader contracts"
  },
  {
    path: "apps/web/src/application/appClinicalRecordHandlers.ts",
    maxLines: 140,
    role: "Clinical record command handler composition with grouped loader contracts"
  },
  {
    path: "apps/web/src/config/demoClinicalDefaults.ts",
    maxLines: 20,
    role: "Demo defaults compatibility barrel"
  },
  {
    path: "apps/web/src/config/demoPatientDefaults.ts",
    maxLines: 40,
    role: "Demo patient registry defaults"
  },
  {
    path: "apps/web/src/config/demoClinicalEntryDefaults.ts",
    maxLines: 90,
    role: "Demo encounter, document, allergy, condition and observation defaults"
  },
  {
    path: "apps/web/src/config/demoMedicationDefaults.ts",
    maxLines: 90,
    role: "Demo medication workflow defaults"
  },
  {
    path: "apps/web/src/config/demoCareWorkflowDefaults.ts",
    maxLines: 120,
    role: "Demo care workflow, diagnostics and imaging defaults"
  },
  {
    path: "apps/web/src/config/demoTransferDefaults.ts",
    maxLines: 50,
    role: "Demo record-transfer and gateway acknowledgement defaults"
  },
  {
    path: "apps/web/src/config/demoReferenceContent.ts",
    maxLines: 70,
    role: "Demo workflow and reference signal content"
  },
  {
    path: "apps/web/src/features/patient-workspace/patientWorkspaceLifecycle.ts",
    maxLines: 170,
    role: "Patient workspace load orchestration"
  },
  {
    path: "apps/web/src/features/patient-workspace/patientWorkspaceReset.ts",
    maxLines: 180,
    role: "Patient workspace reset state boundary"
  },
  {
    path: "apps/web/src/features/patient-workspace/patientWorkspaceCollectionLoaderFactory.ts",
    maxLines: 70,
    role: "Patient-scoped collection loader factory"
  },
  {
    path: "apps/web/src/features/patient-workspace/patientWorkspaceCollectionLoaders.ts",
    maxLines: 30,
    role: "Patient-scoped EMR collection loader composition"
  },
  {
    path: "apps/web/src/features/patient-workspace/patientWorkspaceCollectionLoaderTypes.ts",
    maxLines: 85,
    role: "Patient-scoped collection loader state contracts"
  },
  {
    path: "apps/web/src/features/patient-workspace/patientWorkspaceCoreCollectionLoaders.ts",
    maxLines: 70,
    role: "Patient workspace core EMR collection loaders"
  },
  {
    path: "apps/web/src/features/patient-workspace/patientWorkspaceMedicationCollectionLoaders.ts",
    maxLines: 60,
    role: "Patient workspace medication collection loaders"
  },
  {
    path: "apps/web/src/features/patient-workspace/patientWorkspaceCareWorkflowCollectionLoaders.ts",
    maxLines: 80,
    role: "Patient workspace care workflow and diagnostic collection loaders"
  },
  {
    path: "apps/web/src/features/patient-workspace/patientWorkspaceDocumentCollectionLoaders.ts",
    maxLines: 35,
    role: "Patient workspace clinical document collection loaders"
  },
  {
    path: "apps/web/src/features/fhir-preview/fhirPreviewLoaderFactory.ts",
    maxLines: 50,
    role: "FHIR preview loader factory"
  },
  {
    path: "apps/web/src/features/fhir-preview/fhirPreviewLoaders.ts",
    maxLines: 60,
    role: "FHIR preview loader composition factory"
  },
  {
    path: "apps/web/src/features/fhir-preview/fhirPreviewLoaderTypes.ts",
    maxLines: 70,
    role: "FHIR preview loader configuration and builder types"
  },
  {
    path: "apps/web/src/features/fhir-preview/clinicalResourceFhirPreviewLoaders.ts",
    maxLines: 130,
    role: "Clinical resource FHIR preview loaders"
  },
  {
    path: "apps/web/src/features/fhir-preview/documentConsentFhirPreviewLoaders.ts",
    maxLines: 60,
    role: "DocumentReference, Provenance and Consent FHIR preview loaders"
  },
  {
    path: "apps/web/src/features/fhir-preview/patientFhirPreviewLoaders.ts",
    maxLines: 70,
    role: "Patient and patient Bundle FHIR preview loaders"
  },
  {
    path: "apps/web/src/features/fhir-preview/operationalFhirPreviewLoaders.ts",
    maxLines: 90,
    role: "Audit, provider directory and record-transfer FHIR preview loaders"
  },
  {
    path: "apps/web/src/features/fhir-preview/selectedFhirPreviewEffects.ts",
    maxLines: 30,
    role: "Selected FHIR preview effect composition"
  },
  {
    path: "apps/web/src/features/fhir-preview/selectedFhirPreviewEffectTypes.ts",
    maxLines: 80,
    role: "Selected FHIR preview effect contracts"
  },
  {
    path: "apps/web/src/features/fhir-preview/selectedPreviewEffectHook.ts",
    maxLines: 30,
    role: "Selected FHIR preview shared hook"
  },
  {
    path: "apps/web/src/features/fhir-preview/selectedDocumentFhirPreviewEffect.ts",
    maxLines: 40,
    role: "Selected DocumentReference and Provenance preview effect"
  },
  {
    path: "apps/web/src/features/fhir-preview/selectedClinicalResourceFhirPreviewEffects.ts",
    maxLines: 80,
    role: "Selected clinical resource FHIR preview effects"
  },
  {
    path: "apps/web/src/features/fhir-preview/selectedRecordTransferFhirPreviewEffect.ts",
    maxLines: 50,
    role: "Selected record-transfer FHIR Task and delivery-attempt effect"
  },
  {
    path: "apps/web/src/pages/AuthenticatedAppExperience.tsx",
    maxLines: 60,
    role: "Authenticated layout and route rendering shell"
  },
  {
    path: "apps/web/src/pages/PublicAppExperience.tsx",
    maxLines: 50,
    role: "Public landing and login route shell"
  },
  {
    path: "apps/web/src/pages/AppRouteRenderer.tsx",
    maxLines: 100,
    role: "Authenticated route shell composition"
  },
  {
    path: "apps/web/src/pages/AppRouteRendererTypes.ts",
    maxLines: 70,
    role: "Authenticated route renderer contract"
  },
  {
    path: "apps/web/src/pages/IntegrationGatewayRouteRenderer.tsx",
    maxLines: 50,
    role: "Integration gateway route renderer"
  },
  {
    path: "apps/web/src/pages/WorkspaceRouteRenderer.tsx",
    maxLines: 60,
    role: "Workspace route panel composition"
  },
  {
    path: "apps/web/src/pages/InteropRouteRenderer.tsx",
    maxLines: 80,
    role: "Interop route FHIR preview composition"
  },
  {
    path: "apps/web/src/features/audit/AuditPanels.tsx",
    maxLines: 20,
    role: "Audit panel compatibility barrel"
  },
  {
    path: "apps/web/src/features/audit/GlobalAuditPanel.tsx",
    maxLines: 140,
    role: "Global audit log panel"
  },
  {
    path: "apps/web/src/features/audit/PatientAuditActions.tsx",
    maxLines: 70,
    role: "Patient audit action toolbar"
  },
  {
    path: "apps/web/src/features/audit/PatientAuditIntegrityCard.tsx",
    maxLines: 70,
    role: "Patient audit integrity report card"
  },
  {
    path: "apps/web/src/features/audit/PatientAuditEventList.tsx",
    maxLines: 90,
    role: "Patient audit event list"
  },
  {
    path: "apps/web/src/features/audit/PatientAuditPanel.tsx",
    maxLines: 100,
    role: "Patient-scoped audit log and FHIR preview panel"
  },
  {
    path: "apps/web/src/features/clinical-documents/ClinicalDocumentPanel.tsx",
    maxLines: 110,
    role: "Clinical document panel composition"
  },
  {
    path: "apps/web/src/features/clinical-documents/ClinicalDocumentList.tsx",
    maxLines: 80,
    role: "Clinical document selectable list"
  },
  {
    path: "apps/web/src/features/clinical-documents/ClinicalDocumentSummary.tsx",
    maxLines: 100,
    role: "Clinical document metadata and signing summary"
  },
  {
    path: "apps/web/src/features/clinical-documents/ClinicalDocumentForm.tsx",
    maxLines: 180,
    role: "Clinical document metadata and attachment command form"
  },
  {
    path: "apps/web/src/features/clinical-records/EncounterPanel.tsx",
    maxLines: 90,
    role: "Encounter panel composition"
  },
  {
    path: "apps/web/src/features/clinical-records/EncounterPanelTypes.ts",
    maxLines: 30,
    role: "Encounter panel count types"
  },
  {
    path: "apps/web/src/features/clinical-records/EncounterTimeline.tsx",
    maxLines: 80,
    role: "Encounter selectable timeline"
  },
  {
    path: "apps/web/src/features/clinical-records/EncounterSummary.tsx",
    maxLines: 120,
    role: "Encounter selected record summary and finish action"
  },
  {
    path: "apps/web/src/features/clinical-records/EncounterForm.tsx",
    maxLines: 90,
    role: "Encounter creation command form"
  },
  {
    path: "apps/web/src/features/record-transfers/RecordTransferInteropPanel.tsx",
    maxLines: 160,
    role: "Record transfer panel composition"
  },
  {
    path: "apps/web/src/features/interoperability/FhirDocumentBundleSummary.tsx",
    maxLines: 160,
    role: "FHIR document Bundle readiness summary"
  },
  {
    path: "apps/web/src/features/interoperability/FhirTransferContextSummary.tsx",
    maxLines: 130,
    role: "FHIR record-transfer context summary"
  },
  {
    path: "apps/web/src/features/interoperability/fhirDocumentBundleSummaryModel.ts",
    maxLines: 120,
    role: "FHIR document Bundle summary parser"
  },
  {
    path: "apps/web/src/features/record-transfers/RecordTransferList.tsx",
    maxLines: 70,
    role: "Record transfer package list UI"
  },
  {
    path: "apps/web/src/features/record-transfers/RecordTransferMetadata.tsx",
    maxLines: 90,
    role: "Record transfer operational metadata grid"
  },
  {
    path: "apps/web/src/features/record-transfers/RecordTransferActions.tsx",
    maxLines: 110,
    role: "Record transfer lifecycle action buttons"
  },
  {
    path: "apps/web/src/features/record-transfers/RecordTransferForm.tsx",
    maxLines: 150,
    role: "Record transfer creation command form"
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
    path: "apps/web/src/features/record-transfers/recordTransferHandlers.ts",
    maxLines: 60,
    role: "Record transfer handler composition"
  },
  {
    path: "apps/web/src/features/record-transfers/recordTransferHandlerTypes.ts",
    maxLines: 70,
    role: "Record transfer handler state and helper contracts"
  },
  {
    path: "apps/web/src/features/record-transfers/recordTransferCreateHandler.ts",
    maxLines: 70,
    role: "Record transfer creation command handler"
  },
  {
    path: "apps/web/src/features/record-transfers/recordTransferGatewayHandler.ts",
    maxLines: 70,
    role: "Record transfer gateway acknowledgement handler"
  },
  {
    path: "apps/web/src/features/record-transfers/recordTransferLifecycleHandlers.ts",
    maxLines: 160,
    role: "Record transfer lifecycle transition handlers"
  },
  {
    path: "apps/web/src/features/record-transfers/recordTransferFormatters.ts",
    maxLines: 20,
    role: "Record transfer formatter compatibility barrel"
  },
  {
    path: "apps/web/src/features/record-transfers/recordTransferLabelFormatters.ts",
    maxLines: 80,
    role: "Record transfer label formatters"
  },
  {
    path: "apps/web/src/features/record-transfers/recordTransferLoaderHelpers.ts",
    maxLines: 50,
    role: "Record transfer loader selection and compatibility helpers"
  },
  {
    path: "apps/web/src/features/record-transfers/recordTransferOperationalSummaryModel.ts",
    maxLines: 40,
    role: "Record transfer operational summary composition"
  },
  {
    path: "apps/web/src/features/record-transfers/recordTransferOperationalSummaryTypes.ts",
    maxLines: 60,
    role: "Record transfer operational summary view model types"
  },
  {
    path: "apps/web/src/features/record-transfers/recordTransferOperationalSummaryMetrics.ts",
    maxLines: 80,
    role: "Record transfer delivery attempt metrics and technical signals"
  },
  {
    path: "apps/web/src/features/record-transfers/recordTransferOperationalSummaryStateModel.ts",
    maxLines: 180,
    role: "Record transfer status-specific operational summary messages"
  },
  {
    path: "apps/web/src/features/clinical-records/clinicalRecordPanelRenderers.tsx",
    maxLines: 40,
    role: "Clinical record panel renderer composition"
  },
  {
    path: "apps/web/src/features/clinical-records/clinicalRecordCorePanelRenderers.tsx",
    maxLines: 110,
    role: "Clinical record encounter, problem and observation panel renderers"
  },
  {
    path: "apps/web/src/features/clinical-records/clinicalRecordDiagnosticPanelRenderers.tsx",
    maxLines: 130,
    role: "Clinical record diagnostic, procedure and workflow panel renderers"
  },
  {
    path: "apps/web/src/features/clinical-records/clinicalRecordMedicationPanelRenderers.tsx",
    maxLines: 95,
    role: "Clinical record medication panel renderers"
  },
  {
    path: "apps/web/src/features/clinical-records/clinicalRecordPanelRendererTypes.ts",
    maxLines: 80,
    role: "Clinical record panel renderer public type composition"
  },
  {
    path: "apps/web/src/features/clinical-records/clinicalRecordPanelRendererDataTypes.ts",
    maxLines: 90,
    role: "Clinical record panel collection and selection type contracts"
  },
  {
    path: "apps/web/src/features/clinical-records/clinicalRecordPanelRendererCommandTypes.ts",
    maxLines: 110,
    role: "Clinical record panel form and handler type contracts"
  },
  {
    path: "apps/web/src/features/clinical-records/clinicalRecordPanelRendererStatusTypes.ts",
    maxLines: 50,
    role: "Clinical record panel loading and submitting type contracts"
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
    path: "apps/web/src/features/clinical-records/clinicalEntryHandlers.ts",
    maxLines: 60,
    role: "Clinical entry submit handler composition factory"
  },
  {
    path: "apps/web/src/features/clinical-records/clinicalEntryHandlerTypes.ts",
    maxLines: 80,
    role: "Clinical entry submit handler configuration and event types"
  },
  {
    path: "apps/web/src/features/clinical-records/allergyIntoleranceHandlers.ts",
    maxLines: 100,
    role: "AllergyIntolerance safety submit handler"
  },
  {
    path: "apps/web/src/features/clinical-records/conditionHandlers.ts",
    maxLines: 90,
    role: "Condition diagnosis submit handler"
  },
  {
    path: "apps/web/src/features/clinical-records/observationHandlers.ts",
    maxLines: 100,
    role: "Observation clinical measurement submit handler"
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
    path: "apps/web/src/features/clinical-records/medicationHandlers.ts",
    maxLines: 60,
    role: "Medication submit handler composition factory"
  },
  {
    path: "apps/web/src/features/clinical-records/medicationHandlerTypes.ts",
    maxLines: 80,
    role: "Medication submit handler configuration and event types"
  },
  {
    path: "apps/web/src/features/clinical-records/medicationRequestHandlers.ts",
    maxLines: 100,
    role: "MedicationRequest prescribing submit handler"
  },
  {
    path: "apps/web/src/features/clinical-records/medicationDispenseHandlers.ts",
    maxLines: 110,
    role: "MedicationDispense supply submit handler"
  },
  {
    path: "apps/web/src/features/clinical-records/medicationAdministrationHandlers.ts",
    maxLines: 120,
    role: "MedicationAdministration actual-use submit handler"
  },
  {
    path: "apps/web/src/features/clinical-records/medicationFormatters.ts",
    maxLines: 30,
    role: "Medication formatter compatibility barrel"
  },
  {
    path: "apps/web/src/features/clinical-records/medicationFormatterPrimitives.ts",
    maxLines: 40,
    role: "Shared medication label and quantity formatter primitives"
  },
  {
    path: "apps/web/src/features/clinical-records/medicationRequestFormatters.ts",
    maxLines: 100,
    role: "MedicationRequest presentation formatters"
  },
  {
    path: "apps/web/src/features/clinical-records/medicationDispenseFormatters.ts",
    maxLines: 90,
    role: "MedicationDispense presentation formatters"
  },
  {
    path: "apps/web/src/features/clinical-records/medicationAdministrationFormatters.ts",
    maxLines: 120,
    role: "MedicationAdministration presentation formatters"
  },
  {
    path: "apps/web/src/features/clinical-records/carePlanCommandBuilders.ts",
    maxLines: 20,
    role: "Care workflow and diagnostic command-builder compatibility barrel"
  },
  {
    path: "apps/web/src/features/clinical-records/carePlanHandlers.ts",
    maxLines: 50,
    role: "Care plan handler composition factory"
  },
  {
    path: "apps/web/src/features/clinical-records/carePlanHandlerTypes.ts",
    maxLines: 90,
    role: "Care plan handler configuration and submit handler types"
  },
  {
    path: "apps/web/src/features/clinical-records/diagnosticResultHandlers.ts",
    maxLines: 140,
    role: "DiagnosticReport and ImagingStudy submit handlers"
  },
  {
    path: "apps/web/src/features/clinical-records/careWorkflowHandlers.ts",
    maxLines: 130,
    role: "Procedure and ServiceRequest submit handlers"
  },
  {
    path: "apps/web/src/features/clinical-records/careWorkflowFormatters.ts",
    maxLines: 30,
    role: "Care workflow formatter compatibility barrel"
  },
  {
    path: "apps/web/src/features/clinical-records/careWorkflowFormatterPrimitives.ts",
    maxLines: 20,
    role: "Care workflow formatter shared label primitive"
  },
  {
    path: "apps/web/src/features/clinical-records/serviceRequestFormatters.ts",
    maxLines: 70,
    role: "ServiceRequest presentation formatters"
  },
  {
    path: "apps/web/src/features/clinical-records/workflowTaskFormatters.ts",
    maxLines: 60,
    role: "Task presentation formatters"
  },
  {
    path: "apps/web/src/features/clinical-records/procedureFormatters.ts",
    maxLines: 90,
    role: "Procedure presentation formatters"
  },
  {
    path: "apps/web/src/features/clinical-records/serviceRequestCommandBuilders.ts",
    maxLines: 50,
    role: "ServiceRequest order command builder"
  },
  {
    path: "apps/web/src/features/clinical-records/procedureCommandBuilders.ts",
    maxLines: 100,
    role: "Procedure performance command builder"
  },
  {
    path: "apps/web/src/features/clinical-records/diagnosticReportCommandBuilders.ts",
    maxLines: 50,
    role: "DiagnosticReport result command builder"
  },
  {
    path: "apps/web/src/features/clinical-records/imagingStudyCommandBuilders.ts",
    maxLines: 130,
    role: "ImagingStudy DICOM command builder and draft validation"
  },
  {
    path: "apps/web/src/features/clinical-records/AllergyIntolerancePanel.tsx",
    maxLines: 180,
    role: "AllergyIntolerance safety list, summary and form composition"
  },
  {
    path: "apps/web/src/features/clinical-records/AllergyIntoleranceForm.tsx",
    maxLines: 90,
    role: "AllergyIntolerance safety command form composition"
  },
  {
    path: "apps/web/src/features/clinical-records/AllergyIntoleranceContextFields.tsx",
    maxLines: 60,
    role: "AllergyIntolerance encounter reference field"
  },
  {
    path: "apps/web/src/features/clinical-records/AllergyIntoleranceClassificationFields.tsx",
    maxLines: 120,
    role: "AllergyIntolerance type, category and status fields"
  },
  {
    path: "apps/web/src/features/clinical-records/AllergyIntoleranceCodeFields.tsx",
    maxLines: 70,
    role: "AllergyIntolerance agent coding fields"
  },
  {
    path: "apps/web/src/features/clinical-records/AllergyIntoleranceReactionFields.tsx",
    maxLines: 90,
    role: "AllergyIntolerance reaction manifestation and severity fields"
  },
  {
    path: "apps/web/src/features/clinical-records/AllergyIntoleranceRecordFields.tsx",
    maxLines: 65,
    role: "AllergyIntolerance recorded time and recorder fields"
  },
  {
    path: "apps/web/src/features/clinical-records/AllergyIntoleranceNoteFields.tsx",
    maxLines: 60,
    role: "AllergyIntolerance reaction description and note fields"
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
    maxLines: 110,
    role: "MedicationDispense panel composition"
  },
  {
    path: "apps/web/src/features/clinical-records/MedicationDispenseList.tsx",
    maxLines: 80,
    role: "MedicationDispense selectable list"
  },
  {
    path: "apps/web/src/features/clinical-records/MedicationDispenseSummary.tsx",
    maxLines: 100,
    role: "MedicationDispense selected record summary"
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
    maxLines: 110,
    role: "MedicationAdministration panel composition"
  },
  {
    path: "apps/web/src/features/clinical-records/MedicationAdministrationList.tsx",
    maxLines: 80,
    role: "MedicationAdministration selectable list"
  },
  {
    path: "apps/web/src/features/clinical-records/MedicationAdministrationSummary.tsx",
    maxLines: 100,
    role: "MedicationAdministration selected record summary"
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
    maxLines: 90,
    role: "Procedure command form composition"
  },
  {
    path: "apps/web/src/features/clinical-records/ProcedureContextFields.tsx",
    maxLines: 90,
    role: "Procedure encounter, service request and reason fields"
  },
  {
    path: "apps/web/src/features/clinical-records/ProcedureClassificationFields.tsx",
    maxLines: 80,
    role: "Procedure category and status fields"
  },
  {
    path: "apps/web/src/features/clinical-records/ProcedureCodeFields.tsx",
    maxLines: 70,
    role: "Procedure coding fields"
  },
  {
    path: "apps/web/src/features/clinical-records/ProcedureTimingFields.tsx",
    maxLines: 60,
    role: "Procedure performed period fields"
  },
  {
    path: "apps/web/src/features/clinical-records/ProcedurePerformerFields.tsx",
    maxLines: 90,
    role: "Procedure performer and recorder fields"
  },
  {
    path: "apps/web/src/features/clinical-records/ProcedureOutcomeFields.tsx",
    maxLines: 95,
    role: "Procedure body site, outcome, report and note fields"
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
    maxLines: 80,
    role: "MedicationRequest prescribing command form composition"
  },
  {
    path: "apps/web/src/features/clinical-records/MedicationRequestContextFields.tsx",
    maxLines: 70,
    role: "MedicationRequest context field composition"
  },
  {
    path: "apps/web/src/features/clinical-records/MedicationRequestReferenceFields.tsx",
    maxLines: 80,
    role: "MedicationRequest encounter and diagnosis reference fields"
  },
  {
    path: "apps/web/src/features/clinical-records/MedicationRequestClassificationFields.tsx",
    maxLines: 70,
    role: "MedicationRequest category and priority fields"
  },
  {
    path: "apps/web/src/features/clinical-records/MedicationRequestMedicationFields.tsx",
    maxLines: 70,
    role: "MedicationRequest medication field composition"
  },
  {
    path: "apps/web/src/features/clinical-records/MedicationRequestDrugCodeFields.tsx",
    maxLines: 70,
    role: "MedicationRequest medication code identity fields"
  },
  {
    path: "apps/web/src/features/clinical-records/MedicationRequestDosageTimingFields.tsx",
    maxLines: 120,
    role: "MedicationRequest dosage instruction and timing fields"
  },
  {
    path: "apps/web/src/features/clinical-records/MedicationRequestPrescriptionFields.tsx",
    maxLines: 70,
    role: "MedicationRequest authored time, supply, requester and note fields"
  },
  {
    path: "apps/web/src/features/clinical-records/DiagnosticReportPanel.tsx",
    maxLines: 180,
    role: "DiagnosticReport list, summary and form composition"
  },
  {
    path: "apps/web/src/features/clinical-records/DiagnosticReportForm.tsx",
    maxLines: 90,
    role: "DiagnosticReport LIS/RIS command form composition"
  },
  {
    path: "apps/web/src/features/clinical-records/DiagnosticReportContextFields.tsx",
    maxLines: 80,
    role: "DiagnosticReport encounter and service request fields"
  },
  {
    path: "apps/web/src/features/clinical-records/DiagnosticReportClassificationFields.tsx",
    maxLines: 80,
    role: "DiagnosticReport category and code fields"
  },
  {
    path: "apps/web/src/features/clinical-records/DiagnosticReportTimingFields.tsx",
    maxLines: 60,
    role: "DiagnosticReport effective and issued date fields"
  },
  {
    path: "apps/web/src/features/clinical-records/DiagnosticReportPerformerFields.tsx",
    maxLines: 70,
    role: "DiagnosticReport performer and interpreter fields"
  },
  {
    path: "apps/web/src/features/clinical-records/DiagnosticReportObservationFields.tsx",
    maxLines: 90,
    role: "DiagnosticReport result Observation checkbox fields"
  },
  {
    path: "apps/web/src/features/clinical-records/DiagnosticReportConclusionFields.tsx",
    maxLines: 65,
    role: "DiagnosticReport conclusion and presented form fields"
  },
  {
    path: "apps/web/src/features/clinical-records/ImagingStudyPanel.tsx",
    maxLines: 180,
    role: "ImagingStudy PACS/DICOM list, summary and form composition"
  },
  {
    path: "apps/web/src/features/clinical-records/ImagingStudyForm.tsx",
    maxLines: 90,
    role: "ImagingStudy PACS/DICOM command form composition"
  },
  {
    path: "apps/web/src/features/clinical-records/ImagingStudyContextFields.tsx",
    maxLines: 95,
    role: "ImagingStudy encounter, order and diagnostic report references"
  },
  {
    path: "apps/web/src/features/clinical-records/ImagingStudyStudyIdentityFields.tsx",
    maxLines: 70,
    role: "ImagingStudy study UID, accession and start fields"
  },
  {
    path: "apps/web/src/features/clinical-records/ImagingStudyParticipantFields.tsx",
    maxLines: 70,
    role: "ImagingStudy clinical participant and PACS endpoint fields"
  },
  {
    path: "apps/web/src/features/clinical-records/ImagingStudySeriesReferenceFields.tsx",
    maxLines: 65,
    role: "ImagingStudy DICOM series UID and instance count fields"
  },
  {
    path: "apps/web/src/features/clinical-records/ImagingStudySeriesDetailFields.tsx",
    maxLines: 95,
    role: "ImagingStudy modality, series description and body site fields"
  }
];

const appSource = await readFile(appPath, "utf8");
const appDerivedContextSource = await readFile(appDerivedContextPath, "utf8");
const appNavigationSource = await readFile(appNavigationPath, "utf8");
const appRouteModelsSource = await readFile(appRouteModelsPath, "utf8");
const appRoutePanelsSource = await readFile(appRoutePanelsPath, "utf8");
const appRouteRendererSource = [
  await readFile(appRouteRendererPath, "utf8"),
  await readFile(appRouteRendererTypesPath, "utf8"),
  await readFile(integrationGatewayRouteRendererPath, "utf8"),
  await readFile(interopRouteRendererPath, "utf8"),
  await readFile(workspaceRouteRendererPath, "utf8")
].join("\n");
const appShellSource = await readFile(appShellPath, "utf8");
const auditLogPageSource = await readFile(auditLogPagePath, "utf8");
const auditPanelsSource = [
  await readFile(auditPanelsPath, "utf8"),
  await readFile(globalAuditPanelPath, "utf8"),
  await readFile(patientAuditActionsPath, "utf8"),
  await readFile(patientAuditEventListPath, "utf8"),
  await readFile(patientAuditIntegrityCardPath, "utf8"),
  await readFile(patientAuditPanelPath, "utf8")
].join("\n");
const dashboardPageSource = await readFile(dashboardPagePath, "utf8");
const documentsPageSource = await readFile(documentsPagePath, "utf8");
const clinicalApiSource = await readFile(allowedFetchModulePath, "utf8");
const clinicalDocumentPanelSource = [
  await readFile(clinicalDocumentListPath, "utf8"),
  await readFile(clinicalDocumentPanelPath, "utf8"),
  await readFile(clinicalDocumentSummaryPath, "utf8")
].join("\n");
const encounterPanelSource = await readFile(encounterPanelPath, "utf8");
const consentInteropPanelSource = await readFile(consentInteropPanelPath, "utf8");
const fhirDocumentBundleSummarySource = await readFile(
  fhirDocumentBundleSummaryPath,
  "utf8"
);
const fhirTransferContextSummarySource = await readFile(
  fhirTransferContextSummaryPath,
  "utf8"
);
const gatewayAcknowledgementPageSource = await readFile(
  gatewayAcknowledgementPagePath,
  "utf8"
);
const interopPageSource = await readFile(interopPagePath, "utf8");
const landingPageSource = await readFile(landingPagePath, "utf8");
const loginPageSource = await readFile(loginPagePath, "utf8");
const mainSource = await readFile(mainPath, "utf8");
const settingsPageSource = await readFile(settingsPagePath, "utf8");
const workspacePageSource = await readFile(workspacePagePath, "utf8");
const stylesSource = await readFile(stylesPath, "utf8");
const landingStylesSource = await readFile(landingStylesPath, "utf8");
const demoLoginSource = await readFile(demoLoginPath, "utf8");
const clinicalDocumentApiSource = await readFile(clinicalDocumentApiPath, "utf8");
const patientRegistryApiSource = await readFile(patientRegistryApiPath, "utf8");
const patientDetailPanelSource = await readFile(patientDetailPanelPath, "utf8");
const providerDirectoryFormattersSource = await readFile(
  providerDirectoryFormattersPath,
  "utf8"
);
const recordTransferListSource = await readFile(recordTransferListPath, "utf8");
const recordTransferMetadataSource = await readFile(
  recordTransferMetadataPath,
  "utf8"
);
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

if (/getElementById\("root"\)!/.test(mainSource)) {
  throw new Error(
    "apps/web/src/main.tsx must guard the root element explicitly instead of using a non-null assertion."
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

if (/\/clinical-documents\/\$\{documentId\}\/provenance\/fhir/.test(clinicalDocumentApiSource)) {
  throw new Error(
    "Clinical document web adapter must not call the retired Provenance path /provenance/fhir; use /fhir-provenance to match the API contract."
  );
}

if (!/\/clinical-documents\/\$\{documentId\}\/fhir-provenance/.test(clinicalDocumentApiSource)) {
  throw new Error(
    "Clinical document web adapter must call /clinical-documents/${documentId}/fhir-provenance for FHIR Provenance export."
  );
}

const documentBundleTransferContextChecks = [
  {
    pattern: /defaultTransferContext/,
    message:
      "Patient registry web adapter must reuse the demo transfer context when exporting the FHIR document Bundle."
  },
  {
    pattern: /"x-consent-reference":\s*defaultTransferContext\.consentReference/,
    message:
      "FHIR document Bundle export must send x-consent-reference so the API can validate transfer consent."
  },
  {
    pattern:
      /"x-recipient-organization-id":\s*defaultTransferContext\.recipientOrganizationId/,
    message:
      "FHIR document Bundle export must send x-recipient-organization-id so the API can validate the receiving hospital."
  }
];

for (const check of documentBundleTransferContextChecks) {
  if (!check.pattern.test(patientRegistryApiSource)) {
    throw new Error(check.message);
  }
}

const fhirTransferContextUiChecks = [
  {
    source: interopPageSource,
    pattern: /<FhirTransferContextSummary\b/,
    message:
      "Interop page must show the FHIR transfer context before the raw JSON panels."
  },
  {
    source: appRouteRendererSource,
    pattern: /transferContext=\{defaultRecordTransferForm\}/,
    message:
      "App route renderer must pass the demo record-transfer context into InteropPage."
  },
  {
    source: fhirTransferContextSummarySource,
    pattern: /\bconsentReference\b/,
    message:
      "FHIR transfer context summary must display the consent reference used for Bundle export."
  },
  {
    source: fhirTransferContextSummarySource,
    pattern: /\brecipientOrganizationId\b/,
    message:
      "FHIR transfer context summary must display the receiving organization."
  },
  {
    source: providerDirectoryFormattersSource,
    pattern: /\bexport function resolveProviderOrganizationLabel\b/,
    message:
      "Provider Directory formatters must expose a shared organization label resolver."
  },
  {
    source: fhirTransferContextSummarySource,
    pattern: /\bresolveProviderOrganizationLabel\b/,
    message:
      "FHIR transfer context summary must use Provider Directory labels for source and receiving organizations."
  },
  {
    source: consentInteropPanelSource,
    pattern: /\bresolveProviderOrganizationLabel\b/,
    message:
      "Consent interop panel must use Provider Directory labels for the receiving organization."
  },
  {
    source: recordTransferListSource,
    pattern: /\bresolveProviderOrganizationLabel\b/,
    message:
      "Record transfer list must use Provider Directory labels for the receiving organization."
  },
  {
    source: recordTransferMetadataSource,
    pattern: /\bresolveProviderOrganizationLabel\b/,
    message:
      "Record transfer metadata must use Provider Directory labels for source and receiving organizations."
  },
  {
    source: fhirTransferContextSummarySource,
    pattern: /\bbundleType\b/,
    message:
      "FHIR transfer context summary must explain whether the package is a document or collection Bundle."
  }
];

for (const check of fhirTransferContextUiChecks) {
  if (!check.pattern.test(check.source)) {
    throw new Error(check.message);
  }
}

if (/eyebrow="Interop"/.test(interopPageSource)) {
  throw new Error("Interop page must use a professional Vietnamese EMR interoperability header.");
}

if (
  !/className="interop-brief"/.test(interopPageSource) ||
  !/Định danh CCCD\/VNeID/.test(interopPageSource) ||
  !/Consent, ký số và audit/.test(interopPageSource) ||
  !/Composition và Bundle/.test(interopPageSource)
) {
  throw new Error("Interop page must explain identity, consent/audit and Composition/Bundle scope before FHIR previews.");
}

if (
  /FHIR (?:Patient|Clinical Document Bundle|Consent|Record Transfer Task) JSON/.test(
    interopPageSource
  )
) {
  throw new Error("Interop FHIR panels must use workflow-first Vietnamese titles instead of raw JSON-first labels.");
}

if (/Document Bundle readiness/.test(fhirDocumentBundleSummarySource)) {
  throw new Error("FHIR document Bundle summary must use a Vietnamese readiness label.");
}

if (!/Có quyền xem hồ sơ không đồng nghĩa được phép xuất liên viện/.test(fhirTransferContextSummarySource)) {
  throw new Error("FHIR transfer context summary must separate chart-view permission from inter-hospital export permission.");
}

if (
  !/className="gateway-brief"/.test(gatewayAcknowledgementPageSource) ||
  !/Gateway nhận/.test(gatewayAcknowledgementPageSource) ||
  !/HMAC và idempotency/.test(gatewayAcknowledgementPageSource) ||
  !/Audit vận hành/.test(gatewayAcknowledgementPageSource)
) {
  throw new Error("Gateway acknowledgement page must explain gateway scope, HMAC/idempotency and audit operations before the callback form.");
}

if (
  !/Tác nhân \(actor\)/.test(gatewayAcknowledgementPageSource) ||
  !/Mục đích sử dụng \(PurposeOfUse\)/.test(gatewayAcknowledgementPageSource)
) {
  throw new Error("Gateway acknowledgement page must annotate actor and PurposeOfUse labels for demo reviewers.");
}

if (
  /label="Actor"|Actor xác nhận|label="PurposeOfUse"/.test(
    gatewayAcknowledgementPageSource
  )
) {
  throw new Error("Gateway acknowledgement page must avoid unannotated raw actor and PurposeOfUse labels.");
}

const clinicalApiOperationOutcomeChecks = [
  {
    pattern: /contentType\.includes\("json"\)/,
    message:
      "Clinical API client must parse application/fhir+json OperationOutcome responses, not only application/json."
  },
  {
    pattern: /\bextractOperationOutcomeMessage\b/,
    message:
      "Clinical API client must extract user-facing messages from FHIR OperationOutcome payloads."
  },
  {
    pattern: /\bdetails\?\.text\b|\bdiagnostics\b/,
    message:
      "Clinical API client must preserve OperationOutcome details.text or diagnostics in API errors."
  }
];

for (const check of clinicalApiOperationOutcomeChecks) {
  if (!check.pattern.test(clinicalApiSource)) {
    throw new Error(check.message);
  }
}

if (/\b\d+\s+SQL migrations\b/.test(landingPageSource)) {
  throw new Error(
    "Landing page must not hard-code migration counts because they drift as schema migrations evolve."
  );
}

if (/Clinical command center|Hải Phòng referral flow/.test(landingPageSource)) {
  throw new Error(
    "Landing page must use professional Vietnamese labels for demo-facing workflow copy instead of raw English marketing phrases."
  );
}

if (!/Nguyễn Văn An/.test(landingPageSource) || /Nguyễn Minh An/.test(landingPageSource)) {
  throw new Error(
    "Landing page demo patient identity must match the in-memory patient registry fixture."
  );
}

if (
  !/scopeCards/.test(landingPageSource) ||
  !/landing-scope-board/.test(landingPageSource) ||
  !/HIS: hệ thống thông tin bệnh viện/.test(landingPageSource) ||
  !/LIS\/RIS: hệ thống xét nghiệm/.test(landingPageSource) ||
  !/PACS\/DICOMweb: kho ảnh y khoa/.test(landingPageSource) ||
  !/scope-proof-strip/.test(landingPageSource) ||
  !/Provider Directory/.test(landingPageSource) ||
  !/Outbox/.test(landingPageSource) ||
  !/Chưa dùng dữ liệu bệnh nhân thật/.test(landingPageSource)
) {
  throw new Error(
    "Landing page must explain prototype scope, HIS/LIS/PACS integration boundaries and no-real-patient-data guardrails."
  );
}

if (!/@import "\.\/styles\/landing\.css";/.test(stylesSource)) {
  throw new Error("Global web stylesheet must import the focused landing stylesheet.");
}

if (
  /\.(?:landing-|marketing-|brand-lockup|brand-mark|clinical-window|transfer-timeline|status-pill|feature-tags|scope-card|scope-proof-strip)/.test(
    stylesSource
  )
) {
  throw new Error(
    "Landing and marketing selectors must live in apps/web/src/styles/landing.css, not the global app stylesheet."
  );
}

const responsiveLandingChecks = [
  {
    pattern:
      /@media \(max-width: 1100px\)[\s\S]*?\.landing-hero-copy,\s*[\r\n]+\s*\.landing-card\s*\{[\s\S]*?min-height:\s*auto;/,
    message:
      "Landing hero and summary card must drop fixed min-height at tablet widths so the product intro does not feel oversized."
  },
  {
    pattern:
      /@media \(max-width: 1100px\)[\s\S]*?\.landing-hero-copy\s*\{[\s\S]*?padding:\s*clamp\(28px,\s*4vw,\s*44px\);/,
    message:
      "Landing hero copy must use the tablet responsive spacing scale."
  },
  {
    pattern:
      /@media \(max-width: 1100px\)[\s\S]*?\.landing-hero h1\s*\{[\s\S]*?font-size:\s*clamp\(2\.35rem,\s*5\.7vw,\s*3\.8rem\);/,
    message:
      "Landing hero heading must use the tablet responsive type scale."
  },
  {
    pattern:
      /@media \(max-width: 680px\)[\s\S]*?\.landing-proof-row span\s*\{[\s\S]*?flex:\s*1 1 calc\(50% - 8px\);/,
    message:
      "Landing proof chips must wrap into balanced rows on mobile."
  },
  {
    pattern:
      /\.landing-scope-board\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1\.16fr\)\s*minmax\(320px,\s*0\.84fr\);/,
    message:
      "Landing scope board must use an asymmetric product-readiness layout instead of another equal-card row."
  },
  {
    pattern: /\.scope-card--primary\s*\{[\s\S]*?grid-row:\s*span 2;/,
    message:
      "Landing scope board must give the current prototype scope stronger visual hierarchy."
  },
  {
    pattern:
      /\.scope-proof-strip\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);/,
    message:
      "Landing scope primary card must include compact technical evidence instead of leaving a visually empty span."
  },
  {
    pattern:
      /@media \(max-width: 1100px\)[\s\S]*?\.scope-card--primary\s*\{[\s\S]*?grid-row:\s*auto;/,
    message:
      "Landing scope board must collapse primary card row span at tablet widths."
  }
];

for (const check of responsiveLandingChecks) {
  if (!check.pattern.test(landingStylesSource)) {
    throw new Error(check.message);
  }
}

if (
  !/export type AuthenticatedAppRoute = Exclude<AppRoute, "landing" \| "login">;/.test(
    appNavigationSource
  ) ||
  !/export type AppNavigationRoute = AuthenticatedAppRoute;/.test(appNavigationSource) ||
  !/export const appNavigationItems: readonly AppNavigationItem\[\]/.test(appNavigationSource) ||
  !/export const integrationNavigationItem: AppNavigationItem/.test(appNavigationSource) ||
  !/export function getVisibleNavigationItems/.test(appNavigationSource) ||
  !/export function normalizeAuthenticatedRoute/.test(appNavigationSource)
) {
  throw new Error(
    "Authenticated app navigation must live in apps/web/src/config/appNavigation.ts with typed routes, visible items and route normalization."
  );
}

if (
  /type AppNavigationRoute =/.test(appShellSource) ||
  /const navigationItems/.test(appShellSource) ||
  /readonly currentRoute: string;/.test(appShellSource) ||
  !/getVisibleNavigationItems\(userRole\)/.test(appShellSource)
) {
  throw new Error(
    "AppShell must consume centralized navigation metadata instead of redefining routes or accepting an untyped currentRoute."
  );
}

if (
  !/normalizeAuthenticatedRoute\(appRoute\)/.test(appSource) ||
  !/const authenticatedAppRoute =/.test(appSource) ||
  /currentRoute=\{isIntegrationSession \? "interop" : appRoute\}/.test(appSource)
) {
  throw new Error(
    "App must normalize authenticated routes once before rendering the authenticated layout and route renderer."
  );
}

if (
  !/readonly appRoute: AuthenticatedAppRoute;/.test(appRouteRendererSource) ||
  !/readonly onNavigate: \(route: AuthenticatedAppRoute\) => void;/.test(appRouteRendererSource) ||
  !/readonly onNavigate: \(route: AuthenticatedAppRoute\) => void;/.test(dashboardPageSource)
) {
  throw new Error(
    "Authenticated page rendering must use AuthenticatedAppRoute so dashboard navigation cannot point back to public routes."
  );
}

if (
  !/export type AppRoutePanels =/.test(appRouteModelsSource) ||
  !/export type FhirPreviewValues =/.test(appRouteModelsSource) ||
  !/export type ReferenceSignal =/.test(appRouteModelsSource) ||
  !/export type AppRouteRuntimeContext =/.test(appRouteModelsSource)
) {
  throw new Error(
    "Application route renderer models must live in apps/web/src/application/appRouteModels.ts instead of page component files."
  );
}

if (
  /from ["']\.\.\/pages\/AppRouteRenderer\.js["']/.test(appDerivedContextSource) ||
  /Parameters<typeof AppRouteRenderer>/.test(appDerivedContextSource) ||
  /from ["']\.\.\/pages\/AppRouteRenderer\.js["']/.test(appRoutePanelsSource)
) {
  throw new Error(
    "Application composition modules must not import route model types from page components."
  );
}

if (
  !/from ["']\.\.\/application\/appRouteModels\.js["']/.test(appRouteRendererSource) ||
  !/from ["']\.\.\/application\/appRouteModels\.js["']/.test(interopPageSource)
) {
  throw new Error(
    "Route pages must consume shared route models from apps/web/src/application/appRouteModels.ts."
  );
}

if (
  !/export function PageBrief\b/.test(appShellSource) ||
  !/className=\{`page-brief \$\{className\}`\}/.test(appShellSource)
) {
  throw new Error("AppShell must expose a shared PageBrief component that keeps page-specific brief class names.");
}

if (
  !/\.page-brief\s*\{/.test(stylesSource) ||
  /\.dashboard-brief article|\.document-brief article|\.settings-brief article|\.workspace-brief article/.test(
    stylesSource
  )
) {
  throw new Error("Brief card styling must live on the shared .page-brief selector instead of page-specific duplicates.");
}

const pageBriefConsumerChecks = [
  { source: dashboardPageSource, className: "dashboard-brief", page: "Dashboard page" },
  { source: documentsPageSource, className: "document-brief", page: "Documents page" },
  { source: workspacePageSource, className: "workspace-brief", page: "Workspace page" },
  { source: settingsPageSource, className: "settings-brief", page: "Settings page" },
  { source: interopPageSource, className: "interop-brief", page: "Interop page" },
  { source: auditLogPageSource, className: "audit-brief", page: "Audit page" },
  {
    source: gatewayAcknowledgementPageSource,
    className: "gateway-brief",
    page: "Gateway acknowledgement page"
  }
];

for (const check of pageBriefConsumerChecks) {
  if (!new RegExp(`<PageBrief[\\s\\S]*className="${check.className}"`).test(check.source)) {
    throw new Error(`${check.page} must render its brief cards through the shared PageBrief component.`);
  }

  if (new RegExp(`<section className="${check.className}"`).test(check.source)) {
    throw new Error(`${check.page} must not duplicate PageBrief section markup inline.`);
  }
}

if (/Secure access/.test(loginPageSource)) {
  throw new Error("Login page must use professional Vietnamese copy, not the raw English 'Secure access' eyebrow.");
}

if (!/\bdemoRoleOptions\b/.test(demoLoginSource) || !/\bgetDemoRoleOption\b/.test(demoLoginSource)) {
  throw new Error("Demo login roles must expose centralized option metadata and lookup helpers.");
}

if (
  !/\bdemoRoleOptions\.map\b/.test(loginPageSource) ||
  !/\bgetDemoRoleOption\(form\.role\)/.test(loginPageSource) ||
  !/className="role-help"/.test(loginPageSource) ||
  !/Giải thích vai trò demo:/.test(loginPageSource)
) {
  throw new Error("Login page must render role choices and role explanation from centralized demo role metadata.");
}

if (
  /eyebrow="Settings"|<p className="eyebrow">(?:Session|Runtime|Roadmap)<\/p>/.test(
    settingsPageSource
  )
) {
  throw new Error("Settings page must use professional Vietnamese labels instead of raw Settings/Session/Runtime/Roadmap copy.");
}

if (
  !/settingsBriefItems/.test(settingsPageSource) ||
  !/productionReadinessMilestones/.test(settingsPageSource) ||
  !/className="settings-brief"/.test(settingsPageSource) ||
  !/Bearer token \+ mục đích sử dụng \(PurposeOfUse\)/.test(settingsPageSource)
) {
  throw new Error("Settings page must explain demo session scope, backend runtime and production readiness with shared structured content.");
}

if (
  /label="(?:Service|Diagnostics|Repository|Public API|API docs|Delivery attempts|Delivery worker|Retry worker)"/.test(
    settingsPageSource
  )
) {
  throw new Error("Settings page runtime labels must be Vietnamese and reviewer-friendly.");
}

if (/eyebrow="Dashboard"|Today queue|Selected chart|Mở patient workspace/.test(dashboardPageSource)) {
  throw new Error("Dashboard page must use professional Vietnamese demo-facing labels.");
}

if (
  !/className="dashboard-brief"/.test(dashboardPageSource) ||
  !/EMR lõi/.test(dashboardPageSource) ||
  !/Liên thông/.test(dashboardPageSource) ||
  !/Kiểm soát/.test(dashboardPageSource)
) {
  throw new Error("Dashboard page must explain its EMR, interoperability and control scope before the metric grid.");
}

if (/Document Center/.test(documentsPageSource)) {
  throw new Error("Documents page must use professional Vietnamese demo-facing labels.");
}

if (
  !/className="document-brief"/.test(documentsPageSource) ||
  !/DocumentReference/.test(documentsPageSource) ||
  !/Provenance/.test(documentsPageSource) ||
  !/ký\/xác thực/.test(documentsPageSource)
) {
  throw new Error("Documents page must explain DocumentReference, Provenance and signing scope before the workspace.");
}

if (/Chưa gắn encounter|label="Encounter"|`Encounter \$\{document\.encounterId\}`/.test(clinicalDocumentPanelSource)) {
  throw new Error("Clinical document panel must use Vietnamese encounter labels in demo-facing UI.");
}

if (/Patient Workspace/.test(workspacePageSource)) {
  throw new Error("Workspace page must use professional Vietnamese demo-facing labels.");
}

if (
  !/className="workspace-brief"/.test(workspacePageSource) ||
  !/Định danh bệnh nhân/.test(workspacePageSource) ||
  !/Lượt khám/.test(workspacePageSource) ||
  !/Thuốc và tài liệu/.test(workspacePageSource)
) {
  throw new Error("Workspace page must explain patient identity, encounter and medication/document scope before the clinical panels.");
}

if (/Patient chart|Master Patient Index/.test(patientDetailPanelSource)) {
  throw new Error("Patient detail panel must use Vietnamese labels, with MPI explained when needed.");
}

if (/Encounter timeline/.test(encounterPanelSource)) {
  throw new Error("Encounter panel must use a Vietnamese timeline label in demo-facing UI.");
}

if (/eyebrow="Audit"/.test(auditLogPageSource) || /Security trace/.test(auditPanelsSource)) {
  throw new Error("Audit page and panels must use professional Vietnamese labels.");
}

if (
  !/className="audit-brief"/.test(auditLogPageSource) ||
  !/Ai truy cập\?/.test(auditLogPageSource) ||
  !/Truy cập tài nguyên nào\?/.test(auditLogPageSource) ||
  !/Log có toàn vẹn không\?/.test(auditLogPageSource)
) {
  throw new Error("Audit page must explain actor, resource and integrity questions before the audit panels.");
}

if (/FHIR AuditEvent Bundle JSON/.test(auditPanelsSource)) {
  throw new Error("Audit FHIR panel must use a workflow-first Vietnamese title instead of a raw JSON-first label.");
}

if (!/Tác nhân \(actor\)/.test(auditPanelsSource) || !/Xuất FHIR AuditEvent Bundle/.test(auditPanelsSource)) {
  throw new Error("Audit panels must explain actor terminology and FHIR AuditEvent Bundle export clearly.");
}

const webSourceFiles = await collectSourceFiles(webSrcPath);
const forbiddenLayerImports = await findForbiddenLayerImports(webSourceFiles);

if (forbiddenLayerImports.length > 0) {
  throw new Error(
    `Web frontend layer dependency rules failed: ${forbiddenLayerImports.join("; ")}`
  );
}

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
      landingPagePath,
      appLineCount,
      maxAppLines,
      clinicalDocumentApiPath,
      patientRegistryApiPath,
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

async function findForbiddenLayerImports(sourceFiles) {
  const violations = [];

  for (const filePath of sourceFiles) {
    const sourcePath = toRepoPath(filePath);
    const matchingRules = webLayerImportRules.filter((rule) =>
      sourcePath.startsWith(rule.sourcePrefix)
    );

    if (matchingRules.length === 0) {
      continue;
    }

    const source = await readFile(filePath, "utf8");

    for (const specifier of extractModuleSpecifiers(source)) {
      if (!specifier.startsWith(".")) {
        continue;
      }

      const targetPath = toRepoPath(resolve(dirname(filePath), specifier));

      for (const rule of matchingRules) {
        if (
          rule.forbiddenTargetPrefixes.some((prefix) =>
            targetPath.startsWith(prefix)
          )
        ) {
          violations.push(
            `${sourcePath} imports ${specifier} -> ${targetPath}. ${rule.message}`
          );
        }
      }
    }
  }

  return violations;
}

function extractModuleSpecifiers(source) {
  const specifiers = [];
  const fromImportPattern =
    /\b(?:import|export)\b[^;]*?\bfrom\s*["']([^"']+)["']/g;
  const sideEffectImportPattern = /\bimport\s*["']([^"']+)["']/g;
  const dynamicImportPattern = /\bimport\(\s*["']([^"']+)["']\s*\)/g;

  for (const match of source.matchAll(fromImportPattern)) {
    specifiers.push(match[1]);
  }

  for (const match of source.matchAll(sideEffectImportPattern)) {
    specifiers.push(match[1]);
  }

  for (const match of source.matchAll(dynamicImportPattern)) {
    specifiers.push(match[1]);
  }

  return specifiers;
}

function toRepoPath(filePath) {
  return relative(process.cwd(), filePath).replaceAll("\\", "/");
}

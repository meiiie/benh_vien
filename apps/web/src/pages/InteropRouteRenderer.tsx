import { defaultRecordTransferForm } from "../config/demoTransferDefaults.js";
import { InteropPage } from "./InteropPage.js";
import type { AppRouteRendererProps } from "./AppRouteRendererTypes.js";

type InteropRouteRendererProps = Pick<
  AppRouteRendererProps,
  | "fhirPreviews"
  | "panels"
  | "providerDirectory"
  | "referenceSignals"
  | "selectedPatient"
  | "workflowSteps"
>;

export function InteropRouteRenderer({
  fhirPreviews,
  panels,
  providerDirectory,
  referenceSignals,
  selectedPatient,
  workflowSteps
}: InteropRouteRendererProps) {
  return (
    <InteropPage
      allergyIntoleranceFhirPreview={fhirPreviews.allergyIntolerance}
      capabilityStatementPreview={fhirPreviews.capabilityStatement}
      conditionFhirPreview={fhirPreviews.condition}
      consentFhirPreview={fhirPreviews.consent}
      consentInteropPanel={panels.consentInterop()}
      diagnosticReportFhirPreview={fhirPreviews.diagnosticReport}
      documentFhirPreview={fhirPreviews.document}
      documentProvenanceFhirPreview={fhirPreviews.documentProvenance}
      encounterFhirPreview={fhirPreviews.encounter}
      imagingStudyFhirPreview={fhirPreviews.imagingStudy}
      medicationAdministrationFhirPreview={fhirPreviews.medicationAdministration}
      medicationDispenseFhirPreview={fhirPreviews.medicationDispense}
      medicationRequestFhirPreview={fhirPreviews.medicationRequest}
      observationFhirPreview={fhirPreviews.observation}
      patientFhirBundlePreview={fhirPreviews.patientBundle}
      patientFhirDocumentBundlePreview={fhirPreviews.patientDocumentBundle}
      patientFhirPreview={fhirPreviews.patient}
      procedureFhirPreview={fhirPreviews.procedure}
      providerDirectory={providerDirectory}
      providerDirectoryFhirPreview={fhirPreviews.providerDirectory}
      providerDirectoryPanel={panels.providerDirectory()}
      recordTransferFhirTaskPreview={fhirPreviews.recordTransferTask}
      recordTransferInteropPanel={panels.recordTransferInterop()}
      referenceSignals={referenceSignals}
      serviceRequestFhirPreview={fhirPreviews.serviceRequest}
      selectedPatient={selectedPatient}
      transferContext={defaultRecordTransferForm}
      workflowSteps={workflowSteps}
      workflowTaskFhirPreview={fhirPreviews.workflowTask}
    />
  );
}

import type { ReactNode } from "react";
import { FhirPanel, PageHeader } from "../components/AppShell.js";

type ReferenceSignal = {
  readonly name: string;
  readonly value: string;
};

type InteropPageProps = {
  readonly allergyIntoleranceFhirPreview: unknown;
  readonly capabilityStatementPreview: unknown;
  readonly conditionFhirPreview: unknown;
  readonly consentFhirPreview: unknown;
  readonly consentInteropPanel: ReactNode;
  readonly diagnosticReportFhirPreview: unknown;
  readonly documentFhirPreview: unknown;
  readonly documentProvenanceFhirPreview: unknown;
  readonly encounterFhirPreview: unknown;
  readonly imagingStudyFhirPreview: unknown;
  readonly medicationAdministrationFhirPreview: unknown;
  readonly medicationDispenseFhirPreview: unknown;
  readonly medicationRequestFhirPreview: unknown;
  readonly observationFhirPreview: unknown;
  readonly patientFhirBundlePreview: unknown;
  readonly patientFhirDocumentBundlePreview: unknown;
  readonly patientFhirPreview: unknown;
  readonly procedureFhirPreview: unknown;
  readonly providerDirectoryFhirPreview: unknown;
  readonly providerDirectoryPanel: ReactNode;
  readonly recordTransferFhirTaskPreview: unknown;
  readonly recordTransferInteropPanel: ReactNode;
  readonly referenceSignals: readonly ReferenceSignal[];
  readonly serviceRequestFhirPreview: unknown;
  readonly workflowSteps: readonly string[];
  readonly workflowTaskFhirPreview: unknown;
};

export function InteropPage({
  allergyIntoleranceFhirPreview,
  capabilityStatementPreview,
  conditionFhirPreview,
  consentFhirPreview,
  consentInteropPanel,
  diagnosticReportFhirPreview,
  documentFhirPreview,
  documentProvenanceFhirPreview,
  encounterFhirPreview,
  imagingStudyFhirPreview,
  medicationAdministrationFhirPreview,
  medicationDispenseFhirPreview,
  medicationRequestFhirPreview,
  observationFhirPreview,
  patientFhirBundlePreview,
  patientFhirDocumentBundlePreview,
  patientFhirPreview,
  procedureFhirPreview,
  providerDirectoryFhirPreview,
  providerDirectoryPanel,
  recordTransferFhirTaskPreview,
  recordTransferInteropPanel,
  referenceSignals,
  serviceRequestFhirPreview,
  workflowSteps,
  workflowTaskFhirPreview
}: InteropPageProps) {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Interop"
        title="FHIR và hướng liên thông bệnh viện"
        description="Màn này gom các biểu diễn FHIR hiện có để chuẩn bị cho luồng gửi sang HAPI FHIR hoặc hệ thống bệnh viện khác."
      />

      <section className="workflow-strip" aria-label="Luồng liên thông">
        {workflowSteps.map((item, index) => (
          <div className="workflow-step" key={item}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{item}</strong>
          </div>
        ))}
      </section>

      <section className="workspace">
        {providerDirectoryPanel}
        <FhirPanel title="FHIR CapabilityStatement JSON" badge="CapabilityStatement" value={capabilityStatementPreview} />
        <FhirPanel title="FHIR Provider Directory Bundle JSON" badge="Organization/Endpoint" value={providerDirectoryFhirPreview} />
        <FhirPanel title="FHIR Patient JSON" badge="Patient" value={patientFhirPreview} />
        <FhirPanel title="FHIR Patient Record Bundle JSON" badge="Bundle" value={patientFhirBundlePreview} />
        <FhirPanel title="FHIR Clinical Document Bundle JSON" badge="Composition" value={patientFhirDocumentBundlePreview} />
        <FhirPanel title="FHIR Encounter JSON" badge="Encounter" value={encounterFhirPreview} />
        <FhirPanel title="FHIR AllergyIntolerance JSON" badge="AllergyIntolerance" value={allergyIntoleranceFhirPreview} />
        <FhirPanel title="FHIR Condition JSON" badge="Condition" value={conditionFhirPreview} />
        <FhirPanel title="FHIR ServiceRequest JSON" badge="ServiceRequest" value={serviceRequestFhirPreview} />
        <FhirPanel title="FHIR Task JSON" badge="Task" value={workflowTaskFhirPreview} />
        <FhirPanel title="FHIR Procedure JSON" badge="Procedure" value={procedureFhirPreview} />
        <FhirPanel title="FHIR Observation JSON" badge="Observation" value={observationFhirPreview} />
        <FhirPanel title="FHIR DiagnosticReport JSON" badge="DiagnosticReport" value={diagnosticReportFhirPreview} />
        <FhirPanel title="FHIR ImagingStudy JSON" badge="ImagingStudy" value={imagingStudyFhirPreview} />
        <FhirPanel title="FHIR MedicationRequest JSON" badge="MedicationRequest" value={medicationRequestFhirPreview} />
        <FhirPanel title="FHIR MedicationDispense JSON" badge="MedicationDispense" value={medicationDispenseFhirPreview} />
        <FhirPanel title="FHIR MedicationAdministration JSON" badge="MedicationAdministration" value={medicationAdministrationFhirPreview} />
        <FhirPanel title="FHIR DocumentReference JSON" badge="DocumentReference" value={documentFhirPreview} />
        <FhirPanel title="FHIR Document Provenance JSON" badge="Provenance" value={documentProvenanceFhirPreview} />
        {consentInteropPanel}
        <FhirPanel title="FHIR Consent JSON" badge="Consent" value={consentFhirPreview} />
        {recordTransferInteropPanel}
        <FhirPanel title="FHIR Record Transfer Task JSON" badge="Task" value={recordTransferFhirTaskPreview} />
        <article className="panel dark-panel">
          <p className="eyebrow">Reference map</p>
          <h2>Chuẩn đang bám theo</h2>
          <div className="reference-list">
            {referenceSignals.map((reference) => (
              <div key={reference.name}>
                <strong>{reference.name}</strong>
                <span>{reference.value}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

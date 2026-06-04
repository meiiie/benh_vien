import type {
  AllergyIntoleranceRepository,
  ClinicalDocumentRepository,
  ConditionRepository,
  DiagnosticReportRepository,
  EncounterRepository,
  ImagingStudyRepository,
  MedicationAdministrationRepository,
  MedicationDispenseRepository,
  MedicationRequestRepository,
  ObservationRepository,
  ProcedureRepository,
  ProviderDirectoryRepository,
  ServiceRequestRepository,
  WorkflowTaskRepository
} from "@benh-vien-so/domain";
import type { PatientRecordBundleTransferContext } from "./patient-record-bundle-transfer-context.js";

export type LoadPatientRecordBundleCollectionsInput = {
  readonly patientId: string;
  readonly encounterRepository: EncounterRepository;
  readonly allergyIntoleranceRepository: AllergyIntoleranceRepository;
  readonly documentRepository: ClinicalDocumentRepository;
  readonly conditionRepository: ConditionRepository;
  readonly observationRepository: ObservationRepository;
  readonly diagnosticReportRepository: DiagnosticReportRepository;
  readonly imagingStudyRepository: ImagingStudyRepository;
  readonly medicationRequestRepository: MedicationRequestRepository;
  readonly medicationDispenseRepository: MedicationDispenseRepository;
  readonly medicationAdministrationRepository: MedicationAdministrationRepository;
  readonly serviceRequestRepository: ServiceRequestRepository;
  readonly workflowTaskRepository: WorkflowTaskRepository;
  readonly procedureRepository: ProcedureRepository;
  readonly providerDirectoryRepository: ProviderDirectoryRepository;
};

export async function loadPatientRecordBundleCollections({
  patientId,
  encounterRepository,
  allergyIntoleranceRepository,
  documentRepository,
  conditionRepository,
  observationRepository,
  diagnosticReportRepository,
  imagingStudyRepository,
  medicationRequestRepository,
  medicationDispenseRepository,
  medicationAdministrationRepository,
  serviceRequestRepository,
  workflowTaskRepository,
  procedureRepository,
  providerDirectoryRepository
}: LoadPatientRecordBundleCollectionsInput) {
  const [
    encounters,
    allergyIntolerances,
    documents,
    conditions,
    observations,
    diagnosticReports,
    imagingStudies,
    medicationRequests,
    medicationDispenses,
    medicationAdministrations,
    serviceRequests,
    workflowTasks,
    procedures,
    providerDirectory
  ] = await Promise.all([
    encounterRepository.findByPatientId(patientId),
    allergyIntoleranceRepository.findByPatientId(patientId),
    documentRepository.findByPatientId(patientId),
    conditionRepository.findByPatientId(patientId),
    observationRepository.findByPatientId(patientId),
    diagnosticReportRepository.findByPatientId(patientId),
    imagingStudyRepository.findByPatientId(patientId),
    medicationRequestRepository.findByPatientId(patientId),
    medicationDispenseRepository.findByPatientId(patientId),
    medicationAdministrationRepository.findByPatientId(patientId),
    serviceRequestRepository.findByPatientId(patientId),
    workflowTaskRepository.findByPatientId(patientId),
    procedureRepository.findByPatientId(patientId),
    providerDirectoryRepository.findDirectory()
  ]);

  return {
    encounters,
    allergyIntolerances,
    documents,
    conditions,
    observations,
    diagnosticReports,
    imagingStudies,
    medicationRequests,
    medicationDispenses,
    medicationAdministrations,
    serviceRequests,
    workflowTasks,
    procedures,
    providerDirectory
  };
}

export function buildPatientRecordBundleAuditMetadata(input: {
  readonly transferContext: PatientRecordBundleTransferContext;
  readonly collections: Awaited<ReturnType<typeof loadPatientRecordBundleCollections>>;
  readonly bundleType: "collection" | "document";
  readonly compositionResourceType?: "Composition";
}) {
  const providerDirectorySnapshot = input.collections.providerDirectory.toSnapshot();

  return {
    standard: "HL7 FHIR R4",
    resourceType: "Bundle",
    bundleType: input.bundleType,
    ...(input.compositionResourceType
      ? { compositionResourceType: input.compositionResourceType }
      : {}),
    consentReference: input.transferContext.consentReference,
    recipientOrganizationId: input.transferContext.recipientOrganizationId,
    encounterCount: input.collections.encounters.length,
    allergyIntoleranceCount: input.collections.allergyIntolerances.length,
    conditionCount: input.collections.conditions.length,
    observationCount: input.collections.observations.length,
    diagnosticReportCount: input.collections.diagnosticReports.length,
    imagingStudyCount: input.collections.imagingStudies.length,
    medicationRequestCount: input.collections.medicationRequests.length,
    medicationDispenseCount: input.collections.medicationDispenses.length,
    medicationAdministrationCount: input.collections.medicationAdministrations.length,
    serviceRequestCount: input.collections.serviceRequests.length,
    workflowTaskCount: input.collections.workflowTasks.length,
    procedureCount: input.collections.procedures.length,
    consentResourceCount: 1,
    documentCount: input.collections.documents.length,
    providerDirectoryEntryCount:
      providerDirectorySnapshot.organizations.length +
      providerDirectorySnapshot.practitioners.length +
      providerDirectorySnapshot.practitionerRoles.length +
      providerDirectorySnapshot.endpoints.length
  };
}

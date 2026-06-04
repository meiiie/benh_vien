import {
  DomainError,
  mapPatientRecordToFhirBundle,
  mapPatientRecordToFhirDocumentBundle
} from "@benh-vien-so/domain";
import type {
  AllergyIntoleranceRepository,
  ClinicalDocumentRepository,
  ConditionRepository,
  ConsentRepository,
  DiagnosticReportRepository,
  EncounterRepository,
  FhirBundle,
  ImagingStudyRepository,
  MedicationAdministrationRepository,
  MedicationDispenseRepository,
  MedicationRequestRepository,
  ObservationRepository,
  PatientRepository,
  ProcedureRepository,
  ProviderDirectoryRepository,
  RecordTransfer,
  ServiceRequestRepository,
  WorkflowTaskRepository
} from "@benh-vien-so/domain";

export type RecordTransferFhirBundleRepositories = {
  readonly patientRepository: PatientRepository;
  readonly encounterRepository: EncounterRepository;
  readonly allergyIntoleranceRepository: AllergyIntoleranceRepository;
  readonly clinicalDocumentRepository: ClinicalDocumentRepository;
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
  readonly consentRepository: ConsentRepository;
  readonly providerDirectoryRepository: ProviderDirectoryRepository;
};

export async function buildRecordTransferFhirBundle(
  repositories: RecordTransferFhirBundleRepositories,
  recordTransfer: RecordTransfer,
  generatedAt: Date = new Date()
): Promise<FhirBundle> {
  const snapshot = recordTransfer.toSnapshot();
  const [patient, consent] = await Promise.all([
    repositories.patientRepository.findById(snapshot.patientId),
    repositories.consentRepository.findById(snapshot.consentReference)
  ]);

  if (!patient) {
    throw new DomainError("Không tìm thấy bệnh nhân của gói chuyển hồ sơ.");
  }

  if (
    !consent?.allowsRecordSharing({
      patientId: snapshot.patientId,
      granteeOrganizationId: snapshot.recipientOrganizationId
    })
  ) {
    throw new DomainError("Consent không còn hợp lệ để gửi gói hồ sơ.");
  }

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
    repositories.encounterRepository.findByPatientId(snapshot.patientId),
    repositories.allergyIntoleranceRepository.findByPatientId(snapshot.patientId),
    repositories.clinicalDocumentRepository.findByPatientId(snapshot.patientId),
    repositories.conditionRepository.findByPatientId(snapshot.patientId),
    repositories.observationRepository.findByPatientId(snapshot.patientId),
    repositories.diagnosticReportRepository.findByPatientId(snapshot.patientId),
    repositories.imagingStudyRepository.findByPatientId(snapshot.patientId),
    repositories.medicationRequestRepository.findByPatientId(snapshot.patientId),
    repositories.medicationDispenseRepository.findByPatientId(snapshot.patientId),
    repositories.medicationAdministrationRepository.findByPatientId(snapshot.patientId),
    repositories.serviceRequestRepository.findByPatientId(snapshot.patientId),
    repositories.workflowTaskRepository.findByPatientId(snapshot.patientId),
    repositories.procedureRepository.findByPatientId(snapshot.patientId),
    repositories.providerDirectoryRepository.findDirectory()
  ]);

  const bundleInput = {
    patient,
    encounters,
    allergyIntolerances,
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
    consents: [consent],
    documents,
    providerDirectory,
    generatedAt
  };

  const bundle =
    snapshot.bundleType === "document"
      ? mapPatientRecordToFhirDocumentBundle({
          ...bundleInput,
          authorPractitionerId: snapshot.requestedByActorId,
          custodianOrganizationId: snapshot.sourceOrganizationId
        })
      : mapPatientRecordToFhirBundle(bundleInput);

  if (bundle.id !== snapshot.bundleId) {
    throw new DomainError("FHIR Bundle sinh ra không khớp mã Bundle của gói chuyển hồ sơ.");
  }

  return bundle;
}

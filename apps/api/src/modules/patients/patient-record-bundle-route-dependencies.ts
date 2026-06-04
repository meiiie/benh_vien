import type {
  AllergyIntoleranceRepository,
  AuditEventRepository,
  ClinicalDocumentRepository,
  ConditionRepository,
  ConsentRepository,
  DiagnosticReportRepository,
  EncounterRepository,
  ImagingStudyRepository,
  MedicationAdministrationRepository,
  MedicationDispenseRepository,
  MedicationRequestRepository,
  ObservationRepository,
  PatientRepository,
  ProcedureRepository,
  ProviderDirectoryRepository,
  ServiceRequestRepository,
  WorkflowTaskRepository
} from "@benh-vien-so/domain";

export type PatientRecordBundleRouteDependencies = {
  readonly patientRepository: PatientRepository;
  readonly encounterRepository: EncounterRepository;
  readonly allergyIntoleranceRepository: AllergyIntoleranceRepository;
  readonly documentRepository: ClinicalDocumentRepository;
  readonly conditionRepository: ConditionRepository;
  readonly observationRepository: ObservationRepository;
  readonly medicationRequestRepository: MedicationRequestRepository;
  readonly medicationDispenseRepository: MedicationDispenseRepository;
  readonly medicationAdministrationRepository: MedicationAdministrationRepository;
  readonly serviceRequestRepository: ServiceRequestRepository;
  readonly diagnosticReportRepository: DiagnosticReportRepository;
  readonly imagingStudyRepository: ImagingStudyRepository;
  readonly providerDirectoryRepository: ProviderDirectoryRepository;
  readonly workflowTaskRepository: WorkflowTaskRepository;
  readonly procedureRepository: ProcedureRepository;
  readonly consentRepository: ConsentRepository;
  readonly auditRepository: AuditEventRepository;
};

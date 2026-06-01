import type {
  AuditEventRepository,
  AllergyIntoleranceRepository,
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
  RecordTransferDeliveryAttemptRepository,
  RecordTransferRepository,
  ServiceRequestRepository,
  WorkflowTaskRepository
} from "@benh-vien-so/domain";

export type ApiRepositoryOptions = {
  readonly patientRepository?: PatientRepository;
  readonly providerDirectoryRepository?: ProviderDirectoryRepository;
  readonly encounterRepository?: EncounterRepository;
  readonly allergyIntoleranceRepository?: AllergyIntoleranceRepository;
  readonly conditionRepository?: ConditionRepository;
  readonly observationRepository?: ObservationRepository;
  readonly medicationRequestRepository?: MedicationRequestRepository;
  readonly medicationDispenseRepository?: MedicationDispenseRepository;
  readonly medicationAdministrationRepository?: MedicationAdministrationRepository;
  readonly serviceRequestRepository?: ServiceRequestRepository;
  readonly workflowTaskRepository?: WorkflowTaskRepository;
  readonly procedureRepository?: ProcedureRepository;
  readonly diagnosticReportRepository?: DiagnosticReportRepository;
  readonly imagingStudyRepository?: ImagingStudyRepository;
  readonly clinicalDocumentRepository?: ClinicalDocumentRepository;
  readonly consentRepository?: ConsentRepository;
  readonly recordTransferRepository?: RecordTransferRepository;
  readonly recordTransferDeliveryAttemptRepository?: RecordTransferDeliveryAttemptRepository;
  readonly auditEventRepository?: AuditEventRepository;
};

export type ApiRepositories = {
  readonly patientRepository: PatientRepository;
  readonly providerDirectoryRepository: ProviderDirectoryRepository;
  readonly encounterRepository: EncounterRepository;
  readonly allergyIntoleranceRepository: AllergyIntoleranceRepository;
  readonly conditionRepository: ConditionRepository;
  readonly observationRepository: ObservationRepository;
  readonly medicationRequestRepository: MedicationRequestRepository;
  readonly medicationDispenseRepository: MedicationDispenseRepository;
  readonly medicationAdministrationRepository: MedicationAdministrationRepository;
  readonly serviceRequestRepository: ServiceRequestRepository;
  readonly workflowTaskRepository: WorkflowTaskRepository;
  readonly procedureRepository: ProcedureRepository;
  readonly diagnosticReportRepository: DiagnosticReportRepository;
  readonly imagingStudyRepository: ImagingStudyRepository;
  readonly clinicalDocumentRepository: ClinicalDocumentRepository;
  readonly consentRepository: ConsentRepository;
  readonly recordTransferRepository: RecordTransferRepository;
  readonly recordTransferDeliveryAttemptRepository: RecordTransferDeliveryAttemptRepository;
  readonly auditEventRepository: AuditEventRepository;
};

export type CreatedApiRepositories = {
  readonly repositories: ApiRepositories;
  close(): Promise<void>;
};

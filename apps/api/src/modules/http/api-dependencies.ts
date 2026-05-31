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
import { createAuditEventRepository } from "../audit-events/create-audit-event.repository.js";
import { createAllergyIntoleranceRepository } from "../allergy-intolerances/create-allergy-intolerance.repository.js";
import { createClinicalDocumentRepository } from "../clinical-documents/create-clinical-document.repository.js";
import { createConditionRepository } from "../conditions/create-condition.repository.js";
import { createConsentRepository } from "../consents/create-consent.repository.js";
import { createDiagnosticReportRepository } from "../diagnostic-reports/create-diagnostic-report.repository.js";
import { createEncounterRepository } from "../encounters/create-encounter.repository.js";
import { createImagingStudyRepository } from "../imaging-studies/create-imaging-study.repository.js";
import { createMedicationAdministrationRepository } from "../medication-administrations/create-medication-administration.repository.js";
import { createMedicationDispenseRepository } from "../medication-dispenses/create-medication-dispense.repository.js";
import { createMedicationRequestRepository } from "../medication-requests/create-medication-request.repository.js";
import { createObservationRepository } from "../observations/create-observation.repository.js";
import { createPatientRepository } from "../patients/create-patient.repository.js";
import { createProcedureRepository } from "../procedures/create-procedure.repository.js";
import { createProviderDirectoryRepository } from "../provider-directory/create-provider-directory.repository.js";
import { createRecordTransferDeliveryAttemptRepository } from "../record-transfer-delivery-attempts/create-record-transfer-delivery-attempt.repository.js";
import { createRecordTransferRepository } from "../record-transfers/create-record-transfer.repository.js";
import { createServiceRequestRepository } from "../service-requests/create-service-request.repository.js";
import { createWorkflowTaskRepository } from "../workflow-tasks/create-workflow-task.repository.js";

export type ApiRepositoryOptions = {
  readonly patientRepository?: PatientRepository;
  readonly encounterRepository?: EncounterRepository;
  readonly allergyIntoleranceRepository?: AllergyIntoleranceRepository;
  readonly conditionRepository?: ConditionRepository;
  readonly observationRepository?: ObservationRepository;
  readonly providerDirectoryRepository?: ProviderDirectoryRepository;
  readonly recordTransferRepository?: RecordTransferRepository;
  readonly recordTransferDeliveryAttemptRepository?: RecordTransferDeliveryAttemptRepository;
  readonly diagnosticReportRepository?: DiagnosticReportRepository;
  readonly imagingStudyRepository?: ImagingStudyRepository;
  readonly medicationAdministrationRepository?: MedicationAdministrationRepository;
  readonly medicationDispenseRepository?: MedicationDispenseRepository;
  readonly medicationRequestRepository?: MedicationRequestRepository;
  readonly serviceRequestRepository?: ServiceRequestRepository;
  readonly workflowTaskRepository?: WorkflowTaskRepository;
  readonly procedureRepository?: ProcedureRepository;
  readonly clinicalDocumentRepository?: ClinicalDocumentRepository;
  readonly consentRepository?: ConsentRepository;
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

type ClosableRepository = {
  close(): Promise<void>;
};

export async function createApiRepositories(
  options: ApiRepositoryOptions = {}
): Promise<CreatedApiRepositories> {
  const managedRepositories: ClosableRepository[] = [];
  const trackRepository = <Repository>(repository: Repository): Repository => {
    if (isClosableRepository(repository)) {
      managedRepositories.push(repository);
    }

    return repository;
  };

  const repositories: ApiRepositories = {
    patientRepository:
      options.patientRepository ?? trackRepository(await createPatientRepository()),
    providerDirectoryRepository:
      options.providerDirectoryRepository ??
      trackRepository(await createProviderDirectoryRepository()),
    encounterRepository:
      options.encounterRepository ?? trackRepository(await createEncounterRepository()),
    allergyIntoleranceRepository:
      options.allergyIntoleranceRepository ??
      trackRepository(await createAllergyIntoleranceRepository()),
    conditionRepository:
      options.conditionRepository ?? trackRepository(await createConditionRepository()),
    observationRepository:
      options.observationRepository ?? trackRepository(await createObservationRepository()),
    medicationRequestRepository:
      options.medicationRequestRepository ??
      trackRepository(await createMedicationRequestRepository()),
    medicationDispenseRepository:
      options.medicationDispenseRepository ??
      trackRepository(await createMedicationDispenseRepository()),
    medicationAdministrationRepository:
      options.medicationAdministrationRepository ??
      trackRepository(await createMedicationAdministrationRepository()),
    serviceRequestRepository:
      options.serviceRequestRepository ??
      trackRepository(await createServiceRequestRepository()),
    workflowTaskRepository:
      options.workflowTaskRepository ?? trackRepository(await createWorkflowTaskRepository()),
    procedureRepository:
      options.procedureRepository ?? trackRepository(await createProcedureRepository()),
    diagnosticReportRepository:
      options.diagnosticReportRepository ??
      trackRepository(await createDiagnosticReportRepository()),
    imagingStudyRepository:
      options.imagingStudyRepository ?? trackRepository(await createImagingStudyRepository()),
    clinicalDocumentRepository:
      options.clinicalDocumentRepository ??
      trackRepository(await createClinicalDocumentRepository()),
    consentRepository:
      options.consentRepository ?? trackRepository(await createConsentRepository()),
    recordTransferRepository:
      options.recordTransferRepository ??
      trackRepository(await createRecordTransferRepository()),
    recordTransferDeliveryAttemptRepository:
      options.recordTransferDeliveryAttemptRepository ??
      trackRepository(await createRecordTransferDeliveryAttemptRepository()),
    auditEventRepository:
      options.auditEventRepository ?? trackRepository(await createAuditEventRepository())
  };

  return {
    repositories,
    async close() {
      for (const repository of [...managedRepositories].reverse()) {
        await repository.close();
      }
    }
  };
}

function isClosableRepository(repository: unknown): repository is ClosableRepository {
  return (
    typeof repository === "object" &&
    repository !== null &&
    "close" in repository &&
    typeof (repository as { readonly close?: unknown }).close === "function"
  );
}

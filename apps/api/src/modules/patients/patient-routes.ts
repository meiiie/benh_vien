import type { FastifyInstance } from "fastify";
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
  ServiceRequestRepository,
  WorkflowTaskRepository
} from "@benh-vien-so/domain";
import { registerPatientFhirRoutes } from "./patient-fhir-routes.js";
import { registerPatientMergeRoutes } from "./patient-merge-routes.js";
import { registerPatientQueryRoutes } from "./patient-query-routes.js";
import { registerPatientRegistryRoutes } from "./patient-registry-routes.js";

export async function registerPatientRoutes(
  app: FastifyInstance,
  repository: PatientRepository,
  encounterRepository: EncounterRepository,
  allergyIntoleranceRepository: AllergyIntoleranceRepository,
  documentRepository: ClinicalDocumentRepository,
  conditionRepository: ConditionRepository,
  observationRepository: ObservationRepository,
  medicationRequestRepository: MedicationRequestRepository,
  medicationDispenseRepository: MedicationDispenseRepository,
  medicationAdministrationRepository: MedicationAdministrationRepository,
  serviceRequestRepository: ServiceRequestRepository,
  diagnosticReportRepository: DiagnosticReportRepository,
  imagingStudyRepository: ImagingStudyRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  workflowTaskRepository: WorkflowTaskRepository,
  procedureRepository: ProcedureRepository,
  consentRepository: ConsentRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  await registerPatientRegistryRoutes(
    app,
    repository,
    providerDirectoryRepository,
    auditRepository
  );
  await registerPatientMergeRoutes(app, repository, providerDirectoryRepository, auditRepository);
  await registerPatientQueryRoutes(app, repository, providerDirectoryRepository, auditRepository);
  await registerPatientFhirRoutes(
    app,
    repository,
    encounterRepository,
    allergyIntoleranceRepository,
    documentRepository,
    conditionRepository,
    observationRepository,
    medicationRequestRepository,
    medicationDispenseRepository,
    medicationAdministrationRepository,
    serviceRequestRepository,
    diagnosticReportRepository,
    imagingStudyRepository,
    providerDirectoryRepository,
    workflowTaskRepository,
    procedureRepository,
    consentRepository,
    auditRepository
  );
}

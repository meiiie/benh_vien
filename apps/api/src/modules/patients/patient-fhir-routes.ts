import type { FastifyInstance } from "fastify";
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
import { registerPatientFhirResourceRoutes } from "./patient-fhir-resource-routes.js";
import { registerPatientRecordBundleRoutes } from "./patient-record-bundle-routes.js";

export async function registerPatientFhirRoutes(
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
  await registerPatientFhirResourceRoutes(
    app,
    repository,
    providerDirectoryRepository,
    auditRepository
  );
  await registerPatientRecordBundleRoutes(
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

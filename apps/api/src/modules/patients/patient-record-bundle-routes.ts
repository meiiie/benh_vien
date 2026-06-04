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
import { registerPatientFhirBundleCollectionRoutes } from "./patient-record-bundle-collection-routes.js";
import { registerPatientFhirDocumentBundleRoutes } from "./patient-record-document-bundle-routes.js";
import type { PatientRecordBundleRouteDependencies } from "./patient-record-bundle-route-dependencies.js";

export async function registerPatientRecordBundleRoutes(
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
  const dependencies: PatientRecordBundleRouteDependencies = {
    patientRepository: repository,
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
  };

  await registerPatientFhirBundleCollectionRoutes(app, dependencies);
  await registerPatientFhirDocumentBundleRoutes(app, dependencies);
}

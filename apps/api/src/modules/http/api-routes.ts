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
  RecordTransferDeliveryAttemptRepository,
  RecordTransferRepository,
  ServiceRequestRepository,
  WorkflowTaskRepository
} from "@benh-vien-so/domain";
import { registerAuditEventRoutes } from "../audit-events/audit-event-routes.js";
import { registerAllergyIntoleranceRoutes } from "../allergy-intolerances/allergy-intolerance-routes.js";
import { registerAuthRoutes } from "../auth/auth-routes.js";
import type { LoginRateLimiter } from "../auth/login-rate-limit.js";
import { registerClinicalDocumentRoutes } from "../clinical-documents/clinical-document-routes.js";
import { registerConditionRoutes } from "../conditions/condition-routes.js";
import { registerConsentRoutes } from "../consents/consent-routes.js";
import { registerDiagnosticReportRoutes } from "../diagnostic-reports/diagnostic-report-routes.js";
import { registerEncounterRoutes } from "../encounters/encounter-routes.js";
import { registerImagingStudyRoutes } from "../imaging-studies/imaging-study-routes.js";
import { registerMedicationAdministrationRoutes } from "../medication-administrations/medication-administration-routes.js";
import { registerMedicationDispenseRoutes } from "../medication-dispenses/medication-dispense-routes.js";
import { registerMedicationRequestRoutes } from "../medication-requests/medication-request-routes.js";
import { registerObservationRoutes } from "../observations/observation-routes.js";
import { registerPatientRoutes } from "../patients/patient-routes.js";
import { registerProcedureRoutes } from "../procedures/procedure-routes.js";
import { registerProviderDirectoryRoutes } from "../provider-directory/provider-directory-routes.js";
import { registerRecordTransferRoutes } from "../record-transfers/record-transfer-routes.js";
import { registerServiceRequestRoutes } from "../service-requests/service-request-routes.js";
import { registerWorkflowTaskRoutes } from "../workflow-tasks/workflow-task-routes.js";
import {
  registerApiSystemRoutes,
  type ApiSystemRoutesOptions
} from "./system-routes.js";

export type ApiRoutesDependencies = {
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
  readonly loginRateLimiter: LoginRateLimiter;
};

export async function registerApiRoutes(
  app: FastifyInstance,
  dependencies: ApiRoutesDependencies,
  runtime: ApiSystemRoutesOptions
): Promise<void> {
  await app.register(
    async (api) => {
      registerApiSystemRoutes(api, runtime);

      await registerAuthRoutes(api, {
        auditRepository: dependencies.auditEventRepository,
        loginRateLimiter: dependencies.loginRateLimiter
      });
      await registerPatientRoutes(
        api,
        dependencies.patientRepository,
        dependencies.encounterRepository,
        dependencies.allergyIntoleranceRepository,
        dependencies.clinicalDocumentRepository,
        dependencies.conditionRepository,
        dependencies.observationRepository,
        dependencies.medicationRequestRepository,
        dependencies.medicationDispenseRepository,
        dependencies.medicationAdministrationRepository,
        dependencies.serviceRequestRepository,
        dependencies.diagnosticReportRepository,
        dependencies.imagingStudyRepository,
        dependencies.providerDirectoryRepository,
        dependencies.workflowTaskRepository,
        dependencies.procedureRepository,
        dependencies.consentRepository,
        dependencies.auditEventRepository
      );
      await registerProviderDirectoryRoutes(
        api,
        dependencies.providerDirectoryRepository,
        dependencies.auditEventRepository
      );
      await registerConsentRoutes(
        api,
        dependencies.patientRepository,
        dependencies.consentRepository,
        dependencies.providerDirectoryRepository,
        dependencies.auditEventRepository
      );
      await registerRecordTransferRoutes(
        api,
        dependencies.patientRepository,
        dependencies.consentRepository,
        dependencies.recordTransferRepository,
        dependencies.recordTransferDeliveryAttemptRepository,
        dependencies.providerDirectoryRepository,
        dependencies.auditEventRepository
      );
      await registerEncounterRoutes(
        api,
        dependencies.patientRepository,
        dependencies.encounterRepository,
        dependencies.providerDirectoryRepository,
        dependencies.auditEventRepository
      );
      await registerAllergyIntoleranceRoutes(
        api,
        dependencies.patientRepository,
        dependencies.encounterRepository,
        dependencies.allergyIntoleranceRepository,
        dependencies.providerDirectoryRepository,
        dependencies.auditEventRepository
      );
      await registerConditionRoutes(
        api,
        dependencies.patientRepository,
        dependencies.encounterRepository,
        dependencies.conditionRepository,
        dependencies.providerDirectoryRepository,
        dependencies.auditEventRepository
      );
      await registerObservationRoutes(
        api,
        dependencies.patientRepository,
        dependencies.encounterRepository,
        dependencies.observationRepository,
        dependencies.providerDirectoryRepository,
        dependencies.auditEventRepository
      );
      await registerMedicationRequestRoutes(
        api,
        dependencies.patientRepository,
        dependencies.encounterRepository,
        dependencies.conditionRepository,
        dependencies.medicationRequestRepository,
        dependencies.providerDirectoryRepository,
        dependencies.auditEventRepository
      );
      await registerMedicationDispenseRoutes(
        api,
        dependencies.patientRepository,
        dependencies.encounterRepository,
        dependencies.medicationRequestRepository,
        dependencies.medicationDispenseRepository,
        dependencies.providerDirectoryRepository,
        dependencies.auditEventRepository
      );
      await registerMedicationAdministrationRoutes(
        api,
        dependencies.patientRepository,
        dependencies.encounterRepository,
        dependencies.conditionRepository,
        dependencies.medicationRequestRepository,
        dependencies.medicationAdministrationRepository,
        dependencies.providerDirectoryRepository,
        dependencies.auditEventRepository
      );
      await registerServiceRequestRoutes(
        api,
        dependencies.patientRepository,
        dependencies.encounterRepository,
        dependencies.conditionRepository,
        dependencies.serviceRequestRepository,
        dependencies.providerDirectoryRepository,
        dependencies.auditEventRepository
      );
      await registerWorkflowTaskRoutes(
        api,
        dependencies.patientRepository,
        dependencies.encounterRepository,
        dependencies.serviceRequestRepository,
        dependencies.workflowTaskRepository,
        dependencies.providerDirectoryRepository,
        dependencies.auditEventRepository
      );
      await registerProcedureRoutes(
        api,
        dependencies.patientRepository,
        dependencies.encounterRepository,
        dependencies.conditionRepository,
        dependencies.serviceRequestRepository,
        dependencies.diagnosticReportRepository,
        dependencies.clinicalDocumentRepository,
        dependencies.procedureRepository,
        dependencies.providerDirectoryRepository,
        dependencies.auditEventRepository
      );
      await registerDiagnosticReportRoutes(
        api,
        dependencies.patientRepository,
        dependencies.encounterRepository,
        dependencies.serviceRequestRepository,
        dependencies.observationRepository,
        dependencies.diagnosticReportRepository,
        dependencies.providerDirectoryRepository,
        dependencies.auditEventRepository
      );
      await registerImagingStudyRoutes(
        api,
        dependencies.patientRepository,
        dependencies.encounterRepository,
        dependencies.serviceRequestRepository,
        dependencies.diagnosticReportRepository,
        dependencies.imagingStudyRepository,
        dependencies.providerDirectoryRepository,
        dependencies.auditEventRepository
      );
      await registerClinicalDocumentRoutes(
        api,
        dependencies.patientRepository,
        dependencies.encounterRepository,
        dependencies.clinicalDocumentRepository,
        dependencies.providerDirectoryRepository,
        dependencies.auditEventRepository
      );
      await registerAuditEventRoutes(
        api,
        dependencies.patientRepository,
        dependencies.providerDirectoryRepository,
        dependencies.auditEventRepository
      );
    },
    {
      prefix: "/api/v1"
    }
  );
}

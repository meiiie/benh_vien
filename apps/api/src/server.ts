import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import Fastify from "fastify";
import { buildWiiiCareCapabilityStatement } from "@benh-vien-so/domain";
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
  RecordTransferRepository,
  ServiceRequestRepository,
  WorkflowTaskRepository
} from "@benh-vien-so/domain";
import { createAuditEventRepository } from "./modules/audit-events/create-audit-event.repository.js";
import { registerAuditEventRoutes } from "./modules/audit-events/audit-event-routes.js";
import { createAllergyIntoleranceRepository } from "./modules/allergy-intolerances/create-allergy-intolerance.repository.js";
import { registerAllergyIntoleranceRoutes } from "./modules/allergy-intolerances/allergy-intolerance-routes.js";
import { registerAuthRoutes } from "./modules/auth/auth-routes.js";
import { createClinicalDocumentRepository } from "./modules/clinical-documents/create-clinical-document.repository.js";
import { registerClinicalDocumentRoutes } from "./modules/clinical-documents/clinical-document-routes.js";
import { createConditionRepository } from "./modules/conditions/create-condition.repository.js";
import { registerConditionRoutes } from "./modules/conditions/condition-routes.js";
import { createConsentRepository } from "./modules/consents/create-consent.repository.js";
import { registerConsentRoutes } from "./modules/consents/consent-routes.js";
import { createDiagnosticReportRepository } from "./modules/diagnostic-reports/create-diagnostic-report.repository.js";
import { registerDiagnosticReportRoutes } from "./modules/diagnostic-reports/diagnostic-report-routes.js";
import { createEncounterRepository } from "./modules/encounters/create-encounter.repository.js";
import { registerEncounterRoutes } from "./modules/encounters/encounter-routes.js";
import { createImagingStudyRepository } from "./modules/imaging-studies/create-imaging-study.repository.js";
import { registerImagingStudyRoutes } from "./modules/imaging-studies/imaging-study-routes.js";
import { createMedicationAdministrationRepository } from "./modules/medication-administrations/create-medication-administration.repository.js";
import { registerMedicationAdministrationRoutes } from "./modules/medication-administrations/medication-administration-routes.js";
import { createMedicationDispenseRepository } from "./modules/medication-dispenses/create-medication-dispense.repository.js";
import { registerMedicationDispenseRoutes } from "./modules/medication-dispenses/medication-dispense-routes.js";
import { createMedicationRequestRepository } from "./modules/medication-requests/create-medication-request.repository.js";
import { registerMedicationRequestRoutes } from "./modules/medication-requests/medication-request-routes.js";
import { createObservationRepository } from "./modules/observations/create-observation.repository.js";
import { registerObservationRoutes } from "./modules/observations/observation-routes.js";
import { createPatientRepository } from "./modules/patients/create-patient.repository.js";
import { registerPatientRoutes } from "./modules/patients/patient-routes.js";
import { createProcedureRepository } from "./modules/procedures/create-procedure.repository.js";
import { registerProcedureRoutes } from "./modules/procedures/procedure-routes.js";
import { createProviderDirectoryRepository } from "./modules/provider-directory/create-provider-directory.repository.js";
import { registerProviderDirectoryRoutes } from "./modules/provider-directory/provider-directory-routes.js";
import { createRecordTransferRepository } from "./modules/record-transfers/create-record-transfer.repository.js";
import { registerRecordTransferRoutes } from "./modules/record-transfers/record-transfer-routes.js";
import { createServiceRequestRepository } from "./modules/service-requests/create-service-request.repository.js";
import { registerServiceRequestRoutes } from "./modules/service-requests/service-request-routes.js";
import { createWorkflowTaskRepository } from "./modules/workflow-tasks/create-workflow-task.repository.js";
import { registerWorkflowTaskRoutes } from "./modules/workflow-tasks/workflow-task-routes.js";

export type ServerOptions = {
  readonly patientRepository?: PatientRepository;
  readonly encounterRepository?: EncounterRepository;
  readonly allergyIntoleranceRepository?: AllergyIntoleranceRepository;
  readonly conditionRepository?: ConditionRepository;
  readonly observationRepository?: ObservationRepository;
  readonly providerDirectoryRepository?: ProviderDirectoryRepository;
  readonly recordTransferRepository?: RecordTransferRepository;
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
  readonly logger?: boolean;
};

type ClosableRepository = {
  close(): Promise<void>;
};

export async function buildServer(options: ServerOptions = {}) {
  const app = Fastify({
    logger: options.logger ?? true
  });
  const managedRepositories: ClosableRepository[] = [];
  const trackRepository = <Repository>(repository: Repository): Repository => {
    if (isClosableRepository(repository)) {
      managedRepositories.push(repository);
    }

    return repository;
  };

  await app.register(cors, {
    origin: true
  });

  await app.register(swagger, {
    openapi: {
      info: {
        title: "WiiiCare Nexus API",
        version: "0.2.0",
        description: "API thử nghiệm cho hồ sơ bệnh án điện tử và liên thông FHIR."
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "HMAC"
          }
        }
      },
      tags: [
        {
          name: "fhir",
          description: "FHIR facade metadata and interoperability discovery"
        },
        {
          name: "auth",
          description: "Đăng nhập demo và xác thực phiên truy cập"
        },
        {
          name: "encounters",
          description: "Quản lý lượt khám, đợt điều trị và FHIR Encounter"
        },
        {
          name: "allergy-intolerances",
          description: "Quản lý dị ứng, chống chỉ định và FHIR AllergyIntolerance"
        },
        {
          name: "conditions",
          description: "Quản lý chẩn đoán, vấn đề sức khỏe và FHIR Condition"
        },
        {
          name: "observations",
          description: "Quản lý sinh hiệu, kết quả xét nghiệm có cấu trúc và FHIR Observation"
        },
        {
          name: "medication-requests",
          description: "Quản lý chỉ định thuốc, đơn thuốc và FHIR MedicationRequest"
        },
        {
          name: "medication-dispenses",
          description: "Quản lý cấp phát thuốc từ dược/kho và FHIR MedicationDispense"
        },
        {
          name: "medication-administrations",
          description: "Quản lý lần dùng thuốc thực tế và FHIR MedicationAdministration"
        },
        {
          name: "service-requests",
          description: "Quản lý chỉ định xét nghiệm, hình ảnh, thủ thuật và FHIR ServiceRequest"
        },
        {
          name: "workflow-tasks",
          description: "Quản lý hàng đợi thực thi y lệnh và FHIR Task"
        },
        {
          name: "procedures",
          description: "Quản lý thủ thuật, hoạt động y tế đã thực hiện và FHIR Procedure"
        },
        {
          name: "diagnostic-reports",
          description: "Quản lý báo cáo xét nghiệm, hình ảnh và FHIR DiagnosticReport"
        },
        {
          name: "imaging-studies",
          description: "Quan ly metadata PACS/DICOM va FHIR ImagingStudy"
        },
        {
          name: "clinical-documents",
          description: "Quản lý tài liệu lâm sàng và FHIR DocumentReference"
        },
        {
          name: "audit-events",
          description: "Truy vết truy cập, kiểm tra toàn vẹn audit và xuất FHIR AuditEvent"
        },
        {
          name: "patients",
          description: "Quản lý định danh và hồ sơ bệnh nhân"
        },
        {
          name: "provider-directory",
          description: "Quản lý danh bạ cơ sở y tế, nhân sự và endpoint liên thông FHIR/PACS/LIS"
        }
      ]
    }
  });

  await app.register(swaggerUi, {
    routePrefix: "/docs"
  });

  const patientRepository =
    options.patientRepository ?? trackRepository(await createPatientRepository());
  const providerDirectoryRepository =
    options.providerDirectoryRepository ??
    trackRepository(await createProviderDirectoryRepository());
  const encounterRepository =
    options.encounterRepository ?? trackRepository(await createEncounterRepository());
  const allergyIntoleranceRepository =
    options.allergyIntoleranceRepository ??
    trackRepository(await createAllergyIntoleranceRepository());
  const conditionRepository =
    options.conditionRepository ?? trackRepository(await createConditionRepository());
  const observationRepository =
    options.observationRepository ?? trackRepository(await createObservationRepository());
  const medicationRequestRepository =
    options.medicationRequestRepository ??
    trackRepository(await createMedicationRequestRepository());
  const medicationDispenseRepository =
    options.medicationDispenseRepository ??
    trackRepository(await createMedicationDispenseRepository());
  const medicationAdministrationRepository =
    options.medicationAdministrationRepository ??
    trackRepository(await createMedicationAdministrationRepository());
  const serviceRequestRepository =
    options.serviceRequestRepository ?? trackRepository(await createServiceRequestRepository());
  const workflowTaskRepository =
    options.workflowTaskRepository ?? trackRepository(await createWorkflowTaskRepository());
  const procedureRepository =
    options.procedureRepository ?? trackRepository(await createProcedureRepository());
  const diagnosticReportRepository =
    options.diagnosticReportRepository ??
    trackRepository(await createDiagnosticReportRepository());
  const imagingStudyRepository =
    options.imagingStudyRepository ?? trackRepository(await createImagingStudyRepository());
  const clinicalDocumentRepository =
    options.clinicalDocumentRepository ??
    trackRepository(await createClinicalDocumentRepository());
  const consentRepository =
    options.consentRepository ?? trackRepository(await createConsentRepository());
  const recordTransferRepository =
    options.recordTransferRepository ?? trackRepository(await createRecordTransferRepository());
  const auditEventRepository =
    options.auditEventRepository ?? trackRepository(await createAuditEventRepository());

  app.addHook("onClose", async () => {
    for (const repository of [...managedRepositories].reverse()) {
      await repository.close();
    }
  });

  app.get("/health", async () => ({
    status: "ok",
    service: "benh-vien-so-api"
  }));

  app.get("/ready", async (_request, reply) => {
    const checkedAt = new Date().toISOString();
    const startedAt = Date.now();

    try {
      const [patients, providerDirectory] = await Promise.all([
        patientRepository.findAll(),
        providerDirectoryRepository.findDirectory()
      ]);
      const providerDirectorySnapshot = providerDirectory.toSnapshot();

      return {
        status: "ready",
        service: "benh-vien-so-api",
        repository: process.env.BVS_REPOSITORY ?? "in-memory",
        checkedAt,
        latencyMs: Date.now() - startedAt,
        checks: {
          patients: {
            status: "ok",
            count: patients.length
          },
          providerDirectory: {
            status: "ok",
            organizations: providerDirectorySnapshot.organizations.length,
            practitioners: providerDirectorySnapshot.practitioners.length,
            endpoints: providerDirectorySnapshot.endpoints.length
          }
        }
      };
    } catch {
      return reply.status(503).send({
        status: "not_ready",
        service: "benh-vien-so-api",
        repository: process.env.BVS_REPOSITORY ?? "in-memory",
        checkedAt,
        checks: {
          patients: {
            status: "unknown"
          },
          providerDirectory: {
            status: "unknown"
          }
        }
      });
    }
  });

  await app.register(
    async (api) => {
      api.get("/fhir/metadata", async () =>
        buildWiiiCareCapabilityStatement({
          implementationUrl:
            process.env.BVS_PUBLIC_API_BASE_URL ?? "http://localhost:7310/api/v1"
        })
      );

      await registerAuthRoutes(api);
      await registerPatientRoutes(
        api,
        patientRepository,
        encounterRepository,
        allergyIntoleranceRepository,
        clinicalDocumentRepository,
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
        auditEventRepository
      );
      await registerProviderDirectoryRoutes(
        api,
        providerDirectoryRepository,
        auditEventRepository
      );
      await registerConsentRoutes(
        api,
        patientRepository,
        consentRepository,
        auditEventRepository
      );
      await registerRecordTransferRoutes(
        api,
        patientRepository,
        consentRepository,
        recordTransferRepository,
        auditEventRepository
      );
      await registerEncounterRoutes(
        api,
        patientRepository,
        encounterRepository,
        auditEventRepository
      );
      await registerAllergyIntoleranceRoutes(
        api,
        patientRepository,
        encounterRepository,
        allergyIntoleranceRepository,
        auditEventRepository
      );
      await registerConditionRoutes(
        api,
        patientRepository,
        encounterRepository,
        conditionRepository,
        auditEventRepository
      );
      await registerObservationRoutes(
        api,
        patientRepository,
        encounterRepository,
        observationRepository,
        auditEventRepository
      );
      await registerMedicationRequestRoutes(
        api,
        patientRepository,
        encounterRepository,
        conditionRepository,
        medicationRequestRepository,
        auditEventRepository
      );
      await registerMedicationDispenseRoutes(
        api,
        patientRepository,
        encounterRepository,
        medicationRequestRepository,
        medicationDispenseRepository,
        auditEventRepository
      );
      await registerMedicationAdministrationRoutes(
        api,
        patientRepository,
        encounterRepository,
        conditionRepository,
        medicationRequestRepository,
        medicationAdministrationRepository,
        auditEventRepository
      );
      await registerServiceRequestRoutes(
        api,
        patientRepository,
        encounterRepository,
        conditionRepository,
        serviceRequestRepository,
        auditEventRepository
      );
      await registerWorkflowTaskRoutes(
        api,
        patientRepository,
        encounterRepository,
        serviceRequestRepository,
        workflowTaskRepository,
        auditEventRepository
      );
      await registerProcedureRoutes(
        api,
        patientRepository,
        encounterRepository,
        conditionRepository,
        serviceRequestRepository,
        diagnosticReportRepository,
        clinicalDocumentRepository,
        procedureRepository,
        auditEventRepository
      );
      await registerDiagnosticReportRoutes(
        api,
        patientRepository,
        encounterRepository,
        serviceRequestRepository,
        observationRepository,
        diagnosticReportRepository,
        auditEventRepository
      );
      await registerImagingStudyRoutes(
        api,
        patientRepository,
        encounterRepository,
        serviceRequestRepository,
        diagnosticReportRepository,
        imagingStudyRepository,
        auditEventRepository
      );
      await registerClinicalDocumentRoutes(
        api,
        patientRepository,
        encounterRepository,
        clinicalDocumentRepository,
        auditEventRepository
      );
      await registerAuditEventRoutes(api, patientRepository, auditEventRepository);
    },
    {
      prefix: "/api/v1"
    }
  );

  return app;
}

function isClosableRepository(repository: unknown): repository is ClosableRepository {
  return (
    typeof repository === "object" &&
    repository !== null &&
    "close" in repository &&
    typeof (repository as { readonly close?: unknown }).close === "function"
  );
}

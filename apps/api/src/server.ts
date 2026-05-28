import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import Fastify from "fastify";
import { ZodError } from "zod";
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
import { assertAuthConfiguration } from "./modules/auth/auth-session.js";
import {
  createLoginRateLimiterFromEnv,
  type LoginRateLimiter
} from "./modules/auth/login-rate-limit.js";
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
  readonly loginRateLimiter?: LoginRateLimiter;
  readonly logger?: boolean;
};

type ClosableRepository = {
  close(): Promise<void>;
};

export async function buildServer(options: ServerOptions = {}) {
  assertAuthConfiguration();

  const app = Fastify({
    logger: options.logger ?? true,
    requestIdHeader: "x-request-id"
  });
  const loginRateLimiter = options.loginRateLimiter ?? createLoginRateLimiterFromEnv();
  const managedRepositories: ClosableRepository[] = [];
  const trackRepository = <Repository>(repository: Repository): Repository => {
    if (isClosableRepository(repository)) {
      managedRepositories.push(repository);
    }

    return repository;
  };

  await app.register(cors, {
    origin: resolveCorsOrigins()
  });
  app.addHook("onRequest", async (request, reply) => {
    reply.header("X-Request-Id", request.id);
    reply.header("X-Content-Type-Options", "nosniff");
    reply.header("X-Frame-Options", "DENY");
    reply.header("Referrer-Policy", "no-referrer");
    reply.header("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    reply.header("Cross-Origin-Resource-Policy", "same-site");
    reply.header("Cache-Control", "no-store");
    reply.header("Pragma", "no-cache");
  });
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        error: "VALIDATION_ERROR",
        message: "Request validation failed.",
        requestId: request.id,
        issues: error.issues
      });
    }

    const statusCode = readHttpStatusCode(error);

    if (statusCode >= 400 && statusCode < 500) {
      return reply.status(statusCode).send({
        error: "REQUEST_ERROR",
        message: "Request could not be processed.",
        requestId: request.id
      });
    }

    request.log.error({ err: error, requestId: request.id }, "Unhandled request error");

    return reply.status(500).send({
      error: "INTERNAL_SERVER_ERROR",
      message: "Unexpected internal server error.",
      requestId: request.id
    });
  });
  app.addHook("onSend", async (request, reply, payload) => {
    if (reply.statusCode < 400 || hasFhirContentType(reply)) {
      return payload;
    }

    const payloadText = readPayloadText(payload);

    if (!payloadText) {
      return payload;
    }

    return injectRequestIdIntoErrorPayload(payloadText, request.id) ?? payload;
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
      const [patients, providerDirectory, loginRateLimit] = await Promise.all([
        patientRepository.findAll(),
        providerDirectoryRepository.findDirectory(),
        loginRateLimiter.check()
      ]);
      const providerDirectorySnapshot = providerDirectory.toSnapshot();
      const checks = {
        patients: {
          status: "ok",
          count: patients.length
        },
        providerDirectory: {
          status: "ok",
          organizations: providerDirectorySnapshot.organizations.length,
          practitioners: providerDirectorySnapshot.practitioners.length,
          endpoints: providerDirectorySnapshot.endpoints.length
        },
        loginRateLimit
      };

      if (loginRateLimit.status !== "ok") {
        return reply.status(503).send({
          status: "not_ready",
          service: "benh-vien-so-api",
          repository: process.env.BVS_REPOSITORY ?? "in-memory",
          checkedAt,
          latencyMs: Date.now() - startedAt,
          checks
        });
      }

      return {
        status: "ready",
        service: "benh-vien-so-api",
        repository: process.env.BVS_REPOSITORY ?? "in-memory",
        checkedAt,
        latencyMs: Date.now() - startedAt,
        checks
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
          },
          loginRateLimit: {
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

      await registerAuthRoutes(api, {
        loginRateLimiter
      });
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

function resolveCorsOrigins(): boolean | string[] {
  const configuredOrigins = process.env.BVS_CORS_ORIGINS;

  if (configuredOrigins) {
    const origins = configuredOrigins
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean);

    if (origins.length > 0) {
      return origins;
    }
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("BVS_CORS_ORIGINS must be set in production.");
  }

  return true;
}

function readHttpStatusCode(error: unknown): number {
  const statusCode = (error as { readonly statusCode?: unknown }).statusCode;

  return typeof statusCode === "number" ? statusCode : 500;
}

function readPayloadText(payload: unknown): string | undefined {
  if (typeof payload === "string") {
    return payload;
  }

  if (Buffer.isBuffer(payload)) {
    return payload.toString("utf8");
  }

  return undefined;
}

function injectRequestIdIntoErrorPayload(
  payload: string,
  requestId: string
): string | undefined {
  try {
    const parsedPayload = JSON.parse(payload) as unknown;

    if (!isErrorEnvelopeWithoutRequestId(parsedPayload)) {
      return undefined;
    }

    return JSON.stringify({
      ...parsedPayload,
      requestId
    });
  } catch {
    return undefined;
  }
}

function isErrorEnvelopeWithoutRequestId(
  value: unknown
): value is { readonly error: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    "error" in value &&
    typeof (value as { readonly error?: unknown }).error === "string" &&
    !("requestId" in value)
  );
}

function hasFhirContentType(reply: {
  getHeader(name: string): number | string | string[] | undefined;
}): boolean {
  const contentType = reply.getHeader("content-type");

  if (Array.isArray(contentType)) {
    return contentType.some((value) => value.includes("application/fhir+json"));
  }

  return typeof contentType === "string" && contentType.includes("application/fhir+json");
}

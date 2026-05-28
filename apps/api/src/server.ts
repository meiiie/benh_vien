import { randomUUID } from "node:crypto";
import { isIP } from "node:net";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import Fastify from "fastify";
import type { FastifyRequest } from "fastify";
import { ZodError } from "zod";
import {
  buildFhirOperationOutcome,
  buildWiiiCareCapabilityStatement
} from "@benh-vien-so/domain";
import type {
  ActorContext,
  AuditEventRepository,
  AuditResourceType,
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
import { readActorContext } from "./modules/access-control/access-context.js";
import { recordAuditEvent } from "./modules/audit-events/audit-context.js";
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
import { createRecordTransferDeliveryAttemptRepository } from "./modules/record-transfer-delivery-attempts/create-record-transfer-delivery-attempt.repository.js";
import { startRecordTransferDeliveryWorker } from "./modules/record-transfer-delivery-attempts/record-transfer-delivery-worker.js";
import { createRecordTransferRepository } from "./modules/record-transfers/create-record-transfer.repository.js";
import { assertRecordTransferCallbackSignatureConfiguration } from "./modules/record-transfers/record-transfer-callback-signature.js";
import { registerRecordTransferRoutes } from "./modules/record-transfers/record-transfer-routes.js";
import { startRecordTransferRetryWorker } from "./modules/record-transfers/record-transfer-retry-worker.js";
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
  readonly loginRateLimiter?: LoginRateLimiter;
  readonly logger?: boolean;
};

type ClosableRepository = {
  close(): Promise<void>;
};

type RecordTransferRetryWorkerConfig = {
  readonly intervalMs: number;
  readonly limit: number;
  readonly maxRetryCount: number;
  readonly runImmediately: boolean;
};

type RecordTransferDeliveryWorkerConfig = {
  readonly intervalMs: number;
  readonly limit: number;
  readonly timeoutMs: number;
  readonly retryDelayMs: number;
  readonly runImmediately: boolean;
};

type DeniedAccessPayload = {
  readonly error: "FORBIDDEN" | "PATIENT_ACCESS_DENIED";
  readonly requestId?: string;
  readonly permission?: string;
  readonly patientId?: string;
  readonly actor?: {
    readonly id?: string;
    readonly role?: string;
    readonly purposeOfUse?: string;
  };
};

const auditResourceByPermissionPrefix: Record<string, AuditResourceType> = {
  "patient:": "Patient",
  "provider-directory:": "ProviderDirectory",
  "record-transfer:": "RecordTransfer",
  "encounter:": "Encounter",
  "allergy-intolerance:": "AllergyIntolerance",
  "condition:": "Condition",
  "medication-request:": "MedicationRequest",
  "medication-dispense:": "MedicationDispense",
  "medication-administration:": "MedicationAdministration",
  "observation:": "Observation",
  "service-request:": "ServiceRequest",
  "workflow-task:": "Task",
  "procedure:": "Procedure",
  "diagnostic-report:": "DiagnosticReport",
  "imaging-study:": "ImagingStudy",
  "clinical-document:": "ClinicalDocument",
  "consent:": "Consent",
  "audit-event:": "AuditEvent"
};

const requestIdHeaderName = "x-request-id";
const maxRequestIdLength = 128;
const requestIdPattern = /^[A-Za-z0-9._:-]+$/;
const defaultPublicApiBaseUrl = "http://localhost:7310/api/v1";
const apiVersion = "0.2.0";
const defaultHttpBodyLimitBytes = 1_048_576;
const minHttpBodyLimitBytes = 1_024;
const maxHttpBodyLimitBytes = 10 * 1_024 * 1_024;

export async function buildServer(options: ServerOptions = {}) {
  assertAuthConfiguration();
  assertRepositoryConfiguration();
  const publicApiBaseUrl = resolvePublicApiBaseUrl();
  const httpBodyLimitBytes = readBoundedIntegerEnv(
    "BVS_HTTP_BODY_LIMIT_BYTES",
    defaultHttpBodyLimitBytes,
    minHttpBodyLimitBytes,
    maxHttpBodyLimitBytes
  );
  const apiDocsEnabled = readBooleanEnv(
    "BVS_API_DOCS_ENABLED",
    process.env.NODE_ENV !== "production"
  );

  const app = Fastify({
    logger: options.logger ?? true,
    requestIdHeader: false,
    genReqId: createRequestId,
    bodyLimit: httpBodyLimitBytes
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
  assertRecordTransferCallbackSignatureConfiguration();
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
      if (acceptsFhirJson(request)) {
        return reply
          .status(400)
          .type("application/fhir+json; charset=utf-8")
          .send(buildValidationOperationOutcome(error));
      }

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

  if (apiDocsEnabled) {
    await app.register(swagger, {
      openapi: {
        info: {
          title: "WiiiCare Nexus API",
          version: apiVersion,
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
            description: "Quản lý siêu dữ liệu PACS/DICOM và FHIR ImagingStudy"
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
            description:
              "Quản lý danh bạ cơ sở y tế, nhân sự và endpoint liên thông FHIR/PACS/LIS"
          }
        ]
      }
    });

    await app.register(swaggerUi, {
      routePrefix: "/docs"
    });
  }

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
  const recordTransferDeliveryAttemptRepository =
    options.recordTransferDeliveryAttemptRepository ??
    trackRepository(await createRecordTransferDeliveryAttemptRepository());
  const auditEventRepository =
    options.auditEventRepository ?? trackRepository(await createAuditEventRepository());
  const recordTransferRetryWorkerConfig = resolveRecordTransferRetryWorkerConfig();
  const recordTransferRetryWorker = recordTransferRetryWorkerConfig
    ? startRecordTransferRetryWorker(
        {
          recordTransferRepository,
          auditRepository: auditEventRepository
        },
        {
          ...recordTransferRetryWorkerConfig,
          logger: app.log
        }
      )
    : undefined;
  const recordTransferDeliveryWorkerConfig = resolveRecordTransferDeliveryWorkerConfig();
  const recordTransferDeliveryWorker = recordTransferDeliveryWorkerConfig
    ? startRecordTransferDeliveryWorker(
        {
          patientRepository,
          encounterRepository,
          allergyIntoleranceRepository,
          clinicalDocumentRepository,
          conditionRepository,
          observationRepository,
          diagnosticReportRepository,
          imagingStudyRepository,
          medicationRequestRepository,
          medicationDispenseRepository,
          medicationAdministrationRepository,
          serviceRequestRepository,
          workflowTaskRepository,
          procedureRepository,
          consentRepository,
          providerDirectoryRepository,
          recordTransferRepository,
          deliveryAttemptRepository: recordTransferDeliveryAttemptRepository,
          auditRepository: auditEventRepository
        },
        {
          ...recordTransferDeliveryWorkerConfig,
          logger: app.log
        }
      )
    : undefined;
  const deniedAccessPayloads = new WeakMap<FastifyRequest, DeniedAccessPayload>();

  app.addHook("onSend", (request, reply, payload, done) => {
    rememberDeniedAccessForAudit(
      deniedAccessPayloads,
      request,
      reply.statusCode,
      payload
    );

    done(null, payload);
  });
  app.addHook("onResponse", async (request, reply) => {
    const deniedAccess = deniedAccessPayloads.get(request);

    if (!deniedAccess) {
      return;
    }

    deniedAccessPayloads.delete(request);
    await recordDeniedAccessAuditEvent(
      auditEventRepository,
      request,
      reply.statusCode,
      deniedAccess
    );
  });

  app.addHook("onClose", async () => {
    recordTransferDeliveryWorker?.close();
    recordTransferRetryWorker?.close();

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
      api.get("/runtime", async (request) =>
        buildApiRuntimeInfo({
          publicApiBaseUrl,
          httpBodyLimitBytes,
          apiDocsEnabled,
          recordTransferDeliveryWorkerEnabled: Boolean(recordTransferDeliveryWorkerConfig),
          recordTransferRetryWorkerEnabled: Boolean(recordTransferRetryWorkerConfig),
          actor: readActorContext(request)
        })
      );

      api.get("/fhir/metadata", async () =>
        buildWiiiCareCapabilityStatement({
          implementationUrl: publicApiBaseUrl
        })
      );

      await registerAuthRoutes(api, {
        auditRepository: auditEventRepository,
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
        providerDirectoryRepository,
        auditEventRepository
      );
      await registerRecordTransferRoutes(
        api,
        patientRepository,
        consentRepository,
        recordTransferRepository,
        recordTransferDeliveryAttemptRepository,
        providerDirectoryRepository,
        auditEventRepository
      );
      await registerEncounterRoutes(
        api,
        patientRepository,
        encounterRepository,
        providerDirectoryRepository,
        auditEventRepository
      );
      await registerAllergyIntoleranceRoutes(
        api,
        patientRepository,
        encounterRepository,
        allergyIntoleranceRepository,
        providerDirectoryRepository,
        auditEventRepository
      );
      await registerConditionRoutes(
        api,
        patientRepository,
        encounterRepository,
        conditionRepository,
        providerDirectoryRepository,
        auditEventRepository
      );
      await registerObservationRoutes(
        api,
        patientRepository,
        encounterRepository,
        observationRepository,
        providerDirectoryRepository,
        auditEventRepository
      );
      await registerMedicationRequestRoutes(
        api,
        patientRepository,
        encounterRepository,
        conditionRepository,
        medicationRequestRepository,
        providerDirectoryRepository,
        auditEventRepository
      );
      await registerMedicationDispenseRoutes(
        api,
        patientRepository,
        encounterRepository,
        medicationRequestRepository,
        medicationDispenseRepository,
        providerDirectoryRepository,
        auditEventRepository
      );
      await registerMedicationAdministrationRoutes(
        api,
        patientRepository,
        encounterRepository,
        conditionRepository,
        medicationRequestRepository,
        medicationAdministrationRepository,
        providerDirectoryRepository,
        auditEventRepository
      );
      await registerServiceRequestRoutes(
        api,
        patientRepository,
        encounterRepository,
        conditionRepository,
        serviceRequestRepository,
        providerDirectoryRepository,
        auditEventRepository
      );
      await registerWorkflowTaskRoutes(
        api,
        patientRepository,
        encounterRepository,
        serviceRequestRepository,
        workflowTaskRepository,
        providerDirectoryRepository,
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
        providerDirectoryRepository,
        auditEventRepository
      );
      await registerDiagnosticReportRoutes(
        api,
        patientRepository,
        encounterRepository,
        serviceRequestRepository,
        observationRepository,
        diagnosticReportRepository,
        providerDirectoryRepository,
        auditEventRepository
      );
      await registerImagingStudyRoutes(
        api,
        patientRepository,
        encounterRepository,
        serviceRequestRepository,
        diagnosticReportRepository,
        imagingStudyRepository,
        providerDirectoryRepository,
        auditEventRepository
      );
      await registerClinicalDocumentRoutes(
        api,
        patientRepository,
        encounterRepository,
        clinicalDocumentRepository,
        providerDirectoryRepository,
        auditEventRepository
      );
      await registerAuditEventRoutes(
        api,
        patientRepository,
        providerDirectoryRepository,
        auditEventRepository
      );
    },
    {
      prefix: "/api/v1"
    }
  );

  return app;
}

function buildApiRuntimeInfo(input: {
  readonly publicApiBaseUrl: string;
  readonly httpBodyLimitBytes: number;
  readonly apiDocsEnabled: boolean;
  readonly recordTransferDeliveryWorkerEnabled: boolean;
  readonly recordTransferRetryWorkerEnabled: boolean;
  readonly actor: ActorContext | undefined;
}) {
  const canReadDiagnostics = canReadRuntimeDiagnostics(input.actor);

  return {
    service: "benh-vien-so-api",
    product: "WiiiCare Nexus",
    version: apiVersion,
    publicApiBaseUrl: input.publicApiBaseUrl,
    checkedAt: new Date().toISOString(),
    operationalDiagnostics: canReadDiagnostics
      ? { available: true }
      : {
          available: false,
          reason: "Cần phiên admin/auditor với PurposeOfUse phù hợp để xem metadata vận hành."
        },
    features: {
      apiDocsEnabled: canReadDiagnostics ? input.apiDocsEnabled : null,
      recordTransferDeliveryAttempts: true,
      recordTransferDeliveryWorkerEnabled: canReadDiagnostics
        ? input.recordTransferDeliveryWorkerEnabled
        : null,
      recordTransferRetryWorkerEnabled: canReadDiagnostics
        ? input.recordTransferRetryWorkerEnabled
        : null
    },
    ...(canReadDiagnostics
      ? {
          repository: process.env.BVS_REPOSITORY ?? "in-memory",
          nodeEnv: process.env.NODE_ENV ?? "development",
          httpBodyLimitBytes: input.httpBodyLimitBytes
        }
      : {})
  };
}

function canReadRuntimeDiagnostics(actor: ActorContext | undefined): boolean {
  if (!actor) {
    return false;
  }

  if (actor.role === "admin") {
    return actor.purposeOfUse === "OPERATIONS" || actor.purposeOfUse === "AUDIT";
  }

  return actor.role === "auditor" && actor.purposeOfUse === "AUDIT";
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
      if (process.env.NODE_ENV === "production") {
        assertProductionCorsOrigins(origins);
      }

      return origins;
    }
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("BVS_CORS_ORIGINS must be set in production.");
  }

  return true;
}

function assertRepositoryConfiguration(): void {
  const repository = process.env.BVS_REPOSITORY ?? "in-memory";

  if (repository !== "postgres" && repository !== "in-memory") {
    throw new Error("BVS_REPOSITORY must be either 'postgres' or 'in-memory'.");
  }

  if (process.env.NODE_ENV === "production" && repository !== "postgres") {
    throw new Error("BVS_REPOSITORY must be 'postgres' in production.");
  }
}

function resolvePublicApiBaseUrl(): string {
  const rawValue = process.env.BVS_PUBLIC_API_BASE_URL?.trim();

  if (!rawValue) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("BVS_PUBLIC_API_BASE_URL must be set in production.");
    }

    return defaultPublicApiBaseUrl;
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(rawValue);
  } catch {
    throw new Error("BVS_PUBLIC_API_BASE_URL must be a valid absolute URL.");
  }

  if (parsedUrl.search || parsedUrl.hash) {
    throw new Error("BVS_PUBLIC_API_BASE_URL must not include query or fragment.");
  }

  if (process.env.NODE_ENV === "production" && parsedUrl.protocol !== "https:") {
    throw new Error("BVS_PUBLIC_API_BASE_URL must use HTTPS in production.");
  }

  if (process.env.NODE_ENV === "production" && isLocalOnlyHostname(parsedUrl.hostname)) {
    throw new Error(
      "BVS_PUBLIC_API_BASE_URL must not use localhost, loopback, private or link-local hosts in production."
    );
  }

  return rawValue.replace(/\/+$/, "");
}

function resolveRecordTransferRetryWorkerConfig(): RecordTransferRetryWorkerConfig | undefined {
  const enabled = process.env.BVS_RECORD_TRANSFER_RETRY_WORKER_ENABLED?.trim();

  if (!enabled || enabled === "false") {
    return undefined;
  }

  if (enabled !== "true") {
    throw new Error(
      "BVS_RECORD_TRANSFER_RETRY_WORKER_ENABLED must be either 'true' or 'false'."
    );
  }

  return {
    intervalMs:
      readPositiveIntegerEnv("BVS_RECORD_TRANSFER_RETRY_WORKER_INTERVAL_SECONDS", 60) *
      1000,
    limit: readPositiveIntegerEnv("BVS_RECORD_TRANSFER_RETRY_WORKER_LIMIT", 25),
    maxRetryCount: readPositiveIntegerEnv(
      "BVS_RECORD_TRANSFER_RETRY_WORKER_MAX_RETRY_COUNT",
      3
    ),
    runImmediately: readBooleanEnv(
      "BVS_RECORD_TRANSFER_RETRY_WORKER_RUN_IMMEDIATELY",
      false
    )
  };
}

function resolveRecordTransferDeliveryWorkerConfig(): RecordTransferDeliveryWorkerConfig | undefined {
  const enabled = process.env.BVS_RECORD_TRANSFER_DELIVERY_WORKER_ENABLED?.trim();

  if (!enabled || enabled === "false") {
    return undefined;
  }

  if (enabled !== "true") {
    throw new Error(
      "BVS_RECORD_TRANSFER_DELIVERY_WORKER_ENABLED must be either 'true' or 'false'."
    );
  }

  return {
    intervalMs:
      readPositiveIntegerEnv("BVS_RECORD_TRANSFER_DELIVERY_WORKER_INTERVAL_SECONDS", 60) *
      1000,
    limit: readPositiveIntegerEnv("BVS_RECORD_TRANSFER_DELIVERY_WORKER_LIMIT", 10),
    timeoutMs:
      readPositiveIntegerEnv("BVS_RECORD_TRANSFER_DELIVERY_WORKER_TIMEOUT_SECONDS", 15) *
      1000,
    retryDelayMs:
      readPositiveIntegerEnv("BVS_RECORD_TRANSFER_DELIVERY_WORKER_RETRY_DELAY_SECONDS", 300) *
      1000,
    runImmediately: readBooleanEnv(
      "BVS_RECORD_TRANSFER_DELIVERY_WORKER_RUN_IMMEDIATELY",
      false
    )
  };
}

function readPositiveIntegerEnv(name: string, defaultValue: number): number {
  const rawValue = process.env[name]?.trim();

  if (!rawValue) {
    return defaultValue;
  }

  const value = Number(rawValue);

  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${name} must be a positive integer.`);
  }

  return value;
}

function readBoundedIntegerEnv(
  name: string,
  defaultValue: number,
  minValue: number,
  maxValue: number
): number {
  const rawValue = process.env[name]?.trim();

  if (!rawValue) {
    return defaultValue;
  }

  const value = Number(rawValue);

  if (!Number.isInteger(value) || value < minValue || value > maxValue) {
    throw new Error(`${name} must be an integer between ${minValue} and ${maxValue}.`);
  }

  return value;
}

function readBooleanEnv(name: string, defaultValue: boolean): boolean {
  const rawValue = process.env[name]?.trim();

  if (!rawValue) {
    return defaultValue;
  }

  if (rawValue === "true") {
    return true;
  }

  if (rawValue === "false") {
    return false;
  }

  throw new Error(`${name} must be either 'true' or 'false'.`);
}

function isLocalOnlyHostname(hostname: string): boolean {
  const normalizedHostname = hostname.trim().toLowerCase();

  if (
    normalizedHostname === "localhost" ||
    normalizedHostname.endsWith(".localhost")
  ) {
    return true;
  }

  const ipAddress = stripIpv6Brackets(normalizedHostname);
  const ipVersion = isIP(ipAddress);

  if (ipVersion === 4) {
    return isLoopbackOrPrivateIpv4(ipAddress);
  }

  if (ipVersion === 6) {
    return isLoopbackOrPrivateIpv6(ipAddress);
  }

  return false;
}

function stripIpv6Brackets(hostname: string): string {
  if (hostname.startsWith("[") && hostname.endsWith("]")) {
    return hostname.slice(1, -1);
  }

  return hostname;
}

function isLoopbackOrPrivateIpv4(ipAddress: string): boolean {
  const octets = ipAddress.split(".").map((octet) => Number.parseInt(octet, 10));

  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet))) {
    return false;
  }

  const [first, second] = octets;

  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168) ||
    (first === 169 && second === 254)
  );
}

function isLoopbackOrPrivateIpv6(ipAddress: string): boolean {
  if (ipAddress === "::" || ipAddress === "::1") {
    return true;
  }

  const ipv4MappedAddress = parseIpv4MappedIpv6Address(ipAddress);

  if (ipv4MappedAddress) {
    return isLoopbackOrPrivateIpv4(ipv4MappedAddress);
  }

  const firstHextet = Number.parseInt(ipAddress.split(":")[0] || "0", 16);

  if (!Number.isInteger(firstHextet)) {
    return false;
  }

  return (
    (firstHextet & 0xfe00) === 0xfc00 ||
    (firstHextet & 0xffc0) === 0xfe80
  );
}

function parseIpv4MappedIpv6Address(ipAddress: string): string | undefined {
  const prefix = "::ffff:";

  if (!ipAddress.startsWith(prefix)) {
    return undefined;
  }

  const parts = ipAddress.slice(prefix.length).split(":");

  if (parts.length !== 2) {
    return undefined;
  }

  const high = Number.parseInt(parts[0], 16);
  const low = Number.parseInt(parts[1], 16);

  if (
    !Number.isInteger(high) ||
    !Number.isInteger(low) ||
    high < 0 ||
    high > 0xffff ||
    low < 0 ||
    low > 0xffff
  ) {
    return undefined;
  }

  return [
    (high >> 8) & 0xff,
    high & 0xff,
    (low >> 8) & 0xff,
    low & 0xff
  ].join(".");
}

function assertProductionCorsOrigins(origins: readonly string[]): void {
  for (const origin of origins) {
    if (origin === "*") {
      throw new Error("BVS_CORS_ORIGINS must not include wildcard '*' in production.");
    }

    let parsedOrigin: URL;

    try {
      parsedOrigin = new URL(origin);
    } catch {
      throw new Error("BVS_CORS_ORIGINS must contain valid URL origins in production.");
    }

    if (parsedOrigin.origin !== origin || parsedOrigin.protocol !== "https:") {
      throw new Error(
        "BVS_CORS_ORIGINS must contain canonical HTTPS origins in production."
      );
    }

    if (isLocalOnlyHostname(parsedOrigin.hostname)) {
      throw new Error(
        "BVS_CORS_ORIGINS must not contain localhost, loopback, private or link-local origins in production."
      );
    }
  }
}

function readHttpStatusCode(error: unknown): number {
  const statusCode = (error as { readonly statusCode?: unknown }).statusCode;

  return typeof statusCode === "number" ? statusCode : 500;
}

function buildValidationOperationOutcome(error: ZodError) {
  return buildFhirOperationOutcome({
    issues: error.issues.map((issue) => {
      const expression = issue.path.map((pathPart) => String(pathPart)).join(".");

      return {
        code: expression ? "invalid" : "structure",
        diagnostics: issue.message,
        ...(expression ? { expression: [expression] } : {}),
        details: {
          system: "urn:wiiicare:nexus:operation-outcome",
          code: "VALIDATION_ERROR",
          display: "Validation error",
          text: "Request validation failed."
        }
      };
    })
  });
}

function acceptsFhirJson(request: FastifyRequest): boolean {
  const accept = request.headers.accept;
  const values: readonly string[] = Array.isArray(accept) ? accept : accept ? [accept] : [];

  return values.some((value) =>
    value
      .split(",")
      .map((part: string) => part.trim().split(";")[0]?.toLowerCase())
      .includes("application/fhir+json")
  );
}

async function recordDeniedAccessAuditEvent(
  auditEventRepository: AuditEventRepository,
  request: FastifyRequest,
  statusCode: number,
  deniedAccess: DeniedAccessPayload
): Promise<void> {
  if (statusCode !== 403) {
    return;
  }

  const resourceType = inferDeniedAuditResourceType(deniedAccess);
  const resourceId =
    deniedAccess.error === "PATIENT_ACCESS_DENIED" && deniedAccess.patientId
      ? deniedAccess.patientId
      : deniedAccess.permission ?? request.id;

  try {
    await recordAuditEvent(auditEventRepository, request, {
      action: "access.denied",
      resourceType,
      resourceId,
      patientId: deniedAccess.patientId,
      metadata: {
        denialCode: deniedAccess.error,
        deniedPermission: deniedAccess.permission,
        deniedActorId: deniedAccess.actor?.id,
        deniedActorRole: deniedAccess.actor?.role,
        deniedActorPurposeOfUse: deniedAccess.actor?.purposeOfUse,
        route: `${request.method} ${request.url}`,
        statusCode
      }
    });
  } catch (error) {
    request.log.error(
      { err: error, requestId: request.id },
      "Failed to record denied access audit event"
    );
  }
}

function rememberDeniedAccessForAudit(
  deniedAccessPayloads: WeakMap<FastifyRequest, DeniedAccessPayload>,
  request: FastifyRequest,
  statusCode: number,
  payload: unknown
): void {
  if (statusCode !== 403) {
    return;
  }

  const payloadText = readPayloadText(payload);
  const deniedAccess = payloadText
    ? parseDeniedAccessPayload(payloadText)
    : undefined;

  if (deniedAccess) {
    deniedAccessPayloads.set(request, deniedAccess);
  }
}

function parseDeniedAccessPayload(payload: string): DeniedAccessPayload | undefined {
  try {
    const parsedPayload = JSON.parse(payload) as unknown;

    if (isDeniedAccessPayload(parsedPayload)) {
      return parsedPayload;
    }

    return parseDeniedAccessOperationOutcome(parsedPayload);
  } catch {
    return undefined;
  }
}

function parseDeniedAccessOperationOutcome(value: unknown): DeniedAccessPayload | undefined {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return undefined;
  }

  if ((value as { readonly resourceType?: unknown }).resourceType !== "OperationOutcome") {
    return undefined;
  }

  const issue = (value as { readonly issue?: unknown }).issue;

  if (!Array.isArray(issue)) {
    return undefined;
  }

  const firstIssue = issue[0] as
    | {
        readonly details?: {
          readonly coding?: readonly { readonly code?: unknown }[];
        };
        readonly diagnostics?: unknown;
      }
    | undefined;
  const code = firstIssue?.details?.coding?.find((coding) =>
    coding.code === "FORBIDDEN" || coding.code === "PATIENT_ACCESS_DENIED"
  )?.code;

  if (code !== "FORBIDDEN" && code !== "PATIENT_ACCESS_DENIED") {
    return undefined;
  }

  const diagnostics = parseOperationOutcomeDiagnostics(firstIssue?.diagnostics);

  return {
    error: code,
    requestId: diagnostics.requestId,
    permission: diagnostics.permission,
    patientId: diagnostics.patientId,
    actor: {
      id: diagnostics.actorId,
      role: diagnostics.actorRole,
      purposeOfUse: diagnostics.purposeOfUse
    }
  };
}

function parseOperationOutcomeDiagnostics(value: unknown): Record<string, string> {
  if (typeof value !== "string") {
    return {};
  }

  return Object.fromEntries(
    value
      .split(";")
      .map((part) => part.trim().split("="))
      .filter(
        (entry): entry is [string, string] =>
          entry.length === 2 && entry[0].length > 0 && entry[1].length > 0
      )
  );
}

function isDeniedAccessPayload(value: unknown): value is DeniedAccessPayload {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const error = (value as { readonly error?: unknown }).error;

  return error === "FORBIDDEN" || error === "PATIENT_ACCESS_DENIED";
}

function inferDeniedAuditResourceType(payload: DeniedAccessPayload): AuditResourceType {
  if (payload.error === "PATIENT_ACCESS_DENIED") {
    return "Patient";
  }

  if (payload.permission) {
    for (const [prefix, resourceType] of Object.entries(auditResourceByPermissionPrefix)) {
      if (payload.permission.startsWith(prefix)) {
        return resourceType;
      }
    }
  }

  return "AuditEvent";
}

function createRequestId(request: {
  readonly headers: Record<string, string | string[] | undefined>;
}): string {
  const requestId = request.headers[requestIdHeaderName];
  const candidate = Array.isArray(requestId) ? requestId[0] : requestId;

  return isSafeRequestId(candidate) ? candidate : randomUUID();
}

function isSafeRequestId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= maxRequestIdLength &&
    requestIdPattern.test(value)
  );
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

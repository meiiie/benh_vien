import cors from "@fastify/cors";
import Fastify from "fastify";
import type { FastifyRequest } from "fastify";
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
import { createAuditEventRepository } from "./modules/audit-events/create-audit-event.repository.js";
import {
  rememberDeniedAccessForAudit,
  recordDeniedAccessAuditEvent,
  type DeniedAccessPayload
} from "./modules/audit-events/denied-access-audit.js";
import { createAllergyIntoleranceRepository } from "./modules/allergy-intolerances/create-allergy-intolerance.repository.js";
import { assertAuthConfiguration } from "./modules/auth/auth-session.js";
import {
  createLoginRateLimiterFromEnv,
  type LoginRateLimiter
} from "./modules/auth/login-rate-limit.js";
import { createClinicalDocumentRepository } from "./modules/clinical-documents/create-clinical-document.repository.js";
import { createConditionRepository } from "./modules/conditions/create-condition.repository.js";
import { createConsentRepository } from "./modules/consents/create-consent.repository.js";
import { createDiagnosticReportRepository } from "./modules/diagnostic-reports/create-diagnostic-report.repository.js";
import { createEncounterRepository } from "./modules/encounters/create-encounter.repository.js";
import { createImagingStudyRepository } from "./modules/imaging-studies/create-imaging-study.repository.js";
import { createMedicationAdministrationRepository } from "./modules/medication-administrations/create-medication-administration.repository.js";
import { createMedicationDispenseRepository } from "./modules/medication-dispenses/create-medication-dispense.repository.js";
import { createMedicationRequestRepository } from "./modules/medication-requests/create-medication-request.repository.js";
import { createObservationRepository } from "./modules/observations/create-observation.repository.js";
import { createPatientRepository } from "./modules/patients/create-patient.repository.js";
import {
  createRequestId,
  registerHttpBoundary
} from "./modules/http/http-boundary.js";
import { registerApiRoutes } from "./modules/http/api-routes.js";
import { registerApiDocs } from "./modules/http/api-docs.js";
import {
  assertRepositoryConfiguration,
  resolveApiDocsEnabled,
  resolveCorsOrigins,
  resolveHttpBodyLimitBytes,
  resolvePublicApiBaseUrl,
  resolveRecordTransferDeliveryWorkerConfig,
  resolveRecordTransferRetryWorkerConfig
} from "./modules/http/runtime-config.js";
import { registerSystemRoutes } from "./modules/http/system-routes.js";
import { startRecordTransferWorkers } from "./modules/http/record-transfer-workers.js";
import { createProcedureRepository } from "./modules/procedures/create-procedure.repository.js";
import { createProviderDirectoryRepository } from "./modules/provider-directory/create-provider-directory.repository.js";
import { createRecordTransferDeliveryAttemptRepository } from "./modules/record-transfer-delivery-attempts/create-record-transfer-delivery-attempt.repository.js";
import { createRecordTransferRepository } from "./modules/record-transfers/create-record-transfer.repository.js";
import { assertRecordTransferCallbackSignatureConfiguration } from "./modules/record-transfers/record-transfer-callback-signature.js";
import { createServiceRequestRepository } from "./modules/service-requests/create-service-request.repository.js";
import { createWorkflowTaskRepository } from "./modules/workflow-tasks/create-workflow-task.repository.js";

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

const apiVersion = "0.2.0";

export async function buildServer(options: ServerOptions = {}) {
  assertAuthConfiguration();
  assertRepositoryConfiguration();
  const publicApiBaseUrl = resolvePublicApiBaseUrl();
  const httpBodyLimitBytes = resolveHttpBodyLimitBytes();
  const apiDocsEnabled = resolveApiDocsEnabled();

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
  registerHttpBoundary(app);

  if (apiDocsEnabled) {
    await registerApiDocs(app, { version: apiVersion });
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
  const recordTransferWorkers = startRecordTransferWorkers(
    {
      retry: {
        recordTransferRepository,
        auditRepository: auditEventRepository
      },
      delivery: {
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
      logger: app.log
    },
    {
      retry: resolveRecordTransferRetryWorkerConfig(),
      delivery: resolveRecordTransferDeliveryWorkerConfig()
    }
  );
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
    recordTransferWorkers.close();

    for (const repository of [...managedRepositories].reverse()) {
      await repository.close();
    }
  });

  registerSystemRoutes(app, {
    patientRepository,
    providerDirectoryRepository,
    loginRateLimiter
  });

  await registerApiRoutes(
    app,
    {
      patientRepository,
      providerDirectoryRepository,
      encounterRepository,
      allergyIntoleranceRepository,
      conditionRepository,
      observationRepository,
      medicationRequestRepository,
      medicationDispenseRepository,
      medicationAdministrationRepository,
      serviceRequestRepository,
      workflowTaskRepository,
      procedureRepository,
      diagnosticReportRepository,
      imagingStudyRepository,
      clinicalDocumentRepository,
      consentRepository,
      recordTransferRepository,
      recordTransferDeliveryAttemptRepository,
      auditEventRepository,
      loginRateLimiter
    },
    {
      apiVersion,
      publicApiBaseUrl,
      httpBodyLimitBytes,
      apiDocsEnabled,
      recordTransferDeliveryWorkerEnabled: recordTransferWorkers.deliveryWorkerEnabled,
      recordTransferRetryWorkerEnabled: recordTransferWorkers.retryWorkerEnabled
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

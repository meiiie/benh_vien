import cors from "@fastify/cors";
import Fastify from "fastify";
import type { FastifyRequest } from "fastify";
import {
  rememberDeniedAccessForAudit,
  recordDeniedAccessAuditEvent,
  type DeniedAccessPayload
} from "./modules/audit-events/denied-access-audit.js";
import { assertAuthConfiguration } from "./modules/auth/auth-session.js";
import {
  createLoginRateLimiterFromEnv,
  type LoginRateLimiter
} from "./modules/auth/login-rate-limit.js";
import {
  createRequestId,
  registerHttpBoundary
} from "./modules/http/http-boundary.js";
import {
  createApiRepositories,
  type ApiRepositoryOptions
} from "./modules/http/api-dependencies.js";
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
import { assertRecordTransferCallbackSignatureConfiguration } from "./modules/record-transfers/record-transfer-callback-signature.js";

export type ServerOptions = ApiRepositoryOptions & {
  readonly loginRateLimiter?: LoginRateLimiter;
  readonly logger?: boolean;
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

  await app.register(cors, {
    origin: resolveCorsOrigins()
  });
  assertRecordTransferCallbackSignatureConfiguration();
  registerHttpBoundary(app);

  if (apiDocsEnabled) {
    await registerApiDocs(app, { version: apiVersion });
  }

  const apiRepositories = await createApiRepositories(options);
  const {
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
    auditEventRepository
  } = apiRepositories.repositories;
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
    await apiRepositories.close();
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

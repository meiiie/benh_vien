import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import Fastify from "fastify";
import type {
  AuditEventRepository,
  ClinicalDocumentRepository,
  EncounterRepository,
  PatientRepository
} from "@benh-vien-so/domain";
import { createAuditEventRepository } from "./modules/audit-events/create-audit-event.repository.js";
import { registerAuditEventRoutes } from "./modules/audit-events/audit-event-routes.js";
import { registerAuthRoutes } from "./modules/auth/auth-routes.js";
import { createClinicalDocumentRepository } from "./modules/clinical-documents/create-clinical-document.repository.js";
import { registerClinicalDocumentRoutes } from "./modules/clinical-documents/clinical-document-routes.js";
import { createEncounterRepository } from "./modules/encounters/create-encounter.repository.js";
import { registerEncounterRoutes } from "./modules/encounters/encounter-routes.js";
import { createPatientRepository } from "./modules/patients/create-patient.repository.js";
import { registerPatientRoutes } from "./modules/patients/patient-routes.js";

export type ServerOptions = {
  readonly patientRepository?: PatientRepository;
  readonly encounterRepository?: EncounterRepository;
  readonly clinicalDocumentRepository?: ClinicalDocumentRepository;
  readonly auditEventRepository?: AuditEventRepository;
  readonly logger?: boolean;
};

export async function buildServer(options: ServerOptions = {}) {
  const app = Fastify({
    logger: options.logger ?? true
  });

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
          name: "auth",
          description: "Đăng nhập demo và xác thực phiên truy cập"
        },
        {
          name: "encounters",
          description: "Quản lý lượt khám, đợt điều trị và FHIR Encounter"
        },
        {
          name: "clinical-documents",
          description: "Quản lý tài liệu lâm sàng và FHIR DocumentReference"
        },
        {
          name: "audit-events",
          description: "Truy vết truy cập, ký và xuất dữ liệu bệnh án"
        },
        {
          name: "patients",
          description: "Quản lý định danh và hồ sơ bệnh nhân"
        }
      ]
    }
  });

  await app.register(swaggerUi, {
    routePrefix: "/docs"
  });

  const patientRepository = options.patientRepository ?? (await createPatientRepository());
  const encounterRepository =
    options.encounterRepository ?? (await createEncounterRepository());
  const clinicalDocumentRepository =
    options.clinicalDocumentRepository ?? (await createClinicalDocumentRepository());
  const auditEventRepository =
    options.auditEventRepository ?? (await createAuditEventRepository());

  app.get("/health", async () => ({
    status: "ok",
    service: "benh-vien-so-api"
  }));

  await app.register(
    async (api) => {
      await registerAuthRoutes(api);
      await registerPatientRoutes(
        api,
        patientRepository,
        encounterRepository,
        clinicalDocumentRepository,
        auditEventRepository
      );
      await registerEncounterRoutes(
        api,
        patientRepository,
        encounterRepository,
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

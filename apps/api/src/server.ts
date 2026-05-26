import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import Fastify from "fastify";
import type {
  ClinicalDocumentRepository,
  PatientRepository
} from "@benh-vien-so/domain";
import { createClinicalDocumentRepository } from "./modules/clinical-documents/create-clinical-document.repository.js";
import { registerClinicalDocumentRoutes } from "./modules/clinical-documents/clinical-document-routes.js";
import { createPatientRepository } from "./modules/patients/create-patient.repository.js";
import { registerPatientRoutes } from "./modules/patients/patient-routes.js";

export type ServerOptions = {
  readonly patientRepository?: PatientRepository;
  readonly clinicalDocumentRepository?: ClinicalDocumentRepository;
};

export async function buildServer(options: ServerOptions = {}) {
  const app = Fastify({
    logger: true
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
      tags: [
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
  const clinicalDocumentRepository =
    options.clinicalDocumentRepository ?? (await createClinicalDocumentRepository());

  app.get("/health", async () => ({
    status: "ok",
    service: "benh-vien-so-api"
  }));

  await app.register(
    async (api) => {
      await registerPatientRoutes(api, patientRepository);
      await registerClinicalDocumentRoutes(
        api,
        patientRepository,
        clinicalDocumentRepository
      );
    },
    {
      prefix: "/api/v1"
    }
  );

  return app;
}

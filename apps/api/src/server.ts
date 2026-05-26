import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import Fastify from "fastify";
import type { PatientRepository } from "@benh-vien-so/domain";
import { createPatientRepository } from "./modules/patients/create-patient.repository.js";
import { registerPatientRoutes } from "./modules/patients/patient-routes.js";

export type ServerOptions = {
  readonly patientRepository?: PatientRepository;
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
        title: "Bệnh viện số API",
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

  app.get("/health", async () => ({
    status: "ok",
    service: "benh-vien-so-api"
  }));

  await app.register(
    async (api) => {
      await registerPatientRoutes(api, patientRepository);
    },
    {
      prefix: "/api/v1"
    }
  );

  return app;
}

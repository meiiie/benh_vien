import type { FastifyInstance } from "fastify";
import { nanoid } from "nanoid";
import {
  CreatePatientRequestSchema,
  PatientIdParamsSchema
} from "@benh-vien-so/contracts";
import {
  DomainError,
  Patient,
  mapPatientToFhir
} from "@benh-vien-so/domain";
import type { PatientRepository, PatientSnapshot } from "@benh-vien-so/domain";

export async function registerPatientRoutes(
  app: FastifyInstance,
  repository: PatientRepository
): Promise<void> {
  app.get("/patients", async () => {
    const patients = await repository.findAll();
    return {
      items: patients.map(toPatientResponse)
    };
  });

  app.post("/patients", async (request, reply) => {
    const parsed = CreatePatientRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: "INVALID_PATIENT_PAYLOAD",
        issues: parsed.error.issues
      });
    }

    try {
      const patient = Patient.register({
        id: `patient-${nanoid(10)}`,
        ...parsed.data
      });

      await repository.save(patient);

      return reply.status(201).send(toPatientResponse(patient));
    } catch (error) {
      if (error instanceof DomainError) {
        return reply.status(422).send({
          error: "PATIENT_DOMAIN_ERROR",
          message: error.message
        });
      }

      throw error;
    }
  });

  app.get("/patients/:id", async (request, reply) => {
    const params = PatientIdParamsSchema.parse(request.params);
    const patient = await repository.findById(params.id);

    if (!patient) {
      return reply.status(404).send({
        error: "PATIENT_NOT_FOUND"
      });
    }

    return toPatientResponse(patient);
  });

  app.get("/patients/:id/fhir", async (request, reply) => {
    const params = PatientIdParamsSchema.parse(request.params);
    const patient = await repository.findById(params.id);

    if (!patient) {
      return reply.status(404).send({
        error: "PATIENT_NOT_FOUND"
      });
    }

    return mapPatientToFhir(patient);
  });
}

function toPatientResponse(patient: Patient): PatientSnapshot {
  return patient.toSnapshot();
}


import type { FastifyInstance } from "fastify";
import { nanoid } from "nanoid";
import {
  CreateMedicationAdministrationRequestSchema,
  PatientMedicationAdministrationsParamsSchema
} from "@benh-vien-so/contracts";
import { MedicationAdministration } from "@benh-vien-so/domain";
import type {
  AuditEventRepository,
  ConditionRepository,
  EncounterRepository,
  MedicationAdministrationRepository,
  MedicationRequestRepository,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import {
  requirePatientRecordAccessByPatientId,
  requirePermission
} from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";
import { sendDomainErrorResponse } from "../http/http-domain-error-response.js";
import { sendValidationErrorResponse } from "../http/http-validation-error-response.js";
import { toMedicationAdministrationResponse } from "./medication-administration-route-helpers.js";
import { validateMedicationAdministrationReferences } from "./medication-administration-reference-validation.js";

export async function registerMedicationAdministrationCreationRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  encounterRepository: EncounterRepository,
  conditionRepository: ConditionRepository,
  medicationRequestRepository: MedicationRequestRepository,
  medicationAdministrationRepository: MedicationAdministrationRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.post("/patients/:patientId/medication-administrations", async (request, reply) => {
    const actor = requirePermission(request, reply, "medication-administration:create");

    if (!actor) {
      return;
    }

    const params = PatientMedicationAdministrationsParamsSchema.parse(request.params);
    if (
      !(await requirePatientRecordAccessByPatientId(
        request,
        reply,
        actor,
        params.patientId,
        patientRepository,
        providerDirectoryRepository
      ))
    ) {
      return;
    }

    const parsed = CreateMedicationAdministrationRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      throw parsed.error;
    }

    const validationError = await validateMedicationAdministrationReferences({
      patientId: params.patientId,
      command: parsed.data,
      encounterRepository,
      medicationRequestRepository,
      conditionRepository
    });

    if (validationError) {
      return sendValidationErrorResponse(reply, validationError);
    }

    try {
      const medicationAdministration = MedicationAdministration.record({
        id: `medication-administration-${nanoid(10)}`,
        patientId: params.patientId,
        performers: [],
        ...parsed.data
      });

      await medicationAdministrationRepository.save(medicationAdministration);
      await recordAuditEvent(auditRepository, request, {
        action: "medication-administration.create",
        resourceType: "MedicationAdministration",
        resourceId: medicationAdministration.id,
        patientId: medicationAdministration.patientId,
        metadata: {
          status: medicationAdministration.toSnapshot().status,
          category: medicationAdministration.toSnapshot().category,
          medicationRequestId: medicationAdministration.toSnapshot().medicationRequestId,
          medicationCode: medicationAdministration.toSnapshot().medicationCode
        }
      });

      return reply
        .status(201)
        .send(toMedicationAdministrationResponse(medicationAdministration));
    } catch (error) {
      if (
        sendDomainErrorResponse(
          reply,
          error,
          "MEDICATION_ADMINISTRATION_DOMAIN_ERROR"
        )
      ) {
        return;
      }

      throw error;
    }
  });
}

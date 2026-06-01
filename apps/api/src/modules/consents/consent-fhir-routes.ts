import type { FastifyInstance } from "fastify";
import { ConsentIdParamsSchema } from "@benh-vien-so/contracts";
import { mapConsentToFhir } from "@benh-vien-so/domain";
import type {
  AuditEventRepository,
  ConsentRepository,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import { requirePermission } from "../access-control/access-context.js";
import { recordAuditEvent } from "../audit-events/audit-context.js";
import { loadConsentForFhirExport } from "./consent-route-helpers.js";

export async function registerConsentFhirRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  consentRepository: ConsentRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.get("/consents/:consentId/fhir", async (request, reply) => {
    const actor = requirePermission(request, reply, "consent:fhir-export");

    if (!actor) {
      return;
    }

    const params = ConsentIdParamsSchema.parse(request.params);
    const consent = await loadConsentForFhirExport(
      request,
      reply,
      actor,
      params.consentId,
      consentRepository,
      patientRepository,
      providerDirectoryRepository
    );

    if (!consent) {
      return;
    }

    await recordAuditEvent(auditRepository, request, {
      action: "consent.fhir-export",
      resourceType: "Consent",
      resourceId: consent.id,
      patientId: consent.patientId,
      metadata: {
        standard: "HL7 FHIR R4",
        resourceType: "Consent",
        status: consent.status
      }
    });

    return mapConsentToFhir(consent);
  });
}

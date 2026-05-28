import type { FastifyInstance } from "fastify";
import { PatientAuditEventsParamsSchema } from "@benh-vien-so/contracts";
import type {
  AuditEvent,
  AuditEventRepository,
  AuditEventSnapshot,
  PatientRepository,
  ProviderDirectoryRepository
} from "@benh-vien-so/domain";
import { mapAuditEventsToFhirBundle } from "@benh-vien-so/domain";
import {
  requirePatientRecordAccessByPatientId,
  requirePermission
} from "../access-control/access-context.js";
import { recordAuditEvent } from "./audit-context.js";

export async function registerAuditEventRoutes(
  app: FastifyInstance,
  patientRepository: PatientRepository,
  providerDirectoryRepository: ProviderDirectoryRepository,
  auditRepository: AuditEventRepository
): Promise<void> {
  app.get("/patients/:patientId/audit-events", async (request, reply) => {
    const actor = requirePermission(request, reply, "audit-event:list");

    if (!actor) {
      return;
    }

    const params = PatientAuditEventsParamsSchema.parse(request.params);
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

    const events = await auditRepository.findByPatientId(params.patientId);

    await recordAuditEvent(auditRepository, request, {
      action: "audit-event.list",
      resourceType: "AuditEvent",
      resourceId: params.patientId,
      patientId: params.patientId,
      metadata: {
        returnedCount: events.length
      }
    });

    return {
      items: events.map(toAuditEventResponse)
    };
  });

  app.get("/patients/:patientId/audit-integrity", async (request, reply) => {
    const actor = requirePermission(request, reply, "audit-event:list");

    if (!actor) {
      return;
    }

    const params = PatientAuditEventsParamsSchema.parse(request.params);
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

    await recordAuditEvent(auditRepository, request, {
      action: "audit-event.integrity-verify",
      resourceType: "AuditEvent",
      resourceId: params.patientId,
      patientId: params.patientId,
      metadata: {
        reason: "patient-audit-chain-verification"
      }
    });

    return auditRepository.verifyPatientIntegrity(params.patientId);
  });

  app.get("/patients/:patientId/audit-events/fhir-bundle", async (request, reply) => {
    const actor = requirePermission(request, reply, "audit-event:fhir-export");

    if (!actor) {
      return;
    }

    const params = PatientAuditEventsParamsSchema.parse(request.params);
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

    await recordAuditEvent(auditRepository, request, {
      action: "audit-event.fhir-export",
      resourceType: "AuditEvent",
      resourceId: params.patientId,
      patientId: params.patientId,
      metadata: {
        standard: "HL7 FHIR R4",
        resourceType: "AuditEvent",
        format: "Bundle.collection"
      }
    });

    const events = await auditRepository.findByPatientId(params.patientId);
    return mapAuditEventsToFhirBundle(params.patientId, events);
  });
}

function toAuditEventResponse(event: AuditEvent): AuditEventSnapshot {
  return event.toSnapshot();
}

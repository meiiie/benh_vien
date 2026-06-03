import { Procedure } from "./procedure.js";
import type { CreateProcedureInput, ProcedureSnapshot } from "./procedure.types.js";

type CreateProcedureOverrides = Partial<CreateProcedureInput>;

export function createPerformedDiagnosticProcedureInput(
  overrides: CreateProcedureOverrides = {}
): CreateProcedureInput {
  return {
    id: "procedure-test-fixture",
    patientId: "patient-test-001",
    encounterId: "encounter-test-001",
    basedOnServiceRequestId: "service-request-test-001",
    status: "completed",
    category: "diagnostic",
    code: {
      system: "http://snomed.info/sct",
      code: "168537006",
      display: "Chest X-ray"
    },
    performedPeriod: {
      start: "2026-05-27T04:30:00.000Z",
      end: "2026-05-27T05:00:00.000Z"
    },
    performers: [
      {
        actorType: "Practitioner",
        actorId: "practitioner-test-001",
        onBehalfOfOrganizationId: "department-imaging"
      }
    ],
    reportReferences: [
      {
        resourceType: "DiagnosticReport",
        id: "diagnostic-report-test-001"
      }
    ],
    ...overrides
  };
}

export function createPerformedDiagnosticProcedureSnapshot(
  overrides: CreateProcedureOverrides = {}
): ProcedureSnapshot {
  return Procedure.record(createPerformedDiagnosticProcedureInput(overrides)).toSnapshot();
}

import { ServiceRequest } from "./service-request.js";
import type {
  CreateServiceRequestInput,
  ServiceRequestSnapshot
} from "./service-request.types.js";

type CreateServiceRequestOverrides = Partial<CreateServiceRequestInput>;

export function createLaboratoryServiceRequestInput(
  overrides: CreateServiceRequestOverrides = {}
): CreateServiceRequestInput {
  return {
    id: "service-request-test-fixture",
    patientId: "patient-001",
    encounterId: "encounter-001",
    reasonConditionId: "condition-001",
    category: "laboratory",
    priority: "urgent",
    code: {
      system: "http://loinc.org",
      code: "58410-2",
      display: "Complete blood count panel"
    },
    occurrenceAt: "2026-05-28T02:00:00.000Z",
    authoredOn: "2026-05-28T01:30:00.000Z",
    requesterPractitionerId: "practitioner-001",
    performerOrganizationId: "department-laboratory",
    patientInstruction: "Nhịn ăn theo hướng dẫn của khoa xét nghiệm.",
    note: "Ưu tiên trước khi hội chẩn.",
    ...overrides
  };
}

export function createLaboratoryServiceRequestSnapshot(
  overrides: CreateServiceRequestOverrides = {}
): ServiceRequestSnapshot {
  return ServiceRequest.order(createLaboratoryServiceRequestInput(overrides)).toSnapshot();
}

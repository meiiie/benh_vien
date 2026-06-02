import type {
  WorkflowTaskBusinessStatus,
  WorkflowTaskCode,
  WorkflowTaskReference
} from "../workflow-task/workflow-task.types.js";
import type { FhirTask } from "./fhir-types.js";

const workflowTaskBusinessStatusSystem =
  "urn:wiiicare:nexus:task-business-status";

export const workflowTaskFhirProfile =
  "http://hl7.org/fhir/StructureDefinition/Task";
export const workflowTaskIdentifierSystem = "urn:wiiicare:nexus:workflow-task";

export function buildWorkflowTaskIdentifier(
  taskId: string
): NonNullable<FhirTask["identifier"]>[number] {
  return {
    system: workflowTaskIdentifierSystem,
    value: taskId
  };
}

export function buildWorkflowTaskBusinessStatus(
  businessStatus: WorkflowTaskBusinessStatus
): NonNullable<FhirTask["businessStatus"]> {
  return {
    coding: [
      {
        system: workflowTaskBusinessStatusSystem,
        code: businessStatus.code,
        display: businessStatus.display
      }
    ],
    text: businessStatus.display
  };
}

export function buildWorkflowTaskCode(
  code: WorkflowTaskCode
): NonNullable<FhirTask["code"]> {
  return {
    coding: [
      {
        system: code.system,
        code: code.code,
        display: code.display
      }
    ],
    text: code.display
  };
}

export function mapWorkflowTaskOwner(
  ownerOrganizationId: string | undefined,
  ownerPractitionerId: string | undefined
): FhirTask["owner"] {
  if (ownerPractitionerId) {
    return {
      reference: `Practitioner/${ownerPractitionerId}`
    };
  }

  if (ownerOrganizationId) {
    return {
      reference: `Organization/${ownerOrganizationId}`
    };
  }

  return undefined;
}

export function toWorkflowTaskInput(
  reference: WorkflowTaskReference
): NonNullable<FhirTask["input"]>[number] {
  return {
    type: {
      text: reference.label ?? `${reference.resourceType} input`
    },
    valueReference: toWorkflowTaskReference(reference)
  };
}

export function toWorkflowTaskOutput(
  reference: WorkflowTaskReference
): NonNullable<FhirTask["output"]>[number] {
  return {
    type: {
      text: reference.label ?? `${reference.resourceType} output`
    },
    valueReference: toWorkflowTaskReference(reference)
  };
}

export function toWorkflowTaskReference(reference: WorkflowTaskReference): {
  readonly reference: string;
  readonly display?: string;
} {
  return {
    reference: `${reference.resourceType}/${reference.id}`,
    display: reference.label
  };
}

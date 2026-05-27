import type { WorkflowTask, WorkflowTaskReference } from "../workflow-task/workflow-task.js";
import type { FhirTask } from "./fhir-types.js";

const taskBusinessStatusSystem = "urn:wiiicare:nexus:task-business-status";

export function mapWorkflowTaskToFhir(task: WorkflowTask): FhirTask {
  const snapshot = task.toSnapshot();

  return {
    resourceType: "Task",
    id: snapshot.id,
    meta: {
      profile: ["http://hl7.org/fhir/StructureDefinition/Task"]
    },
    identifier: [
      {
        system: "urn:wiiicare:nexus:workflow-task",
        value: snapshot.id
      }
    ],
    basedOn: snapshot.basedOnServiceRequestId
      ? [
          {
            reference: `ServiceRequest/${snapshot.basedOnServiceRequestId}`
          }
        ]
      : undefined,
    status: snapshot.status,
    businessStatus: snapshot.businessStatus
      ? {
          coding: [
            {
              system: taskBusinessStatusSystem,
              code: snapshot.businessStatus.code,
              display: snapshot.businessStatus.display
            }
          ],
          text: snapshot.businessStatus.display
        }
      : undefined,
    intent: snapshot.intent,
    priority: snapshot.priority,
    code: {
      coding: [
        {
          system: snapshot.code.system,
          code: snapshot.code.code,
          display: snapshot.code.display
        }
      ],
      text: snapshot.code.display
    },
    description: snapshot.description,
    focus: snapshot.basedOnServiceRequestId
      ? {
          reference: `ServiceRequest/${snapshot.basedOnServiceRequestId}`
        }
      : undefined,
    for: {
      reference: `Patient/${snapshot.patientId}`
    },
    encounter: snapshot.encounterId
      ? {
          reference: `Encounter/${snapshot.encounterId}`
        }
      : undefined,
    executionPeriod: snapshot.executionPeriod,
    authoredOn: snapshot.authoredOn,
    lastModified: snapshot.lastModified,
    requester: snapshot.requesterPractitionerId
      ? {
          reference: `Practitioner/${snapshot.requesterPractitionerId}`
        }
      : undefined,
    owner: mapOwner(snapshot.ownerOrganizationId, snapshot.ownerPractitionerId),
    input: snapshot.inputReferences.map((reference) => ({
      type: {
        text: reference.label ?? `${reference.resourceType} input`
      },
      valueReference: toFhirReference(reference)
    })),
    output: snapshot.outputReferences.map((reference) => ({
      type: {
        text: reference.label ?? `${reference.resourceType} output`
      },
      valueReference: toFhirReference(reference)
    })),
    note: snapshot.note ? [{ text: snapshot.note }] : undefined
  };
}

function mapOwner(
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

function toFhirReference(reference: WorkflowTaskReference): {
  readonly reference: string;
  readonly display?: string;
} {
  return {
    reference: `${reference.resourceType}/${reference.id}`,
    display: reference.label
  };
}

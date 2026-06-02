import type { WorkflowTask } from "../workflow-task/workflow-task.js";
import type { FhirTask } from "./fhir-types.js";
import {
  buildWorkflowTaskBusinessStatus,
  buildWorkflowTaskCode,
  buildWorkflowTaskIdentifier,
  mapWorkflowTaskOwner,
  toWorkflowTaskInput,
  toWorkflowTaskOutput,
  workflowTaskFhirProfile
} from "./map-workflow-task-codings.js";

export function mapWorkflowTaskToFhir(task: WorkflowTask): FhirTask {
  const snapshot = task.toSnapshot();

  return {
    resourceType: "Task",
    id: snapshot.id,
    meta: {
      profile: [workflowTaskFhirProfile]
    },
    identifier: [buildWorkflowTaskIdentifier(snapshot.id)],
    basedOn: snapshot.basedOnServiceRequestId
      ? [
          {
            reference: `ServiceRequest/${snapshot.basedOnServiceRequestId}`
          }
        ]
      : undefined,
    status: snapshot.status,
    businessStatus: snapshot.businessStatus
      ? buildWorkflowTaskBusinessStatus(snapshot.businessStatus)
      : undefined,
    intent: snapshot.intent,
    priority: snapshot.priority,
    code: buildWorkflowTaskCode(snapshot.code),
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
    owner: mapWorkflowTaskOwner(
      snapshot.ownerOrganizationId,
      snapshot.ownerPractitionerId
    ),
    input: snapshot.inputReferences.map(toWorkflowTaskInput),
    output: snapshot.outputReferences.map(toWorkflowTaskOutput),
    note: snapshot.note ? [{ text: snapshot.note }] : undefined
  };
}

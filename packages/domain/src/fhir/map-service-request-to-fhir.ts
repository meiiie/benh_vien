import type { ServiceRequest } from "../service-request/service-request.js";
import type { FhirServiceRequest } from "./fhir-types.js";
import {
  buildServiceRequestCategory,
  serviceRequestFhirProfile,
  toServiceRequestCodeableConcept
} from "./map-service-request-codings.js";

export function mapServiceRequestToFhir(serviceRequest: ServiceRequest): FhirServiceRequest {
  const snapshot = serviceRequest.toSnapshot();

  return {
    resourceType: "ServiceRequest",
    id: snapshot.id,
    meta: {
      profile: [serviceRequestFhirProfile]
    },
    status: snapshot.status,
    intent: snapshot.intent,
    category: [buildServiceRequestCategory(snapshot.category)],
    priority: snapshot.priority,
    code: toServiceRequestCodeableConcept(snapshot.code),
    subject: {
      reference: `Patient/${snapshot.patientId}`
    },
    encounter: snapshot.encounterId
      ? {
          reference: `Encounter/${snapshot.encounterId}`
        }
      : undefined,
    occurrenceDateTime: snapshot.occurrenceAt,
    authoredOn: snapshot.authoredOn,
    requester: {
      reference: `Practitioner/${snapshot.requesterPractitionerId}`
    },
    performer: snapshot.performerOrganizationId
      ? [
          {
            reference: `Organization/${snapshot.performerOrganizationId}`
          }
        ]
      : undefined,
    reasonReference: snapshot.reasonConditionId
      ? [
          {
            reference: `Condition/${snapshot.reasonConditionId}`
          }
        ]
      : undefined,
    patientInstruction: snapshot.patientInstruction,
    note: snapshot.note ? [{ text: snapshot.note }] : undefined
  };
}

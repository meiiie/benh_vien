import type { ServiceRequest, ServiceRequestCategory } from "../service-request/service-request.js";
import type { FhirServiceRequest } from "./fhir-types.js";

const categoryCodings: Record<ServiceRequestCategory, { code: string; display: string }> = {
  consultation: {
    code: "409063005",
    display: "Counselling"
  },
  imaging: {
    code: "363679005",
    display: "Imaging"
  },
  laboratory: {
    code: "108252007",
    display: "Laboratory procedure"
  },
  procedure: {
    code: "387713003",
    display: "Surgical procedure"
  },
  therapy: {
    code: "277132007",
    display: "Therapeutic procedure"
  }
};

export function mapServiceRequestToFhir(serviceRequest: ServiceRequest): FhirServiceRequest {
  const snapshot = serviceRequest.toSnapshot();
  const categoryCoding = categoryCodings[snapshot.category];

  return {
    resourceType: "ServiceRequest",
    id: snapshot.id,
    meta: {
      profile: ["http://hl7.org/fhir/StructureDefinition/ServiceRequest"]
    },
    status: snapshot.status,
    intent: snapshot.intent,
    category: [
      {
        coding: [
          {
            system: "http://snomed.info/sct",
            code: categoryCoding.code,
            display: categoryCoding.display
          }
        ],
        text: categoryCoding.display
      }
    ],
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

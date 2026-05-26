import type { Encounter, EncounterClass, EncounterStatus } from "../encounter/encounter.js";
import type { FhirEncounter } from "./fhir-types.js";

const encounterClassCodes: Record<EncounterClass, string> = {
  ambulatory: "AMB",
  inpatient: "IMP",
  emergency: "EMER",
  virtual: "VR"
};

export function mapEncounterToFhir(encounter: Encounter): FhirEncounter {
  const snapshot = encounter.toSnapshot();

  return {
    resourceType: "Encounter",
    id: snapshot.id,
    meta: {
      profile: ["http://hl7.org/fhir/StructureDefinition/Encounter"]
    },
    status: mapEncounterStatus(snapshot.status),
    class: {
      system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
      code: encounterClassCodes[snapshot.class],
      display: snapshot.class
    },
    type: [
      {
        text: snapshot.serviceType
      }
    ],
    subject: {
      reference: `Patient/${snapshot.patientId}`
    },
    participant: [
      {
        individual: {
          reference: `Practitioner/${snapshot.attendingPractitionerId}`
        }
      }
    ],
    period: {
      start: snapshot.startedAt,
      end: snapshot.endedAt
    },
    reasonCode: [
      {
        text: snapshot.reasonText
      }
    ],
    serviceProvider: snapshot.departmentId
      ? {
          reference: `Organization/${snapshot.departmentId}`
        }
      : undefined
  };
}

function mapEncounterStatus(status: EncounterStatus): FhirEncounter["status"] {
  if (status === "in-progress") {
    return "in-progress";
  }

  if (status === "entered-in-error") {
    return "entered-in-error";
  }

  return status;
}

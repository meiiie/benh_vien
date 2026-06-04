import type { Observation } from "../observation/observation.js";
import type { FhirObservation } from "./fhir-types.js";
import {
  observationFhirProfile,
  toObservationCategory,
  toObservationCodeableConcept
} from "./map-observation-codings.js";

export function mapObservationToFhir(observation: Observation): FhirObservation {
  const snapshot = observation.toSnapshot();

  return {
    resourceType: "Observation",
    id: snapshot.id,
    meta: {
      profile: [observationFhirProfile]
    },
    status: snapshot.status,
    category: [toObservationCategory(snapshot.category)],
    code: toObservationCodeableConcept(snapshot.code),
    subject: {
      reference: `Patient/${snapshot.patientId}`
    },
    encounter: snapshot.encounterId
      ? {
          reference: `Encounter/${snapshot.encounterId}`
        }
      : undefined,
    effectiveDateTime: snapshot.effectiveAt,
    valueQuantity: snapshot.valueQuantity,
    valueString: snapshot.valueText,
    performer: snapshot.performerPractitionerId
      ? [
          {
            reference: `Practitioner/${snapshot.performerPractitionerId}`
          }
        ]
      : undefined
  };
}

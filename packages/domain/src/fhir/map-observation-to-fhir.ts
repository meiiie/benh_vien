import type {
  Observation,
  ObservationCategory
} from "../observation/observation.js";
import type { FhirObservation } from "./fhir-types.js";

const categoryLabels: Record<ObservationCategory, string> = {
  laboratory: "Laboratory",
  "vital-signs": "Vital Signs"
};

const categoryCodes: Record<ObservationCategory, string> = {
  laboratory: "laboratory",
  "vital-signs": "vital-signs"
};

export function mapObservationToFhir(observation: Observation): FhirObservation {
  const snapshot = observation.toSnapshot();

  return {
    resourceType: "Observation",
    id: snapshot.id,
    meta: {
      profile: ["http://hl7.org/fhir/StructureDefinition/Observation"]
    },
    status: snapshot.status,
    category: [
      {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/observation-category",
            code: categoryCodes[snapshot.category],
            display: categoryLabels[snapshot.category]
          }
        ],
        text: categoryLabels[snapshot.category]
      }
    ],
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

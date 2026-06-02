import type { MedicationRequest } from "../medication-request/medication-request.js";
import type { FhirMedicationRequest } from "./fhir-types.js";
import {
  buildMedicationRequestCategory,
  buildMedicationRequestDispenseRequest,
  medicationRequestFhirProfile,
  toMedicationRequestCodeableConcept,
  toMedicationRequestDosageInstruction
} from "./map-medication-request-codings.js";

export function mapMedicationRequestToFhir(
  medicationRequest: MedicationRequest
): FhirMedicationRequest {
  const snapshot = medicationRequest.toSnapshot();

  return {
    resourceType: "MedicationRequest",
    id: snapshot.id,
    meta: {
      profile: [medicationRequestFhirProfile]
    },
    status: snapshot.status,
    intent: snapshot.intent,
    category: [buildMedicationRequestCategory(snapshot.category)],
    priority: snapshot.priority,
    medicationCodeableConcept: toMedicationRequestCodeableConcept(
      snapshot.medicationCode
    ),
    subject: {
      reference: `Patient/${snapshot.patientId}`
    },
    encounter: snapshot.encounterId
      ? {
          reference: `Encounter/${snapshot.encounterId}`
        }
      : undefined,
    authoredOn: snapshot.authoredOn,
    requester: {
      reference: `Practitioner/${snapshot.requesterPractitionerId}`
    },
    reasonReference: snapshot.reasonConditionId
      ? [
          {
            reference: `Condition/${snapshot.reasonConditionId}`
          }
        ]
      : undefined,
    dosageInstruction: [
      toMedicationRequestDosageInstruction(snapshot.dosageInstruction)
    ],
    dispenseRequest: snapshot.expectedSupplyDurationDays
      ? buildMedicationRequestDispenseRequest(snapshot.expectedSupplyDurationDays)
      : undefined,
    note: snapshot.note ? [{ text: snapshot.note }] : undefined
  };
}

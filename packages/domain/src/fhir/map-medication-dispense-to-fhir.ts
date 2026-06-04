import type { MedicationDispense } from "../medication-dispense/medication-dispense.js";
import type { FhirMedicationDispense } from "./fhir-types.js";
import {
  buildMedicationDispenseCategory,
  buildMedicationDispenseIdentifier,
  medicationDispenseFhirProfile,
  toMedicationDispenseCodeableConcept,
  toMedicationDispenseDosageInstruction
} from "./map-medication-dispense-codings.js";

export function mapMedicationDispenseToFhir(
  medicationDispense: MedicationDispense
): FhirMedicationDispense {
  const snapshot = medicationDispense.toSnapshot();

  return {
    resourceType: "MedicationDispense",
    id: snapshot.id,
    meta: {
      profile: [medicationDispenseFhirProfile]
    },
    identifier: [buildMedicationDispenseIdentifier(snapshot.id)],
    status: snapshot.status,
    statusReasonCodeableConcept: snapshot.statusReason
      ? toMedicationDispenseCodeableConcept(snapshot.statusReason)
      : undefined,
    category: buildMedicationDispenseCategory(snapshot.category),
    medicationCodeableConcept: toMedicationDispenseCodeableConcept(
      snapshot.medicationCode
    ),
    subject: {
      reference: `Patient/${snapshot.patientId}`
    },
    context: snapshot.encounterId
      ? {
          reference: `Encounter/${snapshot.encounterId}`
        }
      : undefined,
    authorizingPrescription: snapshot.medicationRequestId
      ? [
          {
            reference: `MedicationRequest/${snapshot.medicationRequestId}`
          }
        ]
      : undefined,
    performer: snapshot.dispenserPractitionerId
      ? [
          {
            actor: {
              reference: `Practitioner/${snapshot.dispenserPractitionerId}`
            }
          }
        ]
      : undefined,
    quantity: snapshot.quantity,
    daysSupply: snapshot.daysSupply,
    whenPrepared: snapshot.whenPrepared,
    whenHandedOver: snapshot.whenHandedOver,
    destination: snapshot.destinationLocationId
      ? {
          reference: `Location/${snapshot.destinationLocationId}`
        }
      : undefined,
    receiver: snapshot.receiverPractitionerId
      ? [
          {
            reference: `Practitioner/${snapshot.receiverPractitionerId}`
          }
        ]
      : undefined,
    dosageInstruction: snapshot.dosageInstruction
      ? [toMedicationDispenseDosageInstruction(snapshot.dosageInstruction)]
      : undefined,
    note: snapshot.note ? [{ text: snapshot.note }] : undefined
  };
}

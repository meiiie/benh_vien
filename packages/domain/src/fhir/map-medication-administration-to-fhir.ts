import type { MedicationAdministration } from "../medication-administration/medication-administration.js";
import type { FhirMedicationAdministration } from "./fhir-types.js";
import {
  buildMedicationAdministrationCategory,
  buildMedicationAdministrationIdentifier,
  medicationAdministrationFhirProfile,
  toFhirMedicationAdministrationPerformer,
  toMedicationAdministrationCodeableConcept,
  toMedicationAdministrationDosage
} from "./map-medication-administration-codings.js";

export function mapMedicationAdministrationToFhir(
  medicationAdministration: MedicationAdministration
): FhirMedicationAdministration {
  const snapshot = medicationAdministration.toSnapshot();

  return {
    resourceType: "MedicationAdministration",
    id: snapshot.id,
    meta: {
      profile: [medicationAdministrationFhirProfile]
    },
    identifier: [buildMedicationAdministrationIdentifier(snapshot.id)],
    status: snapshot.status,
    statusReason: snapshot.statusReason
      ? [toMedicationAdministrationCodeableConcept(snapshot.statusReason)]
      : undefined,
    category: buildMedicationAdministrationCategory(snapshot.category),
    medicationCodeableConcept: toMedicationAdministrationCodeableConcept(
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
    effectivePeriod: snapshot.effectivePeriod,
    performer:
      snapshot.performers.length > 0
        ? snapshot.performers.map(toFhirMedicationAdministrationPerformer)
        : undefined,
    reasonReference: snapshot.reasonConditionId
      ? [
          {
            reference: `Condition/${snapshot.reasonConditionId}`
          }
        ]
      : undefined,
    request: snapshot.medicationRequestId
      ? {
          reference: `MedicationRequest/${snapshot.medicationRequestId}`
        }
      : undefined,
    dosage: snapshot.dosage
      ? toMedicationAdministrationDosage(snapshot.dosage)
      : undefined,
    note: snapshot.note ? [{ text: snapshot.note }] : undefined
  };
}

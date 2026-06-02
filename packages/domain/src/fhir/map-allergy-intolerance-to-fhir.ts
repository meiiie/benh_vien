import type { AllergyIntolerance } from "../allergy-intolerance/allergy-intolerance.js";
import type { FhirAllergyIntolerance } from "./fhir-types.js";
import {
  allergyIntoleranceFhirProfile,
  toAllergyClinicalStatus,
  toAllergyCodeableConcept,
  toAllergyReaction,
  toAllergyVerificationStatus
} from "./map-allergy-intolerance-codings.js";

export function mapAllergyIntoleranceToFhir(
  allergyIntolerance: AllergyIntolerance
): FhirAllergyIntolerance {
  const snapshot = allergyIntolerance.toSnapshot();

  return {
    resourceType: "AllergyIntolerance",
    id: snapshot.id,
    meta: {
      profile: [allergyIntoleranceFhirProfile]
    },
    clinicalStatus:
      snapshot.verificationStatus === "entered-in-error"
        ? undefined
        : toAllergyClinicalStatus(snapshot.clinicalStatus),
    verificationStatus: toAllergyVerificationStatus(snapshot.verificationStatus),
    type: snapshot.type,
    category: [snapshot.category],
    criticality: snapshot.criticality,
    code: toAllergyCodeableConcept(snapshot.code),
    patient: {
      reference: `Patient/${snapshot.patientId}`
    },
    encounter: snapshot.encounterId
      ? {
          reference: `Encounter/${snapshot.encounterId}`
        }
      : undefined,
    recordedDate: snapshot.recordedAt,
    recorder: {
      reference: `Practitioner/${snapshot.recorderPractitionerId}`
    },
    reaction: snapshot.reaction ? [toAllergyReaction(snapshot.reaction)] : undefined,
    note: snapshot.note ? [{ text: snapshot.note }] : undefined
  };
}

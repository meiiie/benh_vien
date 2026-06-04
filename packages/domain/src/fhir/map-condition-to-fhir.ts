import type { Condition } from "../condition/condition.js";
import type { FhirCondition } from "./fhir-types.js";
import {
  conditionFhirProfile,
  toConditionCategory,
  toConditionClinicalStatus,
  toConditionCodeableConcept,
  toConditionSeverity,
  toConditionVerificationStatus
} from "./map-condition-codings.js";

export function mapConditionToFhir(condition: Condition): FhirCondition {
  const snapshot = condition.toSnapshot();

  return {
    resourceType: "Condition",
    id: snapshot.id,
    meta: {
      profile: [conditionFhirProfile]
    },
    clinicalStatus:
      snapshot.verificationStatus === "entered-in-error"
        ? undefined
        : toConditionClinicalStatus(snapshot.clinicalStatus),
    verificationStatus: toConditionVerificationStatus(snapshot.verificationStatus),
    category: [toConditionCategory(snapshot.category)],
    severity: snapshot.severity ? toConditionSeverity(snapshot.severity) : undefined,
    code: toConditionCodeableConcept(snapshot.code),
    subject: {
      reference: `Patient/${snapshot.patientId}`
    },
    encounter: snapshot.encounterId
      ? {
          reference: `Encounter/${snapshot.encounterId}`
        }
      : undefined,
    onsetDateTime: snapshot.onsetAt,
    recordedDate: snapshot.recordedAt,
    recorder: {
      reference: `Practitioner/${snapshot.recorderPractitionerId}`
    },
    note: snapshot.note ? [{ text: snapshot.note }] : undefined
  };
}

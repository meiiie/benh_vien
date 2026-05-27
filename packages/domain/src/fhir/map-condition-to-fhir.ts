import type {
  Condition,
  ConditionCategory,
  ConditionClinicalStatus,
  ConditionSeverity,
  ConditionVerificationStatus
} from "../condition/condition.js";
import type { FhirCondition } from "./fhir-types.js";

const categoryLabels: Record<ConditionCategory, string> = {
  "encounter-diagnosis": "Encounter Diagnosis",
  "problem-list-item": "Problem List Item"
};

const clinicalStatusLabels: Record<ConditionClinicalStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  recurrence: "Recurrence",
  relapse: "Relapse",
  remission: "Remission",
  resolved: "Resolved"
};

const verificationStatusLabels: Record<ConditionVerificationStatus, string> = {
  confirmed: "Confirmed",
  differential: "Differential",
  "entered-in-error": "Entered in Error",
  provisional: "Provisional",
  refuted: "Refuted",
  unconfirmed: "Unconfirmed"
};

const severityLabels: Record<ConditionSeverity, string> = {
  mild: "Mild",
  moderate: "Moderate",
  severe: "Severe"
};

export function mapConditionToFhir(condition: Condition): FhirCondition {
  const snapshot = condition.toSnapshot();

  return {
    resourceType: "Condition",
    id: snapshot.id,
    meta: {
      profile: ["http://hl7.org/fhir/StructureDefinition/Condition"]
    },
    clinicalStatus: {
      coding: [
        {
          system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
          code: snapshot.clinicalStatus,
          display: clinicalStatusLabels[snapshot.clinicalStatus]
        }
      ],
      text: clinicalStatusLabels[snapshot.clinicalStatus]
    },
    verificationStatus: {
      coding: [
        {
          system: "http://terminology.hl7.org/CodeSystem/condition-ver-status",
          code: snapshot.verificationStatus,
          display: verificationStatusLabels[snapshot.verificationStatus]
        }
      ],
      text: verificationStatusLabels[snapshot.verificationStatus]
    },
    category: [
      {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/condition-category",
            code: snapshot.category,
            display: categoryLabels[snapshot.category]
          }
        ],
        text: categoryLabels[snapshot.category]
      }
    ],
    severity: snapshot.severity
      ? {
          text: severityLabels[snapshot.severity]
        }
      : undefined,
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
    onsetDateTime: snapshot.onsetAt,
    recordedDate: snapshot.recordedAt,
    recorder: {
      reference: `Practitioner/${snapshot.recorderPractitionerId}`
    },
    note: snapshot.note ? [{ text: snapshot.note }] : undefined
  };
}

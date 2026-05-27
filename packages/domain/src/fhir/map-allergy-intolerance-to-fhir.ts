import type {
  AllergyClinicalStatus,
  AllergyIntolerance,
  AllergyVerificationStatus
} from "../allergy-intolerance/allergy-intolerance.js";
import type { FhirAllergyIntolerance } from "./fhir-types.js";

const clinicalStatusLabels: Record<AllergyClinicalStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  resolved: "Resolved"
};

const verificationStatusLabels: Record<AllergyVerificationStatus, string> = {
  confirmed: "Confirmed",
  "entered-in-error": "Entered in Error",
  refuted: "Refuted",
  unconfirmed: "Unconfirmed"
};

export function mapAllergyIntoleranceToFhir(
  allergyIntolerance: AllergyIntolerance
): FhirAllergyIntolerance {
  const snapshot = allergyIntolerance.toSnapshot();

  return {
    resourceType: "AllergyIntolerance",
    id: snapshot.id,
    meta: {
      profile: ["http://hl7.org/fhir/StructureDefinition/AllergyIntolerance"]
    },
    clinicalStatus:
      snapshot.verificationStatus === "entered-in-error"
        ? undefined
        : {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical",
                code: snapshot.clinicalStatus,
                display: clinicalStatusLabels[snapshot.clinicalStatus]
              }
            ],
            text: clinicalStatusLabels[snapshot.clinicalStatus]
          },
    verificationStatus: {
      coding: [
        {
          system: "http://terminology.hl7.org/CodeSystem/allergyintolerance-verification",
          code: snapshot.verificationStatus,
          display: verificationStatusLabels[snapshot.verificationStatus]
        }
      ],
      text: verificationStatusLabels[snapshot.verificationStatus]
    },
    type: snapshot.type,
    category: [snapshot.category],
    criticality: snapshot.criticality,
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
    reaction: snapshot.reaction
      ? [
          {
            manifestation: [
              {
                coding: [
                  {
                    system: snapshot.reaction.manifestation.system,
                    code: snapshot.reaction.manifestation.code,
                    display: snapshot.reaction.manifestation.display
                  }
                ],
                text: snapshot.reaction.manifestation.display
              }
            ],
            severity: snapshot.reaction.severity,
            description: snapshot.reaction.description
          }
        ]
      : undefined,
    note: snapshot.note ? [{ text: snapshot.note }] : undefined
  };
}

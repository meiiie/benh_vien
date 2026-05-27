import type {
  MedicationRequest,
  MedicationRequestCategory
} from "../medication-request/medication-request.js";
import type { FhirMedicationRequest } from "./fhir-types.js";

const categoryLabels: Record<MedicationRequestCategory, string> = {
  community: "Community",
  discharge: "Discharge",
  inpatient: "Inpatient",
  outpatient: "Outpatient"
};

export function mapMedicationRequestToFhir(
  medicationRequest: MedicationRequest
): FhirMedicationRequest {
  const snapshot = medicationRequest.toSnapshot();

  return {
    resourceType: "MedicationRequest",
    id: snapshot.id,
    meta: {
      profile: ["http://hl7.org/fhir/StructureDefinition/MedicationRequest"]
    },
    status: snapshot.status,
    intent: snapshot.intent,
    category: [
      {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/medicationrequest-category",
            code: snapshot.category,
            display: categoryLabels[snapshot.category]
          }
        ],
        text: categoryLabels[snapshot.category]
      }
    ],
    priority: snapshot.priority,
    medicationCodeableConcept: {
      coding: [
        {
          system: snapshot.medicationCode.system,
          code: snapshot.medicationCode.code,
          display: snapshot.medicationCode.display
        }
      ],
      text: snapshot.medicationCode.display
    },
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
      {
        text: snapshot.dosageInstruction.text,
        route: snapshot.dosageInstruction.route
          ? {
              text: snapshot.dosageInstruction.route
            }
          : undefined,
        timing:
          snapshot.dosageInstruction.frequency &&
          snapshot.dosageInstruction.period &&
          snapshot.dosageInstruction.periodUnit
            ? {
                repeat: {
                  frequency: snapshot.dosageInstruction.frequency,
                  period: snapshot.dosageInstruction.period,
                  periodUnit: snapshot.dosageInstruction.periodUnit
                }
              }
            : undefined,
        doseAndRate: snapshot.dosageInstruction.doseQuantity
          ? [
              {
                doseQuantity: snapshot.dosageInstruction.doseQuantity
              }
            ]
          : undefined
      }
    ],
    dispenseRequest: snapshot.expectedSupplyDurationDays
      ? {
          expectedSupplyDuration: {
            value: snapshot.expectedSupplyDurationDays,
            unit: "day",
            system: "http://unitsofmeasure.org",
            code: "d"
          }
        }
      : undefined,
    note: snapshot.note ? [{ text: snapshot.note }] : undefined
  };
}

import type { MedicationCode } from "../medication-request/medication-request.js";
import type {
  MedicationDispense,
  MedicationDispenseCategory
} from "../medication-dispense/medication-dispense.js";
import type { FhirMedicationDispense } from "./fhir-types.js";

const categorySystem = "http://terminology.hl7.org/CodeSystem/medicationdispense-category";

export function mapMedicationDispenseToFhir(
  medicationDispense: MedicationDispense
): FhirMedicationDispense {
  const snapshot = medicationDispense.toSnapshot();

  return {
    resourceType: "MedicationDispense",
    id: snapshot.id,
    meta: {
      profile: ["http://hl7.org/fhir/StructureDefinition/MedicationDispense"]
    },
    identifier: [
      {
        system: "urn:wiiicare:nexus:medication-dispense",
        value: snapshot.id
      }
    ],
    status: snapshot.status,
    statusReasonCodeableConcept: snapshot.statusReason
      ? toCodeableConcept(snapshot.statusReason)
      : undefined,
    category: {
      coding: [
        {
          system: categorySystem,
          code: snapshot.category,
          display: formatMedicationDispenseCategory(snapshot.category)
        }
      ],
      text: formatMedicationDispenseCategory(snapshot.category)
    },
    medicationCodeableConcept: toCodeableConcept(snapshot.medicationCode),
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
      ? [
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
        ]
      : undefined,
    note: snapshot.note ? [{ text: snapshot.note }] : undefined
  };
}

function toCodeableConcept(coding: MedicationCode): {
  readonly coding: readonly {
    readonly system: string;
    readonly code: string;
    readonly display: string;
  }[];
  readonly text: string;
} {
  return {
    coding: [
      {
        system: coding.system,
        code: coding.code,
        display: coding.display
      }
    ],
    text: coding.display
  };
}

function formatMedicationDispenseCategory(
  category: MedicationDispenseCategory
): string {
  const labels: Record<MedicationDispenseCategory, string> = {
    community: "Community",
    discharge: "Discharge",
    inpatient: "Inpatient",
    outpatient: "Outpatient"
  };

  return labels[category];
}

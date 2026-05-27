import type {
  MedicationAdministration,
  MedicationAdministrationCategory,
  MedicationAdministrationPerformer
} from "../medication-administration/medication-administration.js";
import type { MedicationCode } from "../medication-request/medication-request.js";
import type { FhirMedicationAdministration } from "./fhir-types.js";

const categorySystem = "http://terminology.hl7.org/CodeSystem/medication-admin-category";

export function mapMedicationAdministrationToFhir(
  medicationAdministration: MedicationAdministration
): FhirMedicationAdministration {
  const snapshot = medicationAdministration.toSnapshot();

  return {
    resourceType: "MedicationAdministration",
    id: snapshot.id,
    meta: {
      profile: ["http://hl7.org/fhir/StructureDefinition/MedicationAdministration"]
    },
    identifier: [
      {
        system: "urn:wiiicare:nexus:medication-administration",
        value: snapshot.id
      }
    ],
    status: snapshot.status,
    statusReason: snapshot.statusReason ? [toCodeableConcept(snapshot.statusReason)] : undefined,
    category: {
      coding: [
        {
          system: categorySystem,
          code: snapshot.category,
          display: formatMedicationAdministrationCategory(snapshot.category)
        }
      ],
      text: formatMedicationAdministrationCategory(snapshot.category)
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
    effectivePeriod: snapshot.effectivePeriod,
    performer:
      snapshot.performers.length > 0
        ? snapshot.performers.map(toFhirPerformer)
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
      ? {
          text: snapshot.dosage.text,
          route: snapshot.dosage.route ? toCodeableConcept(snapshot.dosage.route) : undefined,
          dose: snapshot.dosage.doseQuantity
        }
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

function toFhirPerformer(
  performer: MedicationAdministrationPerformer
): NonNullable<FhirMedicationAdministration["performer"]>[number] {
  return {
    function: performer.function ? toCodeableConcept(performer.function) : undefined,
    actor: {
      reference: `${performer.actorType}/${performer.actorId}`
    }
  };
}

function formatMedicationAdministrationCategory(
  category: MedicationAdministrationCategory
): string {
  const labels: Record<MedicationAdministrationCategory, string> = {
    community: "Community",
    inpatient: "Inpatient",
    outpatient: "Outpatient",
    "patient-specified": "Patient specified"
  };

  return labels[category];
}

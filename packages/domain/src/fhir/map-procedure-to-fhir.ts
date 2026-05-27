import type {
  Procedure,
  ProcedureCategory,
  ProcedureCoding,
  ProcedurePerformer
} from "../procedure/procedure.js";
import type { FhirProcedure } from "./fhir-types.js";

const procedureCategorySystem = "urn:wiiicare:nexus:procedure-category";

export function mapProcedureToFhir(procedure: Procedure): FhirProcedure {
  const snapshot = procedure.toSnapshot();

  return {
    resourceType: "Procedure",
    id: snapshot.id,
    meta: {
      profile: ["http://hl7.org/fhir/StructureDefinition/Procedure"]
    },
    identifier: [
      {
        system: "urn:wiiicare:nexus:procedure",
        value: snapshot.id
      }
    ],
    basedOn: snapshot.basedOnServiceRequestId
      ? [
          {
            reference: `ServiceRequest/${snapshot.basedOnServiceRequestId}`
          }
        ]
      : undefined,
    partOf: snapshot.partOfProcedureId
      ? [
          {
            reference: `Procedure/${snapshot.partOfProcedureId}`
          }
        ]
      : undefined,
    status: snapshot.status,
    statusReason: snapshot.statusReason ? toCodeableConcept(snapshot.statusReason) : undefined,
    category: {
      coding: [
        {
          system: procedureCategorySystem,
          code: snapshot.category,
          display: formatProcedureCategory(snapshot.category)
        }
      ],
      text: formatProcedureCategory(snapshot.category)
    },
    code: toCodeableConcept(snapshot.code),
    subject: {
      reference: `Patient/${snapshot.patientId}`
    },
    encounter: snapshot.encounterId
      ? {
          reference: `Encounter/${snapshot.encounterId}`
        }
      : undefined,
    performedPeriod: snapshot.performedPeriod,
    recorder: snapshot.recorderPractitionerId
      ? {
          reference: `Practitioner/${snapshot.recorderPractitionerId}`
        }
      : undefined,
    asserter: snapshot.asserterPractitionerId
      ? {
          reference: `Practitioner/${snapshot.asserterPractitionerId}`
        }
      : undefined,
    performer:
      snapshot.performers.length > 0 ? snapshot.performers.map(toFhirPerformer) : undefined,
    reasonReference: snapshot.reasonConditionId
      ? [
          {
            reference: `Condition/${snapshot.reasonConditionId}`
          }
        ]
      : undefined,
    bodySite: snapshot.bodySite ? [toCodeableConcept(snapshot.bodySite)] : undefined,
    outcome: snapshot.outcome ? toCodeableConcept(snapshot.outcome) : undefined,
    report:
      snapshot.reportReferences.length > 0
        ? snapshot.reportReferences.map((reference) => ({
            reference: `${reference.resourceType}/${reference.id}`
          }))
        : undefined,
    note: snapshot.note ? [{ text: snapshot.note }] : undefined
  };
}

function toCodeableConcept(coding: ProcedureCoding): {
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

function toFhirPerformer(performer: ProcedurePerformer): NonNullable<FhirProcedure["performer"]>[number] {
  return {
    function: performer.function ? toCodeableConcept(performer.function) : undefined,
    actor: {
      reference: `${performer.actorType}/${performer.actorId}`
    },
    onBehalfOf: performer.onBehalfOfOrganizationId
      ? {
          reference: `Organization/${performer.onBehalfOfOrganizationId}`
        }
      : undefined
  };
}

function formatProcedureCategory(category: ProcedureCategory): string {
  const labels = {
    surgical: "Phẫu thuật",
    diagnostic: "Chẩn đoán",
    therapeutic: "Điều trị",
    counseling: "Tư vấn",
    rehabilitation: "Phục hồi chức năng",
    other: "Khác"
  } as const;

  return labels[category as keyof typeof labels] ?? "Khác";
}

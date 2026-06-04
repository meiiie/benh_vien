import type {
  ProcedureCategory,
  ProcedureCoding,
  ProcedurePerformer
} from "../procedure/procedure.types.js";
import type { FhirProcedure } from "./fhir-types.js";

const procedureCategorySystem = "urn:wiiicare:nexus:procedure-category";

export const procedureFhirProfile = "http://hl7.org/fhir/StructureDefinition/Procedure";
export const procedureIdentifierSystem = "urn:wiiicare:nexus:procedure";

export function buildProcedureIdentifier(
  procedureId: string
): NonNullable<FhirProcedure["identifier"]>[number] {
  return {
    system: procedureIdentifierSystem,
    value: procedureId
  };
}

export function buildProcedureCategory(
  category: ProcedureCategory
): NonNullable<FhirProcedure["category"]> {
  const display = formatProcedureCategory(category);

  return {
    coding: [
      {
        system: procedureCategorySystem,
        code: category,
        display
      }
    ],
    text: display
  };
}

export function toProcedureCodeableConcept(coding: ProcedureCoding): {
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

export function toFhirProcedurePerformer(
  performer: ProcedurePerformer
): NonNullable<FhirProcedure["performer"]>[number] {
  return {
    function: performer.function
      ? toProcedureCodeableConcept(performer.function)
      : undefined,
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

export function formatProcedureCategory(category: ProcedureCategory): string {
  const labels: Record<ProcedureCategory, string> = {
    counseling: "Tư vấn",
    diagnostic: "Chẩn đoán",
    other: "Khác",
    rehabilitation: "Phục hồi chức năng",
    surgical: "Phẫu thuật",
    therapeutic: "Điều trị"
  };

  return labels[category];
}

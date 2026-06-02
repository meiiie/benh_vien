import type { FhirContactPoint, FhirIdentifier } from "./fhir-shared.types.js";

export type FhirOrganization = {
  readonly resourceType: "Organization";
  readonly id: string;
  readonly meta?: {
    readonly profile?: readonly string[];
  };
  readonly identifier?: readonly FhirIdentifier[];
  readonly active?: boolean;
  readonly type?: readonly {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  }[];
  readonly name: string;
  readonly alias?: readonly string[];
  readonly telecom?: readonly FhirContactPoint[];
  readonly address?: readonly {
    readonly text: string;
  }[];
  readonly partOf?: {
    readonly reference: string;
  };
};

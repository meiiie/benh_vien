import type { FhirContactPoint, FhirIdentifier } from "./fhir-shared.types.js";

export type FhirPractitioner = {
  readonly resourceType: "Practitioner";
  readonly id: string;
  readonly meta?: {
    readonly profile?: readonly string[];
  };
  readonly identifier?: readonly FhirIdentifier[];
  readonly active?: boolean;
  readonly name: readonly {
    readonly text: string;
  }[];
  readonly telecom?: readonly FhirContactPoint[];
  readonly qualification?: readonly {
    readonly code: {
      readonly text: string;
    };
  }[];
};

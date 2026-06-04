import type { FhirContactPoint } from "./fhir-shared.types.js";

export type FhirPractitionerRole = {
  readonly resourceType: "PractitionerRole";
  readonly id: string;
  readonly meta?: {
    readonly profile?: readonly string[];
  };
  readonly active?: boolean;
  readonly period?: {
    readonly start?: string;
    readonly end?: string;
  };
  readonly practitioner?: {
    readonly reference: string;
  };
  readonly organization: {
    readonly reference: string;
  };
  readonly code?: readonly {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  }[];
  readonly specialty?: readonly {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  }[];
  readonly telecom?: readonly FhirContactPoint[];
  readonly endpoint?: readonly {
    readonly reference: string;
  }[];
};

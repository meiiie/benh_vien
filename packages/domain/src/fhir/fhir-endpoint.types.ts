import type { FhirContactPoint } from "./fhir-shared.types.js";

export type FhirEndpoint = {
  readonly resourceType: "Endpoint";
  readonly id: string;
  readonly meta?: {
    readonly profile?: readonly string[];
  };
  readonly status: "active" | "suspended" | "error" | "off" | "entered-in-error" | "test";
  readonly connectionType: {
    readonly system: string;
    readonly code: string;
    readonly display: string;
  };
  readonly name?: string;
  readonly managingOrganization?: {
    readonly reference: string;
  };
  readonly contact?: readonly FhirContactPoint[];
  readonly payloadType: readonly {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  }[];
  readonly address: string;
};

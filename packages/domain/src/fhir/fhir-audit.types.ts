import type { FhirIdentifier } from "./fhir-shared.types.js";

export type FhirAuditEvent = {
  readonly resourceType: "AuditEvent";
  readonly id?: string;
  readonly meta?: {
    readonly profile?: readonly string[];
  };
  readonly type: {
    readonly system: string;
    readonly code: string;
    readonly display: string;
  };
  readonly subtype?: readonly {
    readonly system: string;
    readonly code: string;
    readonly display: string;
  }[];
  readonly action?: "C" | "R" | "U" | "D" | "E";
  readonly recorded: string;
  readonly outcome?: "0" | "4" | "8" | "12";
  readonly outcomeDesc?: string;
  readonly agent: readonly {
    readonly who?: {
      readonly reference?: string;
      readonly identifier?: FhirIdentifier;
      readonly display?: string;
    };
    readonly requestor: boolean;
    readonly purposeOfUse?: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly network?: {
      readonly address: string;
      readonly type: "1" | "2" | "3" | "4" | "5";
    };
  }[];
  readonly source: {
    readonly site?: string;
    readonly observer: {
      readonly display: string;
    };
    readonly type?: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
  };
  readonly entity?: readonly {
    readonly what?: {
      readonly reference?: string;
      readonly identifier?: FhirIdentifier;
      readonly display?: string;
    };
    readonly name?: string;
    readonly description?: string;
    readonly detail?: readonly {
      readonly type: string;
      readonly valueString: string;
    }[];
  }[];
};

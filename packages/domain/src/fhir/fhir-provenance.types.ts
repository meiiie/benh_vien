export type FhirProvenance = {
  readonly resourceType: "Provenance";
  readonly id: string;
  readonly meta?: {
    readonly profile?: readonly string[];
  };
  readonly target: readonly {
    readonly reference: string;
    readonly display?: string;
  }[];
  readonly occurredDateTime?: string;
  readonly recorded: string;
  readonly policy?: readonly string[];
  readonly activity?: {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  };
  readonly agent: readonly {
    readonly type?: {
      readonly coding: readonly {
        readonly system: string;
        readonly code: string;
        readonly display: string;
      }[];
      readonly text: string;
    };
    readonly role?: readonly {
      readonly text: string;
    }[];
    readonly who: {
      readonly reference: string;
      readonly display?: string;
    };
    readonly onBehalfOf?: {
      readonly reference: string;
    };
  }[];
  readonly entity?: readonly {
    readonly role: "derivation" | "revision" | "quotation" | "source" | "removal";
    readonly what: {
      readonly reference?: string;
      readonly display?: string;
    };
  }[];
};

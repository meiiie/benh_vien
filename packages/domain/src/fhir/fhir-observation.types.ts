export type FhirObservation = {
  readonly resourceType: "Observation";
  readonly id: string;
  readonly meta?: {
    readonly profile?: readonly string[];
  };
  readonly status:
    | "registered"
    | "preliminary"
    | "final"
    | "amended"
    | "cancelled"
    | "entered-in-error";
  readonly category: readonly {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  }[];
  readonly code: {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  };
  readonly subject: {
    readonly reference: string;
  };
  readonly encounter?: {
    readonly reference: string;
  };
  readonly effectiveDateTime: string;
  readonly valueQuantity?: {
    readonly value: number;
    readonly unit: string;
    readonly system?: string;
    readonly code?: string;
  };
  readonly valueString?: string;
  readonly performer?: readonly {
    readonly reference: string;
  }[];
};

export type FhirDiagnosticReport = {
  readonly resourceType: "DiagnosticReport";
  readonly id: string;
  readonly meta?: {
    readonly profile?: readonly string[];
  };
  readonly basedOn?: readonly {
    readonly reference: string;
  }[];
  readonly status:
    | "registered"
    | "partial"
    | "preliminary"
    | "final"
    | "amended"
    | "corrected"
    | "appended"
    | "cancelled"
    | "entered-in-error"
    | "unknown";
  readonly category?: readonly {
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
  readonly effectiveDateTime?: string;
  readonly issued?: string;
  readonly performer?: readonly {
    readonly reference: string;
  }[];
  readonly resultsInterpreter?: readonly {
    readonly reference: string;
  }[];
  readonly result?: readonly {
    readonly reference: string;
  }[];
  readonly conclusion?: string;
  readonly presentedForm?: readonly {
    readonly url: string;
    readonly title: string;
  }[];
};

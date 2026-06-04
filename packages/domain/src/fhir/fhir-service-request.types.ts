export type FhirServiceRequest = {
  readonly resourceType: "ServiceRequest";
  readonly id: string;
  readonly meta?: {
    readonly profile?: readonly string[];
  };
  readonly status:
    | "draft"
    | "active"
    | "on-hold"
    | "revoked"
    | "completed"
    | "entered-in-error"
    | "unknown";
  readonly intent:
    | "proposal"
    | "plan"
    | "directive"
    | "order"
    | "original-order"
    | "reflex-order"
    | "filler-order"
    | "instance-order"
    | "option";
  readonly category?: readonly {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  }[];
  readonly priority?: "routine" | "urgent" | "asap" | "stat";
  readonly code?: {
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
  readonly occurrenceDateTime?: string;
  readonly authoredOn?: string;
  readonly requester?: {
    readonly reference: string;
  };
  readonly performer?: readonly {
    readonly reference: string;
  }[];
  readonly reasonReference?: readonly {
    readonly reference: string;
  }[];
  readonly patientInstruction?: string;
  readonly note?: readonly {
    readonly text: string;
  }[];
};

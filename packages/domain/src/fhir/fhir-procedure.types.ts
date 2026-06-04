import type { FhirIdentifier } from "./fhir-shared.types.js";

export type FhirProcedure = {
  readonly resourceType: "Procedure";
  readonly id: string;
  readonly meta?: {
    readonly profile?: readonly string[];
  };
  readonly identifier?: readonly FhirIdentifier[];
  readonly basedOn?: readonly {
    readonly reference: string;
  }[];
  readonly partOf?: readonly {
    readonly reference: string;
  }[];
  readonly status:
    | "preparation"
    | "in-progress"
    | "not-done"
    | "on-hold"
    | "stopped"
    | "completed"
    | "entered-in-error"
    | "unknown";
  readonly statusReason?: {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  };
  readonly category?: {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  };
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
  readonly performedPeriod?: {
    readonly start?: string;
    readonly end?: string;
  };
  readonly recorder?: {
    readonly reference: string;
  };
  readonly asserter?: {
    readonly reference: string;
  };
  readonly performer?: readonly {
    readonly function?: {
      readonly coding: readonly {
        readonly system: string;
        readonly code: string;
        readonly display: string;
      }[];
      readonly text: string;
    };
    readonly actor: {
      readonly reference: string;
    };
    readonly onBehalfOf?: {
      readonly reference: string;
    };
  }[];
  readonly reasonReference?: readonly {
    readonly reference: string;
  }[];
  readonly bodySite?: readonly {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  }[];
  readonly outcome?: {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  };
  readonly report?: readonly {
    readonly reference: string;
  }[];
  readonly note?: readonly {
    readonly text: string;
  }[];
};

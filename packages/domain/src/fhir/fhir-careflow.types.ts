import type { FhirIdentifier } from "./fhir-shared.types.js";

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

export type FhirTask = {
  readonly resourceType: "Task";
  readonly id: string;
  readonly meta?: {
    readonly profile?: readonly string[];
  };
  readonly identifier?: readonly FhirIdentifier[];
  readonly basedOn?: readonly {
    readonly reference: string;
  }[];
  readonly status:
    | "draft"
    | "requested"
    | "received"
    | "accepted"
    | "rejected"
    | "ready"
    | "cancelled"
    | "in-progress"
    | "on-hold"
    | "failed"
    | "completed"
    | "entered-in-error";
  readonly businessStatus?: {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  };
  readonly intent:
    | "unknown"
    | "proposal"
    | "plan"
    | "order"
    | "original-order"
    | "reflex-order"
    | "filler-order"
    | "instance-order"
    | "option";
  readonly priority?: "routine" | "urgent" | "asap" | "stat";
  readonly code?: {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  };
  readonly description?: string;
  readonly focus?: {
    readonly reference: string;
  };
  readonly for: {
    readonly reference: string;
  };
  readonly encounter?: {
    readonly reference: string;
  };
  readonly executionPeriod?: {
    readonly start?: string;
    readonly end?: string;
  };
  readonly authoredOn?: string;
  readonly lastModified?: string;
  readonly requester?: {
    readonly reference: string;
  };
  readonly owner?: {
    readonly reference: string;
  };
  readonly input?: readonly {
    readonly type: {
      readonly text: string;
    };
    readonly valueReference: {
      readonly reference: string;
      readonly display?: string;
    };
  }[];
  readonly output?: readonly {
    readonly type: {
      readonly text: string;
    };
    readonly valueReference: {
      readonly reference: string;
      readonly display?: string;
    };
  }[];
  readonly note?: readonly {
    readonly text: string;
  }[];
};

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

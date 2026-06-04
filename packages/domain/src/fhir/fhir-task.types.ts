import type { FhirIdentifier } from "./fhir-shared.types.js";

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

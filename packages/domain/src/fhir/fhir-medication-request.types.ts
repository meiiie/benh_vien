export type FhirMedicationRequest = {
  readonly resourceType: "MedicationRequest";
  readonly id: string;
  readonly meta?: {
    readonly profile?: readonly string[];
  };
  readonly status:
    | "active"
    | "on-hold"
    | "cancelled"
    | "completed"
    | "entered-in-error"
    | "stopped"
    | "draft"
    | "unknown";
  readonly intent:
    | "proposal"
    | "plan"
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
  readonly medicationCodeableConcept: {
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
  readonly authoredOn?: string;
  readonly requester?: {
    readonly reference: string;
  };
  readonly reasonReference?: readonly {
    readonly reference: string;
  }[];
  readonly dosageInstruction?: readonly {
    readonly text: string;
    readonly route?: {
      readonly text: string;
    };
    readonly timing?: {
      readonly repeat: {
        readonly frequency: number;
        readonly period: number;
        readonly periodUnit: "h" | "d" | "wk";
      };
    };
    readonly doseAndRate?: readonly {
      readonly doseQuantity: {
        readonly value: number;
        readonly unit: string;
        readonly system?: string;
        readonly code?: string;
      };
    }[];
  }[];
  readonly dispenseRequest?: {
    readonly expectedSupplyDuration: {
      readonly value: number;
      readonly unit: string;
      readonly system: string;
      readonly code: string;
    };
  };
  readonly note?: readonly {
    readonly text: string;
  }[];
};

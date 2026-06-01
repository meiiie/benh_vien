import type { FhirIdentifier } from "./fhir-shared.types.js";

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

export type FhirMedicationDispense = {
  readonly resourceType: "MedicationDispense";
  readonly id: string;
  readonly meta?: {
    readonly profile?: readonly string[];
  };
  readonly identifier?: readonly FhirIdentifier[];
  readonly status:
    | "preparation"
    | "in-progress"
    | "cancelled"
    | "on-hold"
    | "completed"
    | "entered-in-error"
    | "stopped"
    | "declined"
    | "unknown";
  readonly statusReasonCodeableConcept?: {
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
  readonly context?: {
    readonly reference: string;
  };
  readonly authorizingPrescription?: readonly {
    readonly reference: string;
  }[];
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
  }[];
  readonly quantity?: {
    readonly value: number;
    readonly unit: string;
    readonly system?: string;
    readonly code?: string;
  };
  readonly daysSupply?: {
    readonly value: number;
    readonly unit: string;
    readonly system?: string;
    readonly code?: string;
  };
  readonly whenPrepared?: string;
  readonly whenHandedOver?: string;
  readonly destination?: {
    readonly reference: string;
  };
  readonly receiver?: readonly {
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
  readonly note?: readonly {
    readonly text: string;
  }[];
};

export type FhirMedicationAdministration = {
  readonly resourceType: "MedicationAdministration";
  readonly id: string;
  readonly meta?: {
    readonly profile?: readonly string[];
  };
  readonly identifier?: readonly FhirIdentifier[];
  readonly status:
    | "in-progress"
    | "not-done"
    | "on-hold"
    | "completed"
    | "entered-in-error"
    | "stopped"
    | "unknown";
  readonly statusReason?: readonly {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  }[];
  readonly category?: {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  };
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
  readonly context?: {
    readonly reference: string;
  };
  readonly effectivePeriod: {
    readonly start?: string;
    readonly end?: string;
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
  }[];
  readonly reasonReference?: readonly {
    readonly reference: string;
  }[];
  readonly request?: {
    readonly reference: string;
  };
  readonly dosage?: {
    readonly text?: string;
    readonly route?: {
      readonly coding: readonly {
        readonly system: string;
        readonly code: string;
        readonly display: string;
      }[];
      readonly text: string;
    };
    readonly dose?: {
      readonly value: number;
      readonly unit: string;
      readonly system?: string;
      readonly code?: string;
    };
  };
  readonly note?: readonly {
    readonly text: string;
  }[];
};

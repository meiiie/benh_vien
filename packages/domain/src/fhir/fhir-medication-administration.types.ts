import type { FhirIdentifier } from "./fhir-shared.types.js";

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

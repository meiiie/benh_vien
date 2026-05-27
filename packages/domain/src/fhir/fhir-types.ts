import type { AdministrativeGender } from "../patient/patient.js";

export type FhirIdentifier = {
  readonly system: string;
  readonly value: string;
  readonly type?: {
    readonly text: string;
  };
};

export type FhirDocumentReference = {
  readonly resourceType: "DocumentReference";
  readonly id: string;
  readonly meta?: {
    readonly profile?: readonly string[];
  };
  readonly status: "current" | "superseded" | "entered-in-error";
  readonly docStatus?: "preliminary" | "final" | "entered-in-error";
  readonly type: {
    readonly text: string;
  };
  readonly subject: {
    readonly reference: string;
  };
  readonly context?: {
    readonly encounter?: readonly {
      readonly reference: string;
    }[];
  };
  readonly author?: readonly {
    readonly reference: string;
  }[];
  readonly date: string;
  readonly content: readonly {
    readonly attachment: {
      readonly url: string;
      readonly title: string;
    };
  }[];
};

export type FhirEncounter = {
  readonly resourceType: "Encounter";
  readonly id: string;
  readonly meta?: {
    readonly profile?: readonly string[];
  };
  readonly status:
    | "planned"
    | "in-progress"
    | "finished"
    | "cancelled"
    | "entered-in-error";
  readonly class: {
    readonly system: string;
    readonly code: string;
    readonly display?: string;
  };
  readonly type?: readonly {
    readonly text: string;
  }[];
  readonly subject: {
    readonly reference: string;
  };
  readonly participant?: readonly {
    readonly individual: {
      readonly reference: string;
    };
  }[];
  readonly period: {
    readonly start: string;
    readonly end?: string;
  };
  readonly reasonCode?: readonly {
    readonly text: string;
  }[];
  readonly serviceProvider?: {
    readonly reference: string;
  };
};

export type FhirCondition = {
  readonly resourceType: "Condition";
  readonly id: string;
  readonly meta?: {
    readonly profile?: readonly string[];
  };
  readonly clinicalStatus: {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  };
  readonly verificationStatus: {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  };
  readonly category: readonly {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  }[];
  readonly severity?: {
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
  readonly onsetDateTime?: string;
  readonly recordedDate: string;
  readonly recorder: {
    readonly reference: string;
  };
  readonly note?: readonly {
    readonly text: string;
  }[];
};

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

export type FhirPatient = {
  readonly resourceType: "Patient";
  readonly id: string;
  readonly meta?: {
    readonly profile?: readonly string[];
  };
  readonly identifier?: readonly FhirIdentifier[];
  readonly active?: boolean;
  readonly name?: readonly {
    readonly text: string;
  }[];
  readonly gender?: AdministrativeGender;
  readonly birthDate?: string;
  readonly telecom?: readonly {
    readonly system: "phone";
    readonly value: string;
    readonly use: "mobile" | "home" | "work";
  }[];
  readonly address?: readonly {
    readonly text: string;
  }[];
  readonly managingOrganization?: {
    readonly reference: string;
  };
};

export type FhirBundleEntry = {
  readonly fullUrl: string;
  readonly resource:
    | FhirPatient
    | FhirEncounter
    | FhirCondition
    | FhirObservation
    | FhirMedicationRequest
    | FhirDocumentReference;
};

export type FhirBundle = {
  readonly resourceType: "Bundle";
  readonly id: string;
  readonly meta?: {
    readonly profile?: readonly string[];
  };
  readonly identifier?: {
    readonly system: string;
    readonly value: string;
  };
  readonly type: "collection";
  readonly timestamp: string;
  readonly entry: readonly FhirBundleEntry[];
};

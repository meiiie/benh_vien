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
  readonly clinicalStatus?: {
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

export type FhirAllergyIntolerance = {
  readonly resourceType: "AllergyIntolerance";
  readonly id: string;
  readonly meta?: {
    readonly profile?: readonly string[];
  };
  readonly clinicalStatus?: {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  };
  readonly verificationStatus?: {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  };
  readonly type?: "allergy" | "intolerance";
  readonly category?: readonly ("food" | "medication" | "environment" | "biologic")[];
  readonly criticality?: "low" | "high" | "unable-to-assess";
  readonly code?: {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  };
  readonly patient: {
    readonly reference: string;
  };
  readonly encounter?: {
    readonly reference: string;
  };
  readonly recordedDate?: string;
  readonly recorder?: {
    readonly reference: string;
  };
  readonly reaction?: readonly {
    readonly manifestation: readonly {
      readonly coding: readonly {
        readonly system: string;
        readonly code: string;
        readonly display: string;
      }[];
      readonly text: string;
    }[];
    readonly severity?: "mild" | "moderate" | "severe";
    readonly description?: string;
  }[];
  readonly note?: readonly {
    readonly text: string;
  }[];
};

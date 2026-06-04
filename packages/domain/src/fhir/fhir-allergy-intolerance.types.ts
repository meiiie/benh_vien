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

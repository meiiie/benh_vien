import type { FhirIdentifier } from "./fhir-shared.types.js";

export type FhirDiagnosticReport = {
  readonly resourceType: "DiagnosticReport";
  readonly id: string;
  readonly meta?: {
    readonly profile?: readonly string[];
  };
  readonly basedOn?: readonly {
    readonly reference: string;
  }[];
  readonly status:
    | "registered"
    | "partial"
    | "preliminary"
    | "final"
    | "amended"
    | "corrected"
    | "appended"
    | "cancelled"
    | "entered-in-error"
    | "unknown";
  readonly category?: readonly {
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
  readonly effectiveDateTime?: string;
  readonly issued?: string;
  readonly performer?: readonly {
    readonly reference: string;
  }[];
  readonly resultsInterpreter?: readonly {
    readonly reference: string;
  }[];
  readonly result?: readonly {
    readonly reference: string;
  }[];
  readonly conclusion?: string;
  readonly presentedForm?: readonly {
    readonly url: string;
    readonly title: string;
  }[];
};

export type FhirImagingStudy = {
  readonly resourceType: "ImagingStudy";
  readonly id: string;
  readonly meta?: {
    readonly profile?: readonly string[];
  };
  readonly identifier: readonly FhirIdentifier[];
  readonly status:
    | "registered"
    | "available"
    | "cancelled"
    | "entered-in-error"
    | "unknown";
  readonly modality?: readonly {
    readonly system: string;
    readonly code: string;
    readonly display: string;
  }[];
  readonly subject: {
    readonly reference: string;
  };
  readonly encounter?: {
    readonly reference: string;
  };
  readonly started?: string;
  readonly basedOn?: readonly {
    readonly reference: string;
  }[];
  readonly referrer?: {
    readonly reference: string;
  };
  readonly interpreter?: readonly {
    readonly reference: string;
  }[];
  readonly endpoint?: readonly {
    readonly reference: string;
  }[];
  readonly numberOfSeries: number;
  readonly numberOfInstances: number;
  readonly description?: string;
  readonly series?: readonly {
    readonly uid: string;
    readonly number?: number;
    readonly modality: {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    };
    readonly description?: string;
    readonly numberOfInstances: number;
    readonly bodySite?: {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    };
    readonly started?: string;
  }[];
};

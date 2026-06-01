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

export type FhirComposition = {
  readonly resourceType: "Composition";
  readonly id: string;
  readonly meta?: {
    readonly profile?: readonly string[];
  };
  readonly status: "preliminary" | "final" | "amended" | "entered-in-error";
  readonly type: {
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
  readonly date: string;
  readonly author: readonly {
    readonly reference: string;
  }[];
  readonly title: string;
  readonly custodian?: {
    readonly reference: string;
  };
  readonly section?: readonly {
    readonly title: string;
    readonly text?: {
      readonly status: "generated";
      readonly div: string;
    };
    readonly entry?: readonly {
      readonly reference: string;
    }[];
  }[];
};

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
      readonly contentType?: string;
      readonly url: string;
      readonly size?: number;
      readonly hash?: string;
      readonly title: string;
      readonly creation?: string;
    };
  }[];
};

export type FhirProvenance = {
  readonly resourceType: "Provenance";
  readonly id: string;
  readonly meta?: {
    readonly profile?: readonly string[];
  };
  readonly target: readonly {
    readonly reference: string;
    readonly display?: string;
  }[];
  readonly occurredDateTime?: string;
  readonly recorded: string;
  readonly policy?: readonly string[];
  readonly activity?: {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  };
  readonly agent: readonly {
    readonly type?: {
      readonly coding: readonly {
        readonly system: string;
        readonly code: string;
        readonly display: string;
      }[];
      readonly text: string;
    };
    readonly role?: readonly {
      readonly text: string;
    }[];
    readonly who: {
      readonly reference: string;
      readonly display?: string;
    };
    readonly onBehalfOf?: {
      readonly reference: string;
    };
  }[];
  readonly entity?: readonly {
    readonly role: "derivation" | "revision" | "quotation" | "source" | "removal";
    readonly what: {
      readonly reference?: string;
      readonly display?: string;
    };
  }[];
};

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

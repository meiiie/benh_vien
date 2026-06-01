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

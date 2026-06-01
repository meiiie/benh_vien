import type { FhirIdentifier } from "./fhir-shared.types.js";

export type FhirConsent = {
  readonly resourceType: "Consent";
  readonly id: string;
  readonly meta?: {
    readonly profile?: readonly string[];
  };
  readonly extension?: readonly {
    readonly url: string;
    readonly extension: readonly (
      | {
          readonly url: string;
          readonly valueReference: {
            readonly reference: string;
          };
        }
      | {
          readonly url: string;
          readonly valueDateTime: string;
        }
      | {
          readonly url: string;
          readonly valueString: string;
        }
    )[];
  }[];
  readonly identifier?: readonly FhirIdentifier[];
  readonly status: "draft" | "proposed" | "active" | "rejected" | "inactive" | "entered-in-error";
  readonly scope: {
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
  readonly patient: {
    readonly reference: string;
  };
  readonly dateTime: string;
  readonly performer?: readonly {
    readonly reference: string;
  }[];
  readonly sourceReference?: {
    readonly reference: string;
  };
  readonly provision?: {
    readonly type: "deny" | "permit";
    readonly period?: {
      readonly start?: string;
      readonly end?: string;
    };
    readonly actor?: readonly {
      readonly role: {
        readonly text: string;
      };
      readonly reference: {
        readonly reference: string;
      };
    }[];
    readonly action?: readonly {
      readonly coding: readonly {
        readonly system: string;
        readonly code: string;
        readonly display: string;
      }[];
      readonly text: string;
    }[];
    readonly purpose?: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly class?: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
  };
};

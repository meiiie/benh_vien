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
  readonly resource: FhirPatient | FhirEncounter | FhirDocumentReference;
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

import type { FhirContactPoint, FhirIdentifier } from "./fhir-shared.types.js";

export type FhirOrganization = {
  readonly resourceType: "Organization";
  readonly id: string;
  readonly meta?: {
    readonly profile?: readonly string[];
  };
  readonly identifier?: readonly FhirIdentifier[];
  readonly active?: boolean;
  readonly type?: readonly {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  }[];
  readonly name: string;
  readonly alias?: readonly string[];
  readonly telecom?: readonly FhirContactPoint[];
  readonly address?: readonly {
    readonly text: string;
  }[];
  readonly partOf?: {
    readonly reference: string;
  };
};

export type FhirPractitioner = {
  readonly resourceType: "Practitioner";
  readonly id: string;
  readonly meta?: {
    readonly profile?: readonly string[];
  };
  readonly identifier?: readonly FhirIdentifier[];
  readonly active?: boolean;
  readonly name: readonly {
    readonly text: string;
  }[];
  readonly telecom?: readonly FhirContactPoint[];
  readonly qualification?: readonly {
    readonly code: {
      readonly text: string;
    };
  }[];
};

export type FhirEndpoint = {
  readonly resourceType: "Endpoint";
  readonly id: string;
  readonly meta?: {
    readonly profile?: readonly string[];
  };
  readonly status: "active" | "suspended" | "error" | "off" | "entered-in-error" | "test";
  readonly connectionType: {
    readonly system: string;
    readonly code: string;
    readonly display: string;
  };
  readonly name?: string;
  readonly managingOrganization?: {
    readonly reference: string;
  };
  readonly contact?: readonly FhirContactPoint[];
  readonly payloadType: readonly {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  }[];
  readonly address: string;
};

export type FhirPractitionerRole = {
  readonly resourceType: "PractitionerRole";
  readonly id: string;
  readonly meta?: {
    readonly profile?: readonly string[];
  };
  readonly active?: boolean;
  readonly period?: {
    readonly start?: string;
    readonly end?: string;
  };
  readonly practitioner?: {
    readonly reference: string;
  };
  readonly organization: {
    readonly reference: string;
  };
  readonly code?: readonly {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  }[];
  readonly specialty?: readonly {
    readonly coding: readonly {
      readonly system: string;
      readonly code: string;
      readonly display: string;
    }[];
    readonly text: string;
  }[];
  readonly telecom?: readonly FhirContactPoint[];
  readonly endpoint?: readonly {
    readonly reference: string;
  }[];
};

import type { AdministrativeGender } from "../patient/patient.js";
import type { FhirIdentifier } from "./fhir-shared.types.js";

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
  readonly link?: readonly {
    readonly other: {
      readonly reference: string;
    };
    readonly type: "replaced-by" | "replaces" | "refer" | "seealso";
  }[];
};

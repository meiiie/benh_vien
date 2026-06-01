import type { FhirCapabilityStatement } from "./fhir-types.js";
import {
  defaultCapabilityStatementResourceInteractions,
  supportedCapabilityStatementResources
} from "./capability-statement-resources.js";

type CapabilityStatementInput = {
  readonly generatedAt?: Date;
  readonly implementationUrl?: string;
  readonly version?: string;
};

export function buildWiiiCareCapabilityStatement(
  input: CapabilityStatementInput = {}
): FhirCapabilityStatement {
  const version = input.version ?? "0.2.0";

  return {
    resourceType: "CapabilityStatement",
    id: "wiiicare-nexus-fhir-r4",
    url: "https://wiiicare.vn/fhir/CapabilityStatement/wiiicare-nexus",
    version,
    name: "WiiiCareNexusFHIRCapabilityStatement",
    title: "WiiiCare Nexus FHIR R4 Capability Statement",
    status: "draft",
    experimental: true,
    date: (input.generatedAt ?? new Date()).toISOString(),
    publisher: "HoLiLiHu - The Wiii Lab",
    kind: "instance",
    software: {
      name: "WiiiCare Nexus",
      version
    },
    implementation: {
      description: "Prototype EMR interoperability facade for WiiiCare Nexus.",
      url: input.implementationUrl
    },
    fhirVersion: "4.0.1",
    format: ["json"],
    rest: [
      {
        mode: "server",
        documentation:
          "This is a FHIR R4 facade for the WiiiCare Nexus prototype. It exports selected resources and bundles, but it is not yet a complete general-purpose FHIR REST server.",
        security: {
          cors: true,
          description:
            "Demo endpoints use an internal Bearer token and x-purpose-of-use header; production must replace this with IAM/SSO, OAuth2/SMART App Launch and organization policy."
        },
        resource: supportedCapabilityStatementResources.map((resource) => ({
          type: resource.type,
          profile: `http://hl7.org/fhir/StructureDefinition/${resource.type}`,
          documentation: resource.documentation,
          interaction:
            resource.interaction ?? defaultCapabilityStatementResourceInteractions
        }))
      }
    ]
  };
}

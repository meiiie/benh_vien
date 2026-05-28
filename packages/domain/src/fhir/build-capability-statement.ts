import type { FhirCapabilityStatement } from "./fhir-types.js";

type CapabilityStatementInput = {
  readonly generatedAt?: Date;
  readonly implementationUrl?: string;
  readonly version?: string;
};

type SupportedFhirResource = {
  readonly type: string;
  readonly documentation: string;
  readonly interaction?: FhirCapabilityStatement["rest"][number]["resource"][number]["interaction"];
};

const defaultInteractions = [{ code: "read" }] as const;

const supportedResources: readonly SupportedFhirResource[] = [
  {
    type: "CapabilityStatement",
    documentation: "Declares the WiiiCare Nexus FHIR R4 facade capability metadata."
  },
  {
    type: "Patient",
    documentation: "Patient identity and registry context exposed through the patient FHIR facade.",
    interaction: [{ code: "read" }, { code: "search-type" }]
  },
  {
    type: "Organization",
    documentation: "Provider Directory organizations for hospitals and departments."
  },
  {
    type: "Practitioner",
    documentation: "Provider Directory practitioners participating in patient care."
  },
  {
    type: "PractitionerRole",
    documentation: "Provider Directory practitioner roles and organization bindings."
  },
  {
    type: "Endpoint",
    documentation: "FHIR, LIS and PACS endpoints advertised by the Provider Directory."
  },
  {
    type: "Encounter",
    documentation: "Clinical encounter metadata linked to patient records."
  },
  {
    type: "AllergyIntolerance",
    documentation: "Medication and clinical safety warnings for the patient record."
  },
  {
    type: "Condition",
    documentation: "Structured diagnoses and health problems."
  },
  {
    type: "ServiceRequest",
    documentation: "Orders for laboratory, imaging, procedure and related clinical services."
  },
  {
    type: "Task",
    documentation: "Workflow tasks for order execution and inter-hospital record transfer."
  },
  {
    type: "Procedure",
    documentation: "Performed clinical procedures and medical activities."
  },
  {
    type: "Observation",
    documentation: "Vital signs and structured laboratory observations."
  },
  {
    type: "DiagnosticReport",
    documentation: "Laboratory and imaging result reports linked to observations and orders."
  },
  {
    type: "ImagingStudy",
    documentation: "PACS/DICOM study metadata, series metadata and DICOMweb endpoint references."
  },
  {
    type: "MedicationRequest",
    documentation: "Medication orders and prescription intent."
  },
  {
    type: "MedicationDispense",
    documentation: "Pharmacy or stock-room medication dispensing events."
  },
  {
    type: "MedicationAdministration",
    documentation: "Medication administration events confirmed at point of care."
  },
  {
    type: "DocumentReference",
    documentation: "Clinical document metadata for EMR documents and referral artifacts."
  },
  {
    type: "Provenance",
    documentation:
      "Provenance records for signed clinical documents, linking actors and signing activity back to DocumentReference."
  },
  {
    type: "Composition",
    documentation: "Document Bundle table of contents used as the first entry of FHIR document exports."
  },
  {
    type: "Consent",
    documentation: "Record-sharing consent, validity period, recipient organization and revocation status."
  },
  {
    type: "Bundle",
    documentation: "Patient record collection Bundle and clinical document Bundle exports."
  },
  {
    type: "AuditEvent",
    documentation: "Security and audit trail events, including integrity hash details."
  }
];

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
        resource: supportedResources.map((resource) => ({
          type: resource.type,
          profile: `http://hl7.org/fhir/StructureDefinition/${resource.type}`,
          documentation: resource.documentation,
          interaction: resource.interaction ?? defaultInteractions
        }))
      }
    ]
  };
}

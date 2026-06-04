import type { FhirCapabilityStatement } from "./fhir-types.js";

export type SupportedCapabilityStatementResource = {
  readonly type: string;
  readonly documentation: string;
  readonly interaction?: FhirCapabilityStatement["rest"][number]["resource"][number]["interaction"];
};

export const defaultCapabilityStatementResourceInteractions = [{ code: "read" }] as const;

export const supportedCapabilityStatementResources: readonly SupportedCapabilityStatementResource[] =
  [
    {
      type: "CapabilityStatement",
      documentation: "Declares the WiiiCare Nexus FHIR R4 facade capability metadata."
    },
    {
      type: "Patient",
      documentation:
        "Patient identity and registry context exposed through the patient FHIR facade.",
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

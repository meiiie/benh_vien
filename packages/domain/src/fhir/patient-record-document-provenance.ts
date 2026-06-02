import type { ClinicalDocument } from "../clinical-document/clinical-document.js";
import type { FhirBundleEntry } from "./fhir-types.js";
import { mapClinicalDocumentToFhirProvenance } from "./map-clinical-document-to-fhir-provenance.js";

export type PatientRecordDocumentProvenanceEntryInput = {
  readonly documents: readonly ClinicalDocument[];
  readonly custodianOrganizationId: string;
};

export function buildPatientRecordDocumentProvenanceEntries({
  documents,
  custodianOrganizationId
}: PatientRecordDocumentProvenanceEntryInput): readonly FhirBundleEntry[] {
  return documents
    .filter((document) => document.toSnapshot().status === "signed")
    .map((document) => {
      const provenance = mapClinicalDocumentToFhirProvenance(document, {
        organizationId: custodianOrganizationId
      });

      return {
        fullUrl: `urn:wiiicare:nexus:Provenance:${provenance.id}`,
        resource: provenance
      };
    });
}

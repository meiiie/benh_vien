import { describe, expect, it } from "vitest";
import { mapPatientRecordToFhirDocumentBundle } from "./map-patient-record-to-fhir-document-bundle.js";
import {
  buildDraftDocument,
  buildProviderDirectory,
  buildSignedDocument,
  createPatientRecordDocumentBundleInput
} from "./patient-record-document-bundle.test-support.js";

describe("mapPatientRecordToFhirDocumentBundle Provenance", () => {
  it("adds Provenance only for signed clinical documents", () => {
    const bundle = mapPatientRecordToFhirDocumentBundle(
      createPatientRecordDocumentBundleInput({
        documents: [buildSignedDocument(), buildDraftDocument()],
        providerDirectory: buildProviderDirectory(),
        custodianOrganizationId: "hospital-document-test"
      })
    );

    const provenanceEntries = bundle.entry.filter(
      (entry) => entry.resource.resourceType === "Provenance"
    );

    expect(provenanceEntries).toHaveLength(1);
    expect(provenanceEntries[0]?.fullUrl).toBe(
      "urn:wiiicare:nexus:Provenance:clinical-document-signed-test-001-provenance"
    );
    expect(provenanceEntries[0]?.resource).toMatchObject({
      resourceType: "Provenance",
      id: "clinical-document-signed-test-001-provenance",
      target: [
        {
          reference: "DocumentReference/clinical-document-signed-test-001",
          display: "Tóm tắt ra viện đã ký"
        }
      ],
      agent: [
        {
          who: {
            reference: "Practitioner/practitioner-document-test-001"
          },
          onBehalfOf: {
            reference: "Organization/hospital-document-test"
          }
        }
      ]
    });
    expect(
      bundle.entry.some(
        (entry) =>
          entry.resource.resourceType === "Provenance" &&
          entry.resource.id === "clinical-document-draft-test-001-provenance"
      )
    ).toBe(false);

    const composition = bundle.entry[0]?.resource;
    if (composition?.resourceType !== "Composition") {
      throw new Error("Expected document Bundle first entry to be a Composition.");
    }

    expect(composition.section).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: "Nguồn gốc và ký xác nhận tài liệu",
          entry: [
            {
              reference: "Provenance/clinical-document-signed-test-001-provenance"
            }
          ]
        })
      ])
    );
  });
});

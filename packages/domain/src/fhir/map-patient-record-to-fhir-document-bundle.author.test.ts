import { describe, expect, it } from "vitest";
import { mapPatientRecordToFhirDocumentBundle } from "./map-patient-record-to-fhir-document-bundle.js";
import {
  buildProviderDirectory,
  createPatientRecordDocumentBundleInput
} from "./patient-record-document-bundle.test-support.js";

describe("mapPatientRecordToFhirDocumentBundle author and custodian", () => {
  it("uses the practitioner author when Provider Directory includes that practitioner", () => {
    const bundle = mapPatientRecordToFhirDocumentBundle(
      createPatientRecordDocumentBundleInput({
        providerDirectory: buildProviderDirectory(),
        authorPractitionerId: "practitioner-document-test-001",
        custodianOrganizationId: "hospital-document-test"
      })
    );

    expect(bundle.entry[0]?.resource).toMatchObject({
      resourceType: "Composition",
      author: [
        {
          reference: "Practitioner/practitioner-document-test-001"
        }
      ],
      custodian: {
        reference: "Organization/hospital-document-test"
      }
    });
  });
});

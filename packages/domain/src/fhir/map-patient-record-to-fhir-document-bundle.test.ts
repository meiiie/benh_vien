import { describe, expect, it } from "vitest";
import { mapPatientRecordToFhirDocumentBundle } from "./map-patient-record-to-fhir-document-bundle.js";
import { createPatientRecordDocumentBundleInput } from "./patient-record-document-bundle.test-support.js";

describe("mapPatientRecordToFhirDocumentBundle", () => {
  it("places Composition first for a FHIR document Bundle", () => {
    const bundle = mapPatientRecordToFhirDocumentBundle(
      createPatientRecordDocumentBundleInput()
    );

    expect(bundle).toMatchObject({
      resourceType: "Bundle",
      id: "patient-document-patient-document-test-001",
      type: "document",
      identifier: {
        system: "urn:wiiicare:nexus:fhir-document-bundle",
        value: "patient-document:patient-document-test-001:2026-05-28T00:00:00.000Z"
      }
    });
    expect(bundle.entry[0]?.resource.resourceType).toBe("Composition");
    expect(bundle.entry[0]?.fullUrl).toBe(
      "urn:wiiicare:nexus:Composition:patient-summary-patient-document-test-001"
    );
    expect(bundle.entry[1]?.resource.resourceType).toBe("Patient");

    const composition = bundle.entry[0]?.resource;
    expect(composition).toMatchObject({
      resourceType: "Composition",
      status: "final",
      subject: {
        reference: "Patient/patient-document-test-001"
      },
      date: "2026-05-28T00:00:00.000Z",
      author: [
        {
          reference: "Patient/patient-document-test-001"
        }
      ]
    });

    if (composition?.resourceType !== "Composition") {
      throw new Error("Expected document Bundle first entry to be a Composition.");
    }

    expect(composition.custodian).toBeUndefined();
    expect(composition.section).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: "Lượt khám",
          entry: [{ reference: "Encounter/encounter-document-test-001" }]
        })
      ])
    );
  });
});

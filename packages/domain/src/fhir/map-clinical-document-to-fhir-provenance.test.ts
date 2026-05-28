import { describe, expect, it } from "vitest";
import { ClinicalDocument } from "../clinical-document/clinical-document.js";
import { DomainError } from "../shared/domain-error.js";
import { mapClinicalDocumentToFhirProvenance } from "./map-clinical-document-to-fhir-provenance.js";

describe("mapClinicalDocumentToFhirProvenance", () => {
  it("maps a signed clinical document to FHIR Provenance", () => {
    const document = ClinicalDocument.create({
      id: "clinical-document-provenance-001",
      patientId: "patient-provenance-001",
      encounterId: "encounter-provenance-001",
      type: "discharge-summary",
      title: "Tóm tắt ra viện",
      storageUri: "s3://wiiicare-demo/patient-provenance-001/discharge-summary.pdf",
      authorPractitionerId: "practitioner-provenance-001"
    });

    document.sign(new Date("2026-05-28T03:00:00.000Z"));

    const provenance = mapClinicalDocumentToFhirProvenance(document, {
      organizationId: "hospital-hai-phong-demo",
      policyUris: ["urn:wiiicare:nexus:policy:record-sharing:v1"],
      recordedAt: new Date("2026-05-28T03:01:00.000Z")
    });

    expect(provenance).toMatchObject({
      resourceType: "Provenance",
      id: "clinical-document-provenance-001-provenance",
      target: [
        {
          reference: "DocumentReference/clinical-document-provenance-001",
          display: "Tóm tắt ra viện"
        }
      ],
      occurredDateTime: "2026-05-28T03:00:00.000Z",
      recorded: "2026-05-28T03:01:00.000Z",
      policy: ["urn:wiiicare:nexus:policy:record-sharing:v1"],
      activity: {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/v3-DataOperation",
            code: "UPDATE"
          }
        ]
      },
      agent: [
        {
          who: {
            reference: "Practitioner/practitioner-provenance-001"
          },
          onBehalfOf: {
            reference: "Organization/hospital-hai-phong-demo"
          }
        }
      ],
      entity: [
        {
          role: "source",
          what: {
            reference: "s3://wiiicare-demo/patient-provenance-001/discharge-summary.pdf"
          }
        }
      ]
    });
  });

  it("rejects an unsigned clinical document", () => {
    const document = ClinicalDocument.create({
      id: "clinical-document-draft-001",
      patientId: "patient-provenance-001",
      type: "lab-report",
      title: "Kết quả xét nghiệm",
      storageUri: "s3://wiiicare-demo/patient-provenance-001/lab-report.pdf",
      authorPractitionerId: "practitioner-provenance-001"
    });

    expect(() => mapClinicalDocumentToFhirProvenance(document)).toThrow(DomainError);
  });
});

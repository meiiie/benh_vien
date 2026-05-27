import { describe, expect, it } from "vitest";
import { mapImagingStudyToFhir } from "../fhir/map-imaging-study-to-fhir.js";
import { DomainError } from "../shared/domain-error.js";
import { ImagingStudy } from "./imaging-study.js";

const dicomModality = {
  system: "http://dicom.nema.org/resources/ontology/DCM",
  code: "DX",
  display: "Digital Radiography"
};

describe("ImagingStudy", () => {
  it("records DICOM study metadata with series and instance counts", () => {
    const imagingStudy = ImagingStudy.record({
      id: "imaging-study-001",
      patientId: "patient-001",
      encounterId: "encounter-001",
      basedOnServiceRequestId: "service-request-001",
      diagnosticReportId: "diagnostic-report-001",
      studyInstanceUid: "1.2.826.0.1.3680043.10.543.1",
      accessionNumber: "HP-CXR-001",
      description: "Chest X-ray",
      startedAt: "2026-05-28T03:00:00.000Z",
      referrerPractitionerId: "practitioner-001",
      interpreterPractitionerId: "practitioner-002",
      endpointId: "endpoint-pacs-hai-phong-demo",
      series: [
        {
          uid: "1.2.826.0.1.3680043.10.543.1.1",
          number: 1,
          modality: dicomModality,
          description: "PA and lateral chest radiographs",
          numberOfInstances: 2,
          bodySite: {
            system: "http://snomed.info/sct",
            code: "51185008",
            display: "Thoracic structure"
          },
          startedAt: "2026-05-28T03:01:00.000Z"
        }
      ]
    });

    expect(imagingStudy.toSnapshot()).toMatchObject({
      id: "imaging-study-001",
      patientId: "patient-001",
      encounterId: "encounter-001",
      basedOnServiceRequestId: "service-request-001",
      diagnosticReportId: "diagnostic-report-001",
      status: "available",
      numberOfSeries: 1,
      numberOfInstances: 2
    });
  });

  it("maps Study Instance UID, ServiceRequest and PACS endpoint to FHIR", () => {
    const imagingStudy = ImagingStudy.record({
      id: "imaging-study-002",
      patientId: "patient-001",
      basedOnServiceRequestId: "service-request-001",
      studyInstanceUid: "1.2.826.0.1.3680043.10.543.2",
      endpointId: "endpoint-pacs-hai-phong-demo",
      numberOfSeries: 3,
      numberOfInstances: 12,
      series: [
        {
          uid: "1.2.826.0.1.3680043.10.543.2.1",
          modality: dicomModality,
          numberOfInstances: 4
        }
      ]
    });

    expect(mapImagingStudyToFhir(imagingStudy)).toMatchObject({
      resourceType: "ImagingStudy",
      identifier: [
        {
          system: "urn:dicom:uid",
          value: "urn:oid:1.2.826.0.1.3680043.10.543.2"
        }
      ],
      status: "available",
      subject: {
        reference: "Patient/patient-001"
      },
      basedOn: [
        {
          reference: "ServiceRequest/service-request-001"
        }
      ],
      endpoint: [
        {
          reference: "Endpoint/endpoint-pacs-hai-phong-demo"
        }
      ],
      numberOfSeries: 3,
      numberOfInstances: 12,
      series: [
        {
          uid: "1.2.826.0.1.3680043.10.543.2.1",
          modality: dicomModality
        }
      ]
    });
  });

  it("rejects studies without DICOM series metadata", () => {
    expect(() =>
      ImagingStudy.record({
        id: "imaging-study-003",
        patientId: "patient-001",
        studyInstanceUid: "1.2.826.0.1.3680043.10.543.3",
        series: []
      })
    ).toThrow(DomainError);
  });

  it("rejects inconsistent series and instance counts", () => {
    expect(() =>
      ImagingStudy.record({
        id: "imaging-study-004",
        patientId: "patient-001",
        studyInstanceUid: "1.2.826.0.1.3680043.10.543.4",
        numberOfSeries: 0,
        numberOfInstances: 1,
        series: [
          {
            uid: "1.2.826.0.1.3680043.10.543.4.1",
            modality: dicomModality,
            numberOfInstances: 2
          }
        ]
      })
    ).toThrow(DomainError);
  });
});

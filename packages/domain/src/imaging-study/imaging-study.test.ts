import { describe, expect, it } from "vitest";
import { ImagingStudy } from "./imaging-study.js";
import { dicomModality } from "./imaging-study.test-support.js";

describe("ImagingStudy recording", () => {
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
});

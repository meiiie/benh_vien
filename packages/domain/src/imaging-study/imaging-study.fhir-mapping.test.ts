import { describe, expect, it } from "vitest";
import { mapImagingStudyToFhir } from "../fhir/map-imaging-study-to-fhir.js";
import { ImagingStudy } from "./imaging-study.js";
import { dicomModality } from "./imaging-study.test-support.js";

describe("ImagingStudy FHIR mapping", () => {
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
});

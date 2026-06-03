import { describe, expect, it } from "vitest";
import { DomainError } from "../shared/domain-error.js";
import { ImagingStudy } from "./imaging-study.js";
import { dicomModality } from "./imaging-study.test-support.js";

describe("ImagingStudy validation", () => {
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

  it("rejects malformed DICOM UIDs", () => {
    expect(() =>
      ImagingStudy.record({
        id: "imaging-study-bad-uid-001",
        patientId: "patient-001",
        studyInstanceUid: "1.2.826.0.01.3680043.10.543.7",
        series: [
          {
            uid: "1.2.826.0.1.3680043.10.543.7.1",
            modality: dicomModality,
            numberOfInstances: 1
          }
        ]
      })
    ).toThrow(DomainError);

    expect(() =>
      ImagingStudy.record({
        id: "imaging-study-bad-uid-002",
        patientId: "patient-001",
        studyInstanceUid: "1.2.826.0.1.3680043.10.543.8",
        series: [
          {
            uid: "1.2.826.0.1.3680043.10.543.8.",
            modality: dicomModality,
            numberOfInstances: 1
          }
        ]
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

  it("rejects counts outside FHIR unsignedInt", () => {
    expect(() =>
      ImagingStudy.record({
        id: "imaging-study-005",
        patientId: "patient-001",
        studyInstanceUid: "1.2.826.0.1.3680043.10.543.5",
        numberOfSeries: 2_147_483_648,
        series: [
          {
            uid: "1.2.826.0.1.3680043.10.543.5.1",
            modality: dicomModality,
            numberOfInstances: 1
          }
        ]
      })
    ).toThrow(DomainError);

    expect(() =>
      ImagingStudy.record({
        id: "imaging-study-006",
        patientId: "patient-001",
        studyInstanceUid: "1.2.826.0.1.3680043.10.543.6",
        series: [
          {
            uid: "1.2.826.0.1.3680043.10.543.6.1",
            number: 2_147_483_648,
            modality: dicomModality,
            numberOfInstances: 1
          }
        ]
      })
    ).toThrow(DomainError);
  });
});

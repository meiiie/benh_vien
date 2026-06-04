import { ImagingStudy } from "./imaging-study.js";
import type {
  CreateImagingStudyInput,
  ImagingStudySnapshot
} from "./imaging-study.types.js";

type CreateImagingStudyOverrides = Partial<CreateImagingStudyInput>;

export const dicomModality = {
  system: "http://dicom.nema.org/resources/ontology/DCM",
  code: "DX",
  display: "Digital Radiography"
};

export function createImagingStudySnapshot(
  overrides: CreateImagingStudyOverrides = {}
): ImagingStudySnapshot {
  return ImagingStudy.record({
    id: "imaging-study-test-fixture",
    patientId: "patient-001",
    studyInstanceUid: "1.2.826.0.1.3680043.10.543.7",
    startedAt: "2026-05-28T03:00:00.000Z",
    series: [
      {
        uid: "1.2.826.0.1.3680043.10.543.7.1",
        modality: dicomModality,
        numberOfInstances: 2,
        startedAt: "2026-05-28T03:01:00.000Z"
      }
    ],
    ...overrides
  }).toSnapshot();
}

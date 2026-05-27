import type { ImagingStudy } from "./imaging-study.js";

export interface ImagingStudyRepository {
  findByPatientId(patientId: string): Promise<ImagingStudy[]>;
  findById(id: string): Promise<ImagingStudy | undefined>;
  save(imagingStudy: ImagingStudy): Promise<void>;
}

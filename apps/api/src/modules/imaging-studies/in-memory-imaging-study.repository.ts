import { ImagingStudy } from "@benh-vien-so/domain";
import type { ImagingStudyRepository } from "@benh-vien-so/domain";

const dicomDigitalRadiography = {
  system: "http://dicom.nema.org/resources/ontology/DCM",
  code: "DX",
  display: "Digital Radiography"
};

export class InMemoryImagingStudyRepository implements ImagingStudyRepository {
  private readonly imagingStudies = new Map<string, ImagingStudy>();

  constructor(seedImagingStudies: readonly ImagingStudy[] = []) {
    for (const imagingStudy of seedImagingStudies) {
      this.imagingStudies.set(imagingStudy.id, cloneImagingStudy(imagingStudy));
    }
  }

  async findByPatientId(patientId: string): Promise<ImagingStudy[]> {
    return [...this.imagingStudies.values()]
      .filter((imagingStudy) => imagingStudy.patientId === patientId)
      .sort((left, right) => {
        const leftStartedAt = left.toSnapshot().startedAt ?? left.toSnapshot().createdAt;
        const rightStartedAt = right.toSnapshot().startedAt ?? right.toSnapshot().createdAt;
        return rightStartedAt.localeCompare(leftStartedAt);
      })
      .map(cloneImagingStudy);
  }

  async findById(id: string): Promise<ImagingStudy | undefined> {
    const imagingStudy = this.imagingStudies.get(id);
    return imagingStudy ? cloneImagingStudy(imagingStudy) : undefined;
  }

  async save(imagingStudy: ImagingStudy): Promise<void> {
    this.imagingStudies.set(imagingStudy.id, cloneImagingStudy(imagingStudy));
  }
}

export function createSeedImagingStudies(): ImagingStudy[] {
  return [
    ImagingStudy.record({
      id: "imaging-study-demo-001",
      patientId: "patient-demo-001",
      encounterId: "encounter-demo-002",
      basedOnServiceRequestId: "service-request-demo-002",
      diagnosticReportId: "diagnostic-report-demo-002",
      status: "available",
      studyInstanceUid: "1.2.826.0.1.3680043.10.543.202605270001",
      accessionNumber: "HP-CXR-20260527-0001",
      description: "Chest X-ray two views",
      startedAt: "2026-05-27T05:00:00.000Z",
      referrerPractitionerId: "practitioner-demo-001",
      interpreterPractitionerId: "practitioner-demo-001",
      endpointId: "endpoint-pacs-hai-phong-demo",
      series: [
        {
          uid: "1.2.826.0.1.3680043.10.543.202605270001.1",
          number: 1,
          modality: dicomDigitalRadiography,
          description: "PA and lateral chest radiographs",
          numberOfInstances: 2,
          bodySite: {
            system: "http://snomed.info/sct",
            code: "51185008",
            display: "Thoracic structure"
          },
          startedAt: "2026-05-27T05:02:00.000Z"
        }
      ]
    })
  ];
}

function cloneImagingStudy(imagingStudy: ImagingStudy): ImagingStudy {
  return ImagingStudy.rehydrate(imagingStudy.toSnapshot());
}

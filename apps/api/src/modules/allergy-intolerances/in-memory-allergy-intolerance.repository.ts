import { AllergyIntolerance } from "@benh-vien-so/domain";
import type { AllergyIntoleranceRepository } from "@benh-vien-so/domain";

export class InMemoryAllergyIntoleranceRepository implements AllergyIntoleranceRepository {
  private readonly allergyIntolerances = new Map<string, AllergyIntolerance>();

  constructor(seedAllergyIntolerances: readonly AllergyIntolerance[] = []) {
    for (const allergyIntolerance of seedAllergyIntolerances) {
      this.allergyIntolerances.set(allergyIntolerance.id, cloneAllergyIntolerance(allergyIntolerance));
    }
  }

  async findByPatientId(patientId: string): Promise<AllergyIntolerance[]> {
    return [...this.allergyIntolerances.values()]
      .filter((allergyIntolerance) => allergyIntolerance.patientId === patientId)
      .sort((left, right) => right.toSnapshot().recordedAt.localeCompare(left.toSnapshot().recordedAt))
      .map(cloneAllergyIntolerance);
  }

  async findById(id: string): Promise<AllergyIntolerance | undefined> {
    const allergyIntolerance = this.allergyIntolerances.get(id);
    return allergyIntolerance ? cloneAllergyIntolerance(allergyIntolerance) : undefined;
  }

  async save(allergyIntolerance: AllergyIntolerance): Promise<void> {
    this.allergyIntolerances.set(allergyIntolerance.id, cloneAllergyIntolerance(allergyIntolerance));
  }
}

export function createSeedAllergyIntolerances(): AllergyIntolerance[] {
  return [
    AllergyIntolerance.record({
      id: "allergy-intolerance-demo-001",
      patientId: "patient-demo-001",
      encounterId: "encounter-demo-001",
      type: "allergy",
      category: "medication",
      criticality: "high",
      code: {
        system: "http://snomed.info/sct",
        code: "91936005",
        display: "Allergy to penicillin"
      },
      reaction: {
        manifestation: {
          system: "http://snomed.info/sct",
          code: "271807003",
          display: "Skin rash"
        },
        severity: "moderate",
        description: "Phát ban sau khi dùng nhóm penicillin theo khai thác bệnh sử."
      },
      recordedAt: "2026-05-26T02:45:00.000Z",
      recorderPractitionerId: "practitioner-demo-002",
      note: "Cảnh báo demo phục vụ kiểm tra an toàn khi kê thuốc."
    }),
    AllergyIntolerance.record({
      id: "allergy-intolerance-demo-002",
      patientId: "patient-demo-001",
      type: "intolerance",
      category: "food",
      criticality: "low",
      code: {
        system: "http://snomed.info/sct",
        code: "300913006",
        display: "Shellfish allergy"
      },
      reaction: {
        manifestation: {
          system: "http://snomed.info/sct",
          code: "422587007",
          display: "Nausea"
        },
        severity: "mild"
      },
      recordedAt: "2026-05-27T02:20:00.000Z",
      recorderPractitionerId: "practitioner-demo-001"
    })
  ];
}

function cloneAllergyIntolerance(allergyIntolerance: AllergyIntolerance): AllergyIntolerance {
  return AllergyIntolerance.rehydrate(allergyIntolerance.toSnapshot());
}

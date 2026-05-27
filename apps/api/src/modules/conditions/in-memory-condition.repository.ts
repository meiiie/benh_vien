import { Condition } from "@benh-vien-so/domain";
import type { ConditionRepository } from "@benh-vien-so/domain";

export class InMemoryConditionRepository implements ConditionRepository {
  private readonly conditions = new Map<string, Condition>();

  constructor(seedConditions: readonly Condition[] = []) {
    for (const condition of seedConditions) {
      this.conditions.set(condition.id, cloneCondition(condition));
    }
  }

  async findByPatientId(patientId: string): Promise<Condition[]> {
    return [...this.conditions.values()]
      .filter((condition) => condition.patientId === patientId)
      .sort((left, right) => right.toSnapshot().recordedAt.localeCompare(left.toSnapshot().recordedAt))
      .map(cloneCondition);
  }

  async findById(id: string): Promise<Condition | undefined> {
    const condition = this.conditions.get(id);
    return condition ? cloneCondition(condition) : undefined;
  }

  async save(condition: Condition): Promise<void> {
    this.conditions.set(condition.id, cloneCondition(condition));
  }
}

export function createSeedConditions(): Condition[] {
  return [
    Condition.record({
      id: "condition-demo-001",
      patientId: "patient-demo-001",
      encounterId: "encounter-demo-001",
      category: "encounter-diagnosis",
      code: {
        system: "http://hl7.org/fhir/sid/icd-10",
        code: "J18.9",
        display: "Viêm phổi không đặc hiệu"
      },
      severity: "moderate",
      onsetAt: "2026-05-24T00:00:00.000Z",
      recordedAt: "2026-05-26T03:20:00.000Z",
      recorderPractitionerId: "practitioner-demo-002",
      note: "Chẩn đoán demo để minh họa Condition trong hồ sơ bệnh án điện tử."
    }),
    Condition.record({
      id: "condition-demo-002",
      patientId: "patient-demo-001",
      category: "problem-list-item",
      code: {
        system: "http://hl7.org/fhir/sid/icd-10",
        code: "I10",
        display: "Tăng huyết áp vô căn"
      },
      severity: "mild",
      onsetAt: "2025-11-01T00:00:00.000Z",
      recordedAt: "2026-05-27T03:30:00.000Z",
      recorderPractitionerId: "practitioner-demo-001"
    })
  ];
}

function cloneCondition(condition: Condition): Condition {
  return Condition.rehydrate(condition.toSnapshot());
}

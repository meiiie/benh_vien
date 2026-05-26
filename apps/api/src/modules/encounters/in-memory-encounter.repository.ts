import { Encounter } from "@benh-vien-so/domain";
import type { EncounterRepository } from "@benh-vien-so/domain";

export class InMemoryEncounterRepository implements EncounterRepository {
  private readonly encounters = new Map<string, Encounter>();

  constructor(seedEncounters: readonly Encounter[] = []) {
    for (const encounter of seedEncounters) {
      this.encounters.set(encounter.id, cloneEncounter(encounter));
    }
  }

  async findByPatientId(patientId: string): Promise<Encounter[]> {
    return [...this.encounters.values()]
      .filter((encounter) => encounter.patientId === patientId)
      .sort((left, right) => right.toSnapshot().startedAt.localeCompare(left.toSnapshot().startedAt))
      .map(cloneEncounter);
  }

  async findById(id: string): Promise<Encounter | undefined> {
    const encounter = this.encounters.get(id);
    return encounter ? cloneEncounter(encounter) : undefined;
  }

  async save(encounter: Encounter): Promise<void> {
    this.encounters.set(encounter.id, cloneEncounter(encounter));
  }
}

export function createSeedEncounters(): Encounter[] {
  const admission = Encounter.create({
    id: "encounter-demo-001",
    patientId: "patient-demo-001",
    class: "inpatient",
    serviceType: "Điều trị nội trú",
    reasonText: "Theo dõi và điều trị sau nhập viện.",
    departmentId: "department-internal-medicine",
    attendingPractitionerId: "practitioner-demo-001",
    startedAt: "2026-05-26T01:30:00.000Z",
    endedAt: "2026-05-27T02:00:00.000Z"
  });

  return [
    admission,
    Encounter.create({
      id: "encounter-demo-002",
      patientId: "patient-demo-001",
      class: "ambulatory",
      serviceType: "Tái khám ngoại trú",
      reasonText: "Đánh giá lại kết quả xét nghiệm và thuốc đang dùng.",
      departmentId: "department-outpatient",
      attendingPractitionerId: "practitioner-demo-002",
      startedAt: "2026-05-27T03:00:00.000Z"
    })
  ];
}

function cloneEncounter(encounter: Encounter): Encounter {
  return Encounter.rehydrate(encounter.toSnapshot());
}

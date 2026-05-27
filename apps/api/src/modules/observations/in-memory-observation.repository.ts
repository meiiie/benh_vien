import { Observation } from "@benh-vien-so/domain";
import type { ObservationRepository } from "@benh-vien-so/domain";

export class InMemoryObservationRepository implements ObservationRepository {
  private readonly observations = new Map<string, Observation>();

  constructor(seedObservations: readonly Observation[] = []) {
    for (const observation of seedObservations) {
      this.observations.set(observation.id, cloneObservation(observation));
    }
  }

  async findByPatientId(patientId: string): Promise<Observation[]> {
    return [...this.observations.values()]
      .filter((observation) => observation.patientId === patientId)
      .sort((left, right) => right.toSnapshot().effectiveAt.localeCompare(left.toSnapshot().effectiveAt))
      .map(cloneObservation);
  }

  async findById(id: string): Promise<Observation | undefined> {
    const observation = this.observations.get(id);
    return observation ? cloneObservation(observation) : undefined;
  }

  async save(observation: Observation): Promise<void> {
    this.observations.set(observation.id, cloneObservation(observation));
  }
}

export function createSeedObservations(): Observation[] {
  return [
    Observation.record({
      id: "observation-demo-001",
      patientId: "patient-demo-001",
      encounterId: "encounter-demo-001",
      category: "laboratory",
      code: {
        system: "http://loinc.org",
        code: "718-7",
        display: "Hemoglobin"
      },
      effectiveAt: "2026-05-26T03:00:00.000Z",
      valueQuantity: {
        value: 13.5,
        unit: "g/dL",
        system: "http://unitsofmeasure.org",
        code: "g/dL"
      },
      performerPractitionerId: "practitioner-demo-002"
    }),
    Observation.record({
      id: "observation-demo-002",
      patientId: "patient-demo-001",
      encounterId: "encounter-demo-002",
      category: "vital-signs",
      code: {
        system: "http://loinc.org",
        code: "8310-5",
        display: "Body temperature"
      },
      effectiveAt: "2026-05-27T03:15:00.000Z",
      valueQuantity: {
        value: 37.2,
        unit: "Cel",
        system: "http://unitsofmeasure.org",
        code: "Cel"
      },
      performerPractitionerId: "nurse-demo-001"
    })
  ];
}

function cloneObservation(observation: Observation): Observation {
  return Observation.rehydrate(observation.toSnapshot());
}

import { MedicationDispense } from "@benh-vien-so/domain";
import type { MedicationDispenseRepository } from "@benh-vien-so/domain";

export class InMemoryMedicationDispenseRepository
  implements MedicationDispenseRepository
{
  private readonly dispenses = new Map<string, MedicationDispense>();

  constructor(seedDispenses: readonly MedicationDispense[] = []) {
    for (const dispense of seedDispenses) {
      this.dispenses.set(dispense.id, cloneDispense(dispense));
    }
  }

  async findByPatientId(patientId: string): Promise<MedicationDispense[]> {
    return [...this.dispenses.values()]
      .filter((dispense) => dispense.patientId === patientId)
      .sort((left, right) =>
        readDispenseSortDate(right).localeCompare(readDispenseSortDate(left))
      )
      .map(cloneDispense);
  }

  async findById(id: string): Promise<MedicationDispense | undefined> {
    const dispense = this.dispenses.get(id);
    return dispense ? cloneDispense(dispense) : undefined;
  }

  async save(dispense: MedicationDispense): Promise<void> {
    this.dispenses.set(dispense.id, cloneDispense(dispense));
  }
}

export function createSeedMedicationDispenses(): MedicationDispense[] {
  return [
    MedicationDispense.record({
      id: "medication-dispense-demo-001",
      patientId: "patient-demo-001",
      encounterId: "encounter-demo-001",
      medicationRequestId: "medication-request-demo-001",
      status: "completed",
      category: "outpatient",
      medicationCode: {
        system: "http://www.whocc.no/atc",
        code: "J01CA04",
        display: "Amoxicillin"
      },
      quantity: {
        value: 15,
        unit: "viên nang",
        system: "http://unitsofmeasure.org",
        code: "{capsule}"
      },
      daysSupply: {
        value: 5,
        unit: "ngày",
        system: "http://unitsofmeasure.org",
        code: "d"
      },
      whenPrepared: "2026-05-26T04:30:00.000Z",
      whenHandedOver: "2026-05-26T04:45:00.000Z",
      dispenserPractitionerId: "nurse-demo-001",
      receiverPractitionerId: "nurse-demo-001",
      dosageInstruction: {
        text: "Uống 500 mg mỗi 8 giờ sau ăn trong 5 ngày",
        route: "Đường uống",
        doseQuantity: {
          value: 500,
          unit: "mg",
          system: "http://unitsofmeasure.org",
          code: "mg"
        },
        frequency: 1,
        period: 8,
        periodUnit: "h"
      },
      note:
        "Bản ghi demo: khoa dược đã cấp đủ liệu trình Amoxicillin theo chỉ định."
    }),
    MedicationDispense.record({
      id: "medication-dispense-demo-002",
      patientId: "patient-demo-001",
      encounterId: "encounter-demo-002",
      medicationRequestId: "medication-request-demo-002",
      status: "completed",
      category: "outpatient",
      medicationCode: {
        system: "http://www.whocc.no/atc",
        code: "C09AA05",
        display: "Ramipril"
      },
      quantity: {
        value: 30,
        unit: "viên",
        system: "http://unitsofmeasure.org",
        code: "{tablet}"
      },
      daysSupply: {
        value: 30,
        unit: "ngày",
        system: "http://unitsofmeasure.org",
        code: "d"
      },
      whenPrepared: "2026-05-27T05:30:00.000Z",
      whenHandedOver: "2026-05-27T05:45:00.000Z",
      dispenserPractitionerId: "nurse-demo-001",
      receiverPractitionerId: "nurse-demo-001",
      dosageInstruction: {
        text: "Uống 5 mg mỗi ngày vào buổi sáng",
        route: "Đường uống",
        doseQuantity: {
          value: 5,
          unit: "mg",
          system: "http://unitsofmeasure.org",
          code: "mg"
        },
        frequency: 1,
        period: 1,
        periodUnit: "d"
      }
    })
  ];
}

function cloneDispense(dispense: MedicationDispense): MedicationDispense {
  return MedicationDispense.rehydrate(dispense.toSnapshot());
}

function readDispenseSortDate(dispense: MedicationDispense): string {
  const snapshot = dispense.toSnapshot();
  return snapshot.whenHandedOver ?? snapshot.whenPrepared ?? snapshot.updatedAt;
}

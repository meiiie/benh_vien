import { MedicationAdministration } from "@benh-vien-so/domain";
import type { MedicationAdministrationRepository } from "@benh-vien-so/domain";

export class InMemoryMedicationAdministrationRepository
  implements MedicationAdministrationRepository
{
  private readonly administrations = new Map<string, MedicationAdministration>();

  constructor(seedAdministrations: readonly MedicationAdministration[] = []) {
    for (const administration of seedAdministrations) {
      this.administrations.set(administration.id, cloneAdministration(administration));
    }
  }

  async findByPatientId(patientId: string): Promise<MedicationAdministration[]> {
    return [...this.administrations.values()]
      .filter((administration) => administration.patientId === patientId)
      .sort((left, right) =>
        (right.toSnapshot().effectivePeriod.start ?? right.toSnapshot().updatedAt).localeCompare(
          left.toSnapshot().effectivePeriod.start ?? left.toSnapshot().updatedAt
        )
      )
      .map(cloneAdministration);
  }

  async findById(id: string): Promise<MedicationAdministration | undefined> {
    const administration = this.administrations.get(id);
    return administration ? cloneAdministration(administration) : undefined;
  }

  async save(administration: MedicationAdministration): Promise<void> {
    this.administrations.set(administration.id, cloneAdministration(administration));
  }
}

export function createSeedMedicationAdministrations(): MedicationAdministration[] {
  return [
    MedicationAdministration.record({
      id: "medication-administration-demo-001",
      patientId: "patient-demo-001",
      encounterId: "encounter-demo-001",
      medicationRequestId: "medication-request-demo-001",
      reasonConditionId: "condition-demo-001",
      status: "completed",
      category: "outpatient",
      medicationCode: {
        system: "http://www.whocc.no/atc",
        code: "J01CA04",
        display: "Amoxicillin"
      },
      effectivePeriod: {
        start: "2026-05-26T05:00:00.000Z"
      },
      performers: [
        {
          actorType: "Practitioner",
          actorId: "nurse-demo-001",
          function: {
            system: "urn:wiiicare:nexus:medication-admin-performer-function",
            code: "administering-nurse",
            display: "Điều dưỡng thực hiện dùng thuốc"
          }
        }
      ],
      dosage: {
        text: "Uống 500 mg sau ăn",
        route: {
          system: "http://snomed.info/sct",
          code: "26643006",
          display: "Oral route"
        },
        doseQuantity: {
          value: 500,
          unit: "mg",
          system: "http://unitsofmeasure.org",
          code: "mg"
        }
      },
      note: "Bản ghi demo: xác nhận bệnh nhân đã dùng liều Amoxicillin đầu tiên theo chỉ định."
    }),
    MedicationAdministration.record({
      id: "medication-administration-demo-002",
      patientId: "patient-demo-001",
      encounterId: "encounter-demo-002",
      medicationRequestId: "medication-request-demo-002",
      reasonConditionId: "condition-demo-002",
      status: "completed",
      category: "outpatient",
      medicationCode: {
        system: "http://www.whocc.no/atc",
        code: "C09AA05",
        display: "Ramipril"
      },
      effectivePeriod: {
        start: "2026-05-27T06:00:00.000Z"
      },
      performers: [
        {
          actorType: "Practitioner",
          actorId: "nurse-demo-001",
          function: {
            system: "urn:wiiicare:nexus:medication-admin-performer-function",
            code: "medication-counselor",
            display: "Nhân sự xác nhận dùng thuốc"
          }
        }
      ],
      dosage: {
        text: "Uống 5 mg vào buổi sáng",
        route: {
          system: "http://snomed.info/sct",
          code: "26643006",
          display: "Oral route"
        },
        doseQuantity: {
          value: 5,
          unit: "mg",
          system: "http://unitsofmeasure.org",
          code: "mg"
        }
      }
    })
  ];
}

function cloneAdministration(
  administration: MedicationAdministration
): MedicationAdministration {
  return MedicationAdministration.rehydrate(administration.toSnapshot());
}

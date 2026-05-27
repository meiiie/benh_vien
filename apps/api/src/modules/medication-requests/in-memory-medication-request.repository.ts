import { MedicationRequest } from "@benh-vien-so/domain";
import type { MedicationRequestRepository } from "@benh-vien-so/domain";

export class InMemoryMedicationRequestRepository implements MedicationRequestRepository {
  private readonly medicationRequests = new Map<string, MedicationRequest>();

  constructor(seedMedicationRequests: readonly MedicationRequest[] = []) {
    for (const medicationRequest of seedMedicationRequests) {
      this.medicationRequests.set(medicationRequest.id, cloneMedicationRequest(medicationRequest));
    }
  }

  async findByPatientId(patientId: string): Promise<MedicationRequest[]> {
    return [...this.medicationRequests.values()]
      .filter((medicationRequest) => medicationRequest.patientId === patientId)
      .sort((left, right) => right.toSnapshot().authoredOn.localeCompare(left.toSnapshot().authoredOn))
      .map(cloneMedicationRequest);
  }

  async findById(id: string): Promise<MedicationRequest | undefined> {
    const medicationRequest = this.medicationRequests.get(id);
    return medicationRequest ? cloneMedicationRequest(medicationRequest) : undefined;
  }

  async save(medicationRequest: MedicationRequest): Promise<void> {
    this.medicationRequests.set(medicationRequest.id, cloneMedicationRequest(medicationRequest));
  }
}

export function createSeedMedicationRequests(): MedicationRequest[] {
  return [
    MedicationRequest.prescribe({
      id: "medication-request-demo-001",
      patientId: "patient-demo-001",
      encounterId: "encounter-demo-001",
      reasonConditionId: "condition-demo-001",
      category: "outpatient",
      medicationCode: {
        system: "http://www.whocc.no/atc",
        code: "J01CA04",
        display: "Amoxicillin"
      },
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
      authoredOn: "2026-05-26T03:30:00.000Z",
      requesterPractitionerId: "practitioner-demo-002",
      expectedSupplyDurationDays: 5,
      note: "Chỉ định demo để minh họa MedicationRequest trong hồ sơ bệnh án điện tử."
    }),
    MedicationRequest.prescribe({
      id: "medication-request-demo-002",
      patientId: "patient-demo-001",
      encounterId: "encounter-demo-002",
      reasonConditionId: "condition-demo-002",
      category: "outpatient",
      medicationCode: {
        system: "http://www.whocc.no/atc",
        code: "C09AA05",
        display: "Ramipril"
      },
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
      },
      authoredOn: "2026-05-27T03:45:00.000Z",
      requesterPractitionerId: "practitioner-demo-001",
      expectedSupplyDurationDays: 30
    })
  ];
}

function cloneMedicationRequest(medicationRequest: MedicationRequest): MedicationRequest {
  return MedicationRequest.rehydrate(medicationRequest.toSnapshot());
}

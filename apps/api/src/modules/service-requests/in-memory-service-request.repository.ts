import { ServiceRequest } from "@benh-vien-so/domain";
import type { ServiceRequestRepository } from "@benh-vien-so/domain";

export class InMemoryServiceRequestRepository implements ServiceRequestRepository {
  private readonly serviceRequests = new Map<string, ServiceRequest>();

  constructor(seedServiceRequests: readonly ServiceRequest[] = []) {
    for (const serviceRequest of seedServiceRequests) {
      this.serviceRequests.set(serviceRequest.id, cloneServiceRequest(serviceRequest));
    }
  }

  async findByPatientId(patientId: string): Promise<ServiceRequest[]> {
    return [...this.serviceRequests.values()]
      .filter((serviceRequest) => serviceRequest.patientId === patientId)
      .sort((left, right) => right.toSnapshot().authoredOn.localeCompare(left.toSnapshot().authoredOn))
      .map(cloneServiceRequest);
  }

  async findById(id: string): Promise<ServiceRequest | undefined> {
    const serviceRequest = this.serviceRequests.get(id);
    return serviceRequest ? cloneServiceRequest(serviceRequest) : undefined;
  }

  async save(serviceRequest: ServiceRequest): Promise<void> {
    this.serviceRequests.set(serviceRequest.id, cloneServiceRequest(serviceRequest));
  }
}

export function createSeedServiceRequests(): ServiceRequest[] {
  return [
    ServiceRequest.order({
      id: "service-request-demo-001",
      patientId: "patient-demo-001",
      encounterId: "encounter-demo-001",
      reasonConditionId: "condition-demo-001",
      category: "laboratory",
      priority: "urgent",
      code: {
        system: "http://loinc.org",
        code: "58410-2",
        display: "Complete blood count panel"
      },
      occurrenceAt: "2026-05-26T04:00:00.000Z",
      authoredOn: "2026-05-26T03:40:00.000Z",
      requesterPractitionerId: "practitioner-demo-002",
      performerOrganizationId: "department-laboratory",
      patientInstruction: "Lấy mẫu máu ngoại vi theo quy trình khoa xét nghiệm.",
      note: "Chỉ định xét nghiệm demo để nối EMR với LIS."
    }),
    ServiceRequest.order({
      id: "service-request-demo-002",
      patientId: "patient-demo-001",
      encounterId: "encounter-demo-002",
      reasonConditionId: "condition-demo-002",
      category: "imaging",
      priority: "routine",
      code: {
        system: "http://snomed.info/sct",
        code: "168537006",
        display: "Chest X-ray"
      },
      occurrenceAt: "2026-05-27T04:30:00.000Z",
      authoredOn: "2026-05-27T03:50:00.000Z",
      requesterPractitionerId: "practitioner-demo-001",
      performerOrganizationId: "department-diagnostic-imaging",
      patientInstruction: "Mang theo giấy tờ tùy thân và tháo vật kim loại vùng ngực.",
      note: "Chỉ định hình ảnh demo để chuẩn bị nối PACS/Orthanc."
    })
  ];
}

function cloneServiceRequest(serviceRequest: ServiceRequest): ServiceRequest {
  return ServiceRequest.rehydrate(serviceRequest.toSnapshot());
}

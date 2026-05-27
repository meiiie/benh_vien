import { Procedure } from "@benh-vien-so/domain";
import type { ProcedureRepository } from "@benh-vien-so/domain";

export class InMemoryProcedureRepository implements ProcedureRepository {
  private readonly procedures = new Map<string, Procedure>();

  constructor(seedProcedures: readonly Procedure[] = []) {
    for (const procedure of seedProcedures) {
      this.procedures.set(procedure.id, cloneProcedure(procedure));
    }
  }

  async findByPatientId(patientId: string): Promise<Procedure[]> {
    return [...this.procedures.values()]
      .filter((procedure) => procedure.patientId === patientId)
      .sort((left, right) =>
        (right.toSnapshot().performedPeriod?.start ?? right.toSnapshot().updatedAt).localeCompare(
          left.toSnapshot().performedPeriod?.start ?? left.toSnapshot().updatedAt
        )
      )
      .map(cloneProcedure);
  }

  async findById(id: string): Promise<Procedure | undefined> {
    const procedure = this.procedures.get(id);
    return procedure ? cloneProcedure(procedure) : undefined;
  }

  async save(procedure: Procedure): Promise<void> {
    this.procedures.set(procedure.id, cloneProcedure(procedure));
  }
}

export function createSeedProcedures(): Procedure[] {
  return [
    Procedure.record({
      id: "procedure-demo-001",
      patientId: "patient-demo-001",
      encounterId: "encounter-demo-002",
      basedOnServiceRequestId: "service-request-demo-002",
      status: "completed",
      category: "diagnostic",
      code: {
        system: "http://snomed.info/sct",
        code: "168537006",
        display: "Chest X-ray"
      },
      performedPeriod: {
        start: "2026-05-27T04:30:00.000Z",
        end: "2026-05-27T05:00:00.000Z"
      },
      recorderPractitionerId: "practitioner-demo-001",
      asserterPractitionerId: "practitioner-demo-001",
      performers: [
        {
          actorType: "Practitioner",
          actorId: "practitioner-demo-001",
          function: {
            system: "urn:wiiicare:nexus:procedure-performer-function",
            code: "radiology-interpreter",
            display: "Bác sĩ chẩn đoán hình ảnh"
          },
          onBehalfOfOrganizationId: "department-diagnostic-imaging"
        }
      ],
      reasonConditionId: "condition-demo-002",
      bodySite: {
        system: "http://snomed.info/sct",
        code: "51185008",
        display: "Thoracic structure"
      },
      outcome: {
        system: "urn:wiiicare:nexus:procedure-outcome",
        code: "completed-no-acute-finding",
        display: "Hoàn tất, không ghi nhận tổn thương cấp tính"
      },
      reportReferences: [
        {
          resourceType: "DiagnosticReport",
          id: "diagnostic-report-demo-002"
        }
      ],
      note: "Bản ghi Procedure mô phỏng hành động chụp X-quang ngực đã thực hiện sau ServiceRequest và Task PACS/RIS."
    }),
    Procedure.record({
      id: "procedure-demo-002",
      patientId: "patient-demo-001",
      encounterId: "encounter-demo-002",
      status: "completed",
      category: "counseling",
      code: {
        system: "http://snomed.info/sct",
        code: "409073007",
        display: "Education"
      },
      performedPeriod: {
        start: "2026-05-27T05:45:00.000Z",
        end: "2026-05-27T05:55:00.000Z"
      },
      recorderPractitionerId: "practitioner-demo-002",
      performers: [
        {
          actorType: "Practitioner",
          actorId: "practitioner-demo-002",
          function: {
            system: "urn:wiiicare:nexus:procedure-performer-function",
            code: "patient-educator",
            display: "Nhân sự tư vấn người bệnh"
          }
        }
      ],
      reasonConditionId: "condition-demo-002",
      outcome: {
        system: "urn:wiiicare:nexus:procedure-outcome",
        code: "education-completed",
        display: "Đã tư vấn và ghi nhận người bệnh hiểu hướng dẫn"
      },
      reportReferences: [],
      note: "Bản ghi Procedure cho hoạt động tư vấn/hướng dẫn người bệnh, không thay thế chỉ định thuốc hoặc tài liệu ra viện."
    })
  ];
}

function cloneProcedure(procedure: Procedure): Procedure {
  return Procedure.rehydrate(procedure.toSnapshot());
}

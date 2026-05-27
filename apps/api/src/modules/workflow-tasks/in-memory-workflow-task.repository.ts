import { WorkflowTask } from "@benh-vien-so/domain";
import type { WorkflowTaskRepository } from "@benh-vien-so/domain";

export class InMemoryWorkflowTaskRepository implements WorkflowTaskRepository {
  private readonly tasks = new Map<string, WorkflowTask>();

  constructor(seedTasks: readonly WorkflowTask[] = []) {
    for (const task of seedTasks) {
      this.tasks.set(task.id, cloneTask(task));
    }
  }

  async findByPatientId(patientId: string): Promise<WorkflowTask[]> {
    return [...this.tasks.values()]
      .filter((task) => task.patientId === patientId)
      .sort((left, right) => right.toSnapshot().lastModified.localeCompare(left.toSnapshot().lastModified))
      .map(cloneTask);
  }

  async findById(id: string): Promise<WorkflowTask | undefined> {
    const task = this.tasks.get(id);
    return task ? cloneTask(task) : undefined;
  }

  async save(task: WorkflowTask): Promise<void> {
    this.tasks.set(task.id, cloneTask(task));
  }
}

export function createSeedWorkflowTasks(): WorkflowTask[] {
  return [
    WorkflowTask.create({
      id: "workflow-task-demo-001",
      patientId: "patient-demo-001",
      encounterId: "encounter-demo-001",
      basedOnServiceRequestId: "service-request-demo-001",
      status: "completed",
      priority: "urgent",
      code: {
        system: "urn:wiiicare:nexus:task-code",
        code: "fulfill-laboratory-order",
        display: "Thực hiện chỉ định xét nghiệm"
      },
      description: "Lấy mẫu, xử lý và phát hành kết quả công thức máu.",
      businessStatus: {
        code: "result-issued",
        display: "Kết quả đã phát hành"
      },
      requesterPractitionerId: "practitioner-demo-002",
      ownerOrganizationId: "department-laboratory",
      authoredOn: "2026-05-26T03:41:00.000Z",
      lastModified: "2026-05-26T04:45:00.000Z",
      executionPeriod: {
        start: "2026-05-26T04:00:00.000Z",
        end: "2026-05-26T04:45:00.000Z"
      },
      inputReferences: [
        {
          resourceType: "ServiceRequest",
          id: "service-request-demo-001",
          label: "Chỉ định công thức máu"
        }
      ],
      outputReferences: [
        {
          resourceType: "Observation",
          id: "observation-demo-001",
          label: "Hemoglobin"
        },
        {
          resourceType: "DiagnosticReport",
          id: "diagnostic-report-demo-001",
          label: "Báo cáo công thức máu"
        }
      ],
      note: "Task mô phỏng hàng đợi LIS: chỉ định đã có kết quả và được gom vào DiagnosticReport."
    }),
    WorkflowTask.create({
      id: "workflow-task-demo-002",
      patientId: "patient-demo-001",
      encounterId: "encounter-demo-002",
      basedOnServiceRequestId: "service-request-demo-002",
      status: "completed",
      priority: "routine",
      code: {
        system: "urn:wiiicare:nexus:task-code",
        code: "fulfill-imaging-order",
        display: "Thực hiện chỉ định chẩn đoán hình ảnh"
      },
      description: "Tiếp nhận chỉ định, chụp X-quang ngực, gắn metadata DICOM và phát hành báo cáo.",
      businessStatus: {
        code: "image-and-report-available",
        display: "Ảnh và báo cáo đã sẵn sàng"
      },
      requesterPractitionerId: "practitioner-demo-001",
      ownerOrganizationId: "department-diagnostic-imaging",
      authoredOn: "2026-05-27T03:51:00.000Z",
      lastModified: "2026-05-27T05:35:00.000Z",
      executionPeriod: {
        start: "2026-05-27T04:30:00.000Z",
        end: "2026-05-27T05:35:00.000Z"
      },
      inputReferences: [
        {
          resourceType: "ServiceRequest",
          id: "service-request-demo-002",
          label: "Chỉ định X-quang ngực"
        }
      ],
      outputReferences: [
        {
          resourceType: "ImagingStudy",
          id: "imaging-study-demo-001",
          label: "Metadata DICOM X-quang ngực"
        },
        {
          resourceType: "DiagnosticReport",
          id: "diagnostic-report-demo-002",
          label: "Báo cáo X-quang ngực"
        }
      ],
      note: "Task mô phỏng luồng PACS/RIS: ảnh lưu ở PACS, báo cáo quay về EMR."
    })
  ];
}

function cloneTask(task: WorkflowTask): WorkflowTask {
  return WorkflowTask.rehydrate(task.toSnapshot());
}

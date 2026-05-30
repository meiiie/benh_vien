import { Info } from "../../components/AppShell.js";
import {
  formatDateTime,
  formatServiceRequestPriority,
  formatWorkflowTaskReferences,
  formatWorkflowTaskStatus
} from "../../lib/clinicalFormatters.js";
import type { WorkflowTask } from "../../types/clinical.js";

type WorkflowTaskPanelProps = {
  readonly isLoading: boolean;
  readonly selectedWorkflowTask?: WorkflowTask;
  readonly selectedWorkflowTaskId?: string;
  readonly workflowTasks: readonly WorkflowTask[];
  readonly onSelectWorkflowTask: (taskId: string) => void;
};

export function WorkflowTaskPanel({
  isLoading,
  selectedWorkflowTask,
  selectedWorkflowTaskId,
  workflowTasks,
  onSelectWorkflowTask
}: WorkflowTaskPanelProps) {
  return (
    <article className="panel service-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Task queue</p>
          <h2>Luồng công việc thực thi y lệnh</h2>
        </div>
        <span className="pill cyan">
          {isLoading ? "đang tải" : `${workflowTasks.length} công việc`}
        </span>
      </div>

      <div className="document-layout">
        <div className="service-cards">
          {workflowTasks.map((task) => (
            <button
              className={task.id === selectedWorkflowTaskId ? "service-card selected" : "service-card"}
              key={task.id}
              type="button"
              onClick={() => onSelectWorkflowTask(task.id)}
            >
              <span>{formatWorkflowTaskStatus(task.status)}</span>
              <strong>{task.code.display}</strong>
              <small>
                {formatServiceRequestPriority(task.priority)} · {formatDateTime(task.lastModified)}
              </small>
            </button>
          ))}
          {workflowTasks.length === 0 ? (
            <p className="empty-state">
              Chưa có Task cho bệnh nhân này. Task dùng để theo dõi y lệnh đang ở hàng đợi LIS/PACS, ai phụ trách và kết quả nào đã quay về EMR.
            </p>
          ) : null}
        </div>

        <div className="service-summary">
          {selectedWorkflowTask ? (
            <>
              <div className="document-meta">
                <Info label="Công việc" value={selectedWorkflowTask.code.display} />
                <Info label="Trạng thái FHIR" value={formatWorkflowTaskStatus(selectedWorkflowTask.status)} />
                <Info label="Trạng thái nghiệp vụ" value={selectedWorkflowTask.businessStatus?.display ?? "Chưa gắn"} />
                <Info label="Y lệnh gốc" value={selectedWorkflowTask.basedOnServiceRequestId ?? "Chưa gắn"} />
                <Info label="Khoa/phòng phụ trách" value={selectedWorkflowTask.ownerOrganizationId ?? "Chưa gắn"} />
                <Info label="Người phụ trách" value={selectedWorkflowTask.ownerPractitionerId ?? "Chưa gắn"} />
                <Info label="Tạo lúc" value={formatDateTime(selectedWorkflowTask.authoredOn)} />
                <Info label="Cập nhật" value={formatDateTime(selectedWorkflowTask.lastModified)} />
                <Info
                  label="Bắt đầu"
                  value={
                    selectedWorkflowTask.executionPeriod?.start
                      ? formatDateTime(selectedWorkflowTask.executionPeriod.start)
                      : "Chưa gắn"
                  }
                />
                <Info
                  label="Kết thúc"
                  value={
                    selectedWorkflowTask.executionPeriod?.end
                      ? formatDateTime(selectedWorkflowTask.executionPeriod.end)
                      : "Chưa gắn"
                  }
                />
              </div>
              <div className="reference-list compact-list">
                <div>
                  <strong>Input</strong>
                  <span>{formatWorkflowTaskReferences(selectedWorkflowTask.inputReferences)}</span>
                </div>
                <div>
                  <strong>Output</strong>
                  <span>{formatWorkflowTaskReferences(selectedWorkflowTask.outputReferences)}</span>
                </div>
              </div>
              <p className="empty-state">
                FHIR Task không thay thế ServiceRequest; nó theo dõi việc thực thi ServiceRequest qua từng hàng đợi, chủ sở hữu, thời gian xử lý và kết quả đầu ra.
              </p>
            </>
          ) : (
            <p className="empty-state">Chọn một công việc để xem siêu dữ liệu và xuất FHIR Task.</p>
          )}
        </div>
      </div>
    </article>
  );
}

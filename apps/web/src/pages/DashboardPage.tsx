import { Info, MetricCard, PageHeader } from "../components/AppShell.js";
import { formatDateTime } from "../lib/clinicalFormatters.js";
import type { AppRoute } from "../types/appRuntime.js";
import type { Patient } from "../types/patientRegistry.js";
import type { DashboardMetrics } from "../application/dashboardMetrics.js";

type DashboardPageProps = {
  readonly latestEncounterServiceType?: string;
  readonly metrics: DashboardMetrics;
  readonly onNavigate: (route: AppRoute) => void;
  readonly selectedPatient?: Patient;
};

export function DashboardPage({
  latestEncounterServiceType,
  metrics,
  onNavigate,
  selectedPatient
}: DashboardPageProps) {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Bảng điều phối"
        title="Tổng quan vận hành bệnh án điện tử"
        description="Màn hình dành cho đầu ca làm việc: xem nhanh hồ sơ, lượt khám mở, tài liệu chờ ký và trạng thái liên thông."
      />

      <section className="dashboard-brief" aria-label="Phạm vi theo dõi của dashboard">
        <article>
          <span>EMR lõi: </span>
          <p>Hồ sơ bệnh nhân, lượt khám, chỉ định, kết quả, hình ảnh và thuốc.</p>
        </article>
        <article>
          <span>Liên thông: </span>
          <p>Provider Directory, Consent, FHIR Bundle và gói chuyển hồ sơ liên viện.</p>
        </article>
        <article>
          <span>Kiểm soát: </span>
          <p>RBAC/ABAC, audit trail và dữ liệu demo không dùng bệnh án thật.</p>
        </article>
      </section>

      <section className="metric-grid">
        <MetricCard label="Bệnh nhân" value={`${metrics.patients}`} note="Hồ sơ trong registry demo" />
        <MetricCard
          label="Danh bạ cơ sở"
          value={`${metrics.providerOrganizations}/${metrics.providerEndpoints}`}
          note="Provider Directory: cơ sở y tế / endpoint"
        />
        <MetricCard label="Lượt khám mở" value={`${metrics.openEncounters}`} note="Theo bệnh nhân đang chọn" />
        <MetricCard label="Dị ứng" value={`${metrics.allergyIntolerances}`} note="Cảnh báo an toàn" />
        <MetricCard label="Chẩn đoán" value={`${metrics.conditions}`} note="Vấn đề sức khỏe có cấu trúc" />
        <MetricCard label="Chỉ định dịch vụ" value={`${metrics.serviceRequests}`} note="FHIR ServiceRequest" />
        <MetricCard label="Công việc" value={`${metrics.workflowTasks}`} note="FHIR Task" />
        <MetricCard label="Thủ thuật" value={`${metrics.procedures}`} note="FHIR Procedure" />
        <MetricCard label="Kết quả" value={`${metrics.diagnosticReports}`} note="FHIR DiagnosticReport" />
        <MetricCard label="Ảnh y khoa" value={`${metrics.imagingStudies}`} note="FHIR ImagingStudy" />
        <MetricCard label="Chỉ định thuốc" value={`${metrics.medicationRequests}`} note="FHIR MedicationRequest" />
        <MetricCard label="Cấp phát thuốc" value={`${metrics.medicationDispenses}`} note="FHIR MedicationDispense" />
        <MetricCard label="Dùng thuốc" value={`${metrics.medicationAdministrations}`} note="FHIR MedicationAdministration" />
        <MetricCard label="Chuyển hồ sơ" value={`${metrics.recordTransfers}`} note="FHIR Task liên viện" />
        <MetricCard label="Tài liệu nháp" value={`${metrics.draftDocuments}`} note="Cần ký/xác thực" />
      </section>

      <section className="dashboard-grid">
        <article className="panel command-panel">
          <div>
            <p className="eyebrow">Hàng đợi hôm nay</p>
            <h2>Việc nên xử lý tiếp</h2>
          </div>
          <div className="queue-list">
            <button type="button" onClick={() => onNavigate("workspace")}>
              <strong>Mở không gian hồ sơ bệnh nhân</strong>
              <span>Xem hồ sơ, lượt khám và tài liệu đang gắn với bệnh nhân.</span>
            </button>
            <button type="button" onClick={() => onNavigate("documents")}>
              <strong>Kiểm tra tài liệu chờ ký</strong>
              <span>{metrics.draftDocuments} tài liệu đang ở trạng thái nháp.</span>
            </button>
            <button type="button" onClick={() => onNavigate("interop")}>
              <strong>Xem bản xem trước FHIR</strong>
              <span>Patient, Encounter, AllergyIntolerance, Condition, ServiceRequest, Task, Procedure, Observation, DiagnosticReport, ImagingStudy, MedicationRequest, MedicationDispense, MedicationAdministration, DocumentReference, Provenance và gói chuyển hồ sơ đã có preview.</span>
            </button>
          </div>
        </article>

        <article className="panel">
          <p className="eyebrow">Hồ sơ đang chọn</p>
          <h2>{selectedPatient?.fullName ?? "Chưa chọn bệnh nhân"}</h2>
          {selectedPatient ? (
            <div className="detail-grid compact">
              <Info label="MRN" value={selectedPatient.identifiers[0]?.value ?? selectedPatient.id} />
              <Info label="Lượt khám gần nhất" value={latestEncounterServiceType ?? "Chưa có"} />
              <Info label="Dị ứng/cảnh báo" value={`${metrics.allergyIntolerances}`} />
              <Info label="Chẩn đoán/vấn đề" value={`${metrics.conditions}`} />
              <Info label="Chỉ định dịch vụ" value={`${metrics.serviceRequests}`} />
              <Info label="Công việc thực thi" value={`${metrics.workflowTasks}`} />
              <Info label="Thủ thuật/hoạt động" value={`${metrics.procedures}`} />
              <Info label="Chỉ số lâm sàng" value={`${metrics.observations}`} />
              <Info label="Báo cáo kết quả" value={`${metrics.diagnosticReports}`} />
              <Info label="Nghiên cứu hình ảnh" value={`${metrics.imagingStudies}`} />
              <Info label="Chỉ định thuốc" value={`${metrics.medicationRequests}`} />
              <Info label="Cấp phát thuốc" value={`${metrics.medicationDispenses}`} />
              <Info label="Dùng thuốc thực tế" value={`${metrics.medicationAdministrations}`} />
              <Info label="Gói chuyển hồ sơ" value={`${metrics.recordTransfers}`} />
              <Info label="Tài liệu" value={`${metrics.clinicalDocuments}`} />
              <Info label="Cập nhật" value={formatDateTime(selectedPatient.updatedAt)} />
            </div>
          ) : (
            <p className="empty-state">Chưa có dữ liệu bệnh nhân để hiển thị.</p>
          )}
        </article>
      </section>
    </div>
  );
}

import { FhirPanel } from "../../components/AppShell.js";
import type { AuditEvent, AuditIntegrityReport } from "../../types/audit.js";
import { PatientAuditActions } from "./PatientAuditActions.js";
import { PatientAuditEventList } from "./PatientAuditEventList.js";
import { PatientAuditIntegrityCard } from "./PatientAuditIntegrityCard.js";

type PatientAuditPanelProps = {
  readonly auditEvents: readonly AuditEvent[];
  readonly auditFhirBundlePreview: unknown;
  readonly auditIntegrityReport?: AuditIntegrityReport;
  readonly canReadAudit: boolean;
  readonly hasSelectedPatient: boolean;
  readonly isExportingAuditFhir: boolean;
  readonly isLoadingAuditEvents: boolean;
  readonly isVerifyingAuditIntegrity: boolean;
  readonly onExportAuditFhir: () => void;
  readonly onLoadAuditEvents: () => void;
  readonly onVerifyAuditIntegrity: () => void;
};

export function PatientAuditPanel({
  auditEvents,
  auditFhirBundlePreview,
  auditIntegrityReport,
  canReadAudit,
  hasSelectedPatient,
  isExportingAuditFhir,
  isLoadingAuditEvents,
  isVerifyingAuditIntegrity,
  onExportAuditFhir,
  onLoadAuditEvents,
  onVerifyAuditIntegrity
}: PatientAuditPanelProps) {
  return (
    <>
      <article className="panel audit-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Dấu vết theo bệnh nhân</p>
            <h2>Nhật ký kiểm toán</h2>
            <p className="panel-note">
              Theo dõi các sự kiện gắn trực tiếp với hồ sơ đang chọn: ai truy
              cập, vì mục đích gì, tác động lên tài nguyên nào và log đã được
              niêm phong hay chưa.
            </p>
          </div>
          <PatientAuditActions
            canReadAudit={canReadAudit}
            hasSelectedPatient={hasSelectedPatient}
            isExportingAuditFhir={isExportingAuditFhir}
            isLoadingAuditEvents={isLoadingAuditEvents}
            isVerifyingAuditIntegrity={isVerifyingAuditIntegrity}
            onExportAuditFhir={onExportAuditFhir}
            onLoadAuditEvents={onLoadAuditEvents}
            onVerifyAuditIntegrity={onVerifyAuditIntegrity}
          />
        </div>

        <PatientAuditIntegrityCard auditIntegrityReport={auditIntegrityReport} />
        <PatientAuditEventList
          auditEvents={auditEvents}
          canReadAudit={canReadAudit}
        />
      </article>
      <FhirPanel
        title="Gói nhật ký kiểm toán dưới dạng FHIR AuditEvent Bundle"
        badge="AuditEvent"
        value={auditFhirBundlePreview}
      />
    </>
  );
}

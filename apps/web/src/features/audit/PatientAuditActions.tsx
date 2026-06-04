type PatientAuditActionsProps = {
  readonly canReadAudit: boolean;
  readonly hasSelectedPatient: boolean;
  readonly isExportingAuditFhir: boolean;
  readonly isLoadingAuditEvents: boolean;
  readonly isVerifyingAuditIntegrity: boolean;
  readonly onExportAuditFhir: () => void;
  readonly onLoadAuditEvents: () => void;
  readonly onVerifyAuditIntegrity: () => void;
};

export function PatientAuditActions({
  canReadAudit,
  hasSelectedPatient,
  isExportingAuditFhir,
  isLoadingAuditEvents,
  isVerifyingAuditIntegrity,
  onExportAuditFhir,
  onLoadAuditEvents,
  onVerifyAuditIntegrity
}: PatientAuditActionsProps) {
  return (
    <div className="panel-actions">
      <button
        className="ghost-button"
        type="button"
        disabled={!hasSelectedPatient || isLoadingAuditEvents || !canReadAudit}
        onClick={onLoadAuditEvents}
      >
        {isLoadingAuditEvents
          ? "Đang tải..."
          : canReadAudit
            ? "Tải nhật ký"
            : "Cần quyền kiểm toán"}
      </button>
      <button
        className="ghost-button"
        type="button"
        disabled={!hasSelectedPatient || isVerifyingAuditIntegrity || !canReadAudit}
        onClick={onVerifyAuditIntegrity}
      >
        {isVerifyingAuditIntegrity ? "Đang xác minh..." : "Kiểm tra toàn vẹn"}
      </button>
      <button
        className="ghost-button"
        type="button"
        disabled={!hasSelectedPatient || isExportingAuditFhir || !canReadAudit}
        onClick={onExportAuditFhir}
      >
        {isExportingAuditFhir ? "Đang xuất..." : "Xuất FHIR AuditEvent Bundle"}
      </button>
    </div>
  );
}

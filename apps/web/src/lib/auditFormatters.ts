type AuditMetadataEvent = {
  readonly metadata: Record<string, unknown>;
  readonly purposeOfUse?: string;
};

const auditActionLabels: Record<string, string> = {
  "patient.merge": "Merge hồ sơ bệnh nhân",
  "patient.identifier-conflict": "Chặn trùng định danh bệnh nhân",
  "auth.login.success": "Đăng nhập thành công",
  "auth.login.failure": "Đăng nhập thất bại",
  "access.denied": "Truy cập bị chặn",
  "patient.list": "Tải danh sách bệnh nhân",
  "patient.create": "Tạo hồ sơ bệnh nhân",
  "patient.read": "Xem hồ sơ bệnh nhân",
  "patient.fhir-export": "Xuất FHIR Patient",
  "patient.fhir-bundle-export": "Xuất FHIR Bundle hồ sơ",
  "patient.fhir-document-bundle-export": "Xuất FHIR document Bundle hồ sơ",
  "provider-directory.read": "Xem Provider Directory",
  "provider-directory.fhir-export": "Xuất FHIR Provider Directory",
  "record-transfer.list": "Tải gói chuyển hồ sơ",
  "record-transfer.create": "Tạo gói chuyển hồ sơ",
  "record-transfer.read": "Xem gói chuyển hồ sơ",
  "record-transfer.send": "Gửi gói chuyển hồ sơ",
  "record-transfer.fail": "Ghi nhận lỗi chuyển hồ sơ",
  "record-transfer.retry": "Thử gửi lại gói chuyển hồ sơ",
  "record-transfer.dead-letter": "Đưa gói chuyển hồ sơ vào hàng lỗi cuối",
  "record-transfer.receive": "Xác nhận nhận gói chuyển hồ sơ",
  "record-transfer.acknowledgement-callback": "Callback xác nhận nhận gói chuyển hồ sơ",
  "record-transfer.fhir-export": "Xuất FHIR Task chuyển hồ sơ",
  "encounter.list": "Tải danh sách lượt khám",
  "encounter.create": "Mở lượt khám",
  "encounter.read": "Xem lượt khám",
  "encounter.finish": "Kết thúc lượt khám",
  "encounter.fhir-export": "Xuất FHIR Encounter",
  "allergy-intolerance.list": "Tải dị ứng/cảnh báo",
  "allergy-intolerance.create": "Ghi nhận dị ứng/cảnh báo",
  "allergy-intolerance.read": "Xem dị ứng/cảnh báo",
  "allergy-intolerance.fhir-export": "Xuất FHIR AllergyIntolerance",
  "condition.list": "Tải chẩn đoán/vấn đề sức khỏe",
  "condition.create": "Ghi nhận chẩn đoán/vấn đề sức khỏe",
  "condition.read": "Xem chẩn đoán/vấn đề sức khỏe",
  "condition.fhir-export": "Xuất FHIR Condition",
  "medication-request.list": "Tải chỉ định thuốc",
  "medication-request.create": "Ghi nhận chỉ định thuốc",
  "medication-request.read": "Xem chỉ định thuốc",
  "medication-request.fhir-export": "Xuất FHIR MedicationRequest",
  "medication-dispense.list": "Tải cấp phát thuốc",
  "medication-dispense.create": "Ghi nhận cấp phát thuốc",
  "medication-dispense.read": "Xem cấp phát thuốc",
  "medication-dispense.fhir-export": "Xuất FHIR MedicationDispense",
  "medication-administration.list": "Tải lần dùng thuốc",
  "medication-administration.create": "Ghi nhận dùng thuốc thực tế",
  "medication-administration.read": "Xem lần dùng thuốc",
  "medication-administration.fhir-export": "Xuất FHIR MedicationAdministration",
  "observation.list": "Tải chỉ số lâm sàng",
  "observation.create": "Ghi nhận chỉ số lâm sàng",
  "observation.read": "Xem chỉ số lâm sàng",
  "observation.fhir-export": "Xuất FHIR Observation",
  "service-request.list": "Tải chỉ định dịch vụ",
  "service-request.create": "Tạo chỉ định dịch vụ",
  "service-request.read": "Xem chỉ định dịch vụ",
  "service-request.fhir-export": "Xuất FHIR ServiceRequest",
  "workflow-task.list": "Tải hàng đợi công việc",
  "workflow-task.create": "Tạo công việc thực thi",
  "workflow-task.read": "Xem công việc thực thi",
  "workflow-task.fhir-export": "Xuất FHIR Task",
  "procedure.list": "Tải thủ thuật/hoạt động",
  "procedure.create": "Ghi nhận thủ thuật/hoạt động",
  "procedure.read": "Xem thủ thuật/hoạt động",
  "procedure.fhir-export": "Xuất FHIR Procedure",
  "diagnostic-report.list": "Tải báo cáo kết quả",
  "diagnostic-report.create": "Tạo báo cáo kết quả",
  "diagnostic-report.read": "Xem báo cáo kết quả",
  "diagnostic-report.fhir-export": "Xuất FHIR DiagnosticReport",
  "imaging-study.list": "Tải nghiên cứu hình ảnh",
  "imaging-study.create": "Tạo nghiên cứu hình ảnh",
  "imaging-study.read": "Xem nghiên cứu hình ảnh",
  "imaging-study.fhir-export": "Xuất FHIR ImagingStudy",
  "clinical-document.list": "Tải tài liệu bệnh án",
  "clinical-document.create": "Tạo tài liệu bệnh án",
  "clinical-document.sign": "Ký tài liệu bệnh án",
  "clinical-document.fhir-export": "Xuất FHIR DocumentReference",
  "clinical-document.provenance-export": "Xuất FHIR Provenance tài liệu",
  "consent.list": "Tải đồng ý chia sẻ hồ sơ",
  "consent.create": "Tạo đồng ý chia sẻ hồ sơ",
  "consent.revoke": "Thu hồi đồng ý chia sẻ hồ sơ",
  "consent.fhir-export": "Xuất FHIR Consent",
  "audit-event.list": "Xem nhật ký kiểm toán",
  "audit-event.fhir-export": "Xuất FHIR AuditEvent",
  "audit-event.integrity-verify": "Kiểm tra toàn vẹn audit"
};

const auditReasonLabels: Record<string, string> = {
  AUTH_RATE_LIMITED: "Vượt giới hạn đăng nhập",
  DEMO_AUTH_DISABLED: "Đăng nhập demo bị tắt",
  FORBIDDEN: "Không đủ quyền",
  INVALID_CREDENTIALS: "Sai thông tin đăng nhập",
  PATIENT_ACCESS_DENIED: "Ngoài phạm vi hồ sơ",
  ROLE_MISMATCH: "Sai vai trò đăng nhập",
  VALIDATION_ERROR: "Dữ liệu không hợp lệ"
};

const auditIntegrityStatusLabels: Record<string, string> = {
  broken: "Phát hiện sai lệch",
  unsealed: "Có bản ghi chưa niêm phong",
  verified: "Đã xác minh"
};

const auditIntegrityReasonLabels: Record<string, string> = {
  EVENT_NOT_SEALED: "bản ghi chưa có chuỗi băm",
  INTEGRITY_HASH_MISMATCH: "hash chuỗi không khớp",
  PAYLOAD_HASH_MISMATCH: "nội dung audit đã thay đổi",
  PREVIOUS_HASH_MISMATCH: "liên kết với bản ghi trước không khớp"
};

const auditResourceTypeLabels: Record<string, string> = {
  Patient: "Bệnh nhân",
  ProviderDirectory: "Danh bạ cơ sở y tế",
  RecordTransfer: "Gói chuyển hồ sơ",
  Encounter: "Lượt khám",
  AllergyIntolerance: "Dị ứng/cảnh báo",
  Condition: "Chẩn đoán",
  MedicationRequest: "Chỉ định thuốc",
  MedicationDispense: "Cấp phát thuốc",
  MedicationAdministration: "Dùng thuốc thực tế",
  Observation: "Chỉ số lâm sàng",
  ServiceRequest: "Chỉ định dịch vụ",
  Task: "Công việc thực thi",
  Procedure: "Thủ thuật/hoạt động",
  DiagnosticReport: "Báo cáo kết quả",
  ImagingStudy: "Nghiên cứu hình ảnh",
  ClinicalDocument: "Tài liệu",
  Consent: "Consent",
  AuditEvent: "Audit"
};

export function formatAuditAction(action: string): string {
  return auditActionLabels[action] ?? action;
}

export function formatAuditMetadataSummary(event: AuditMetadataEvent): string {
  const reason = event.metadata.reason;
  const denialCode = event.metadata.denialCode;
  const deniedPermission = event.metadata.deniedPermission;
  const actorRole = event.metadata.actorRole ?? event.metadata.deniedActorRole;

  if (typeof reason === "string") {
    return [
      formatAuditReason(reason),
      typeof event.metadata.requestedRole === "string"
        ? `vai trò yêu cầu: ${event.metadata.requestedRole}`
        : undefined
    ]
      .filter(Boolean)
      .join(" · ");
  }

  if (typeof denialCode === "string") {
    return [
      formatAuditReason(denialCode),
      typeof deniedPermission === "string" ? deniedPermission : undefined
    ]
      .filter(Boolean)
      .join(" · ");
  }

  if (typeof actorRole === "string") {
    return `Vai trò: ${actorRole}`;
  }

  return event.purposeOfUse ?? "Đã ghi nhận";
}

export function formatAuditReason(reason: string): string {
  return auditReasonLabels[reason] ?? reason;
}

export function formatAuditIntegrityStatus(status: string): string {
  return auditIntegrityStatusLabels[status] ?? status;
}

export function formatAuditIntegrityReason(reason: string | undefined): string {
  return reason ? auditIntegrityReasonLabels[reason] ?? reason : "chưa rõ nguyên nhân";
}

export function formatAuditResourceType(resourceType: string): string {
  return auditResourceTypeLabels[resourceType] ?? resourceType;
}

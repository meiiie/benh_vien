type LabeledValue = string;

type QuantityLike = {
  readonly value: number;
  readonly unit: string;
};

type WorkflowTaskReferenceLike = {
  readonly id: string;
  readonly resourceType: string;
  readonly label?: string;
};

type ProcedurePerformerLike = {
  readonly actorType: string;
  readonly actorId: string;
  readonly function?: {
    readonly display: string;
  };
  readonly onBehalfOfOrganizationId?: string;
};

type ProcedureReportReferenceLike = {
  readonly id: string;
  readonly resourceType: string;
};

type ObservationLike = {
  readonly valueQuantity?: QuantityLike;
  readonly valueText?: string;
};

function labelOf<T extends string>(
  labels: Readonly<Record<T, string>>,
  value: LabeledValue
): string {
  return labels[value as T] ?? value;
}

export function formatRuntimeFlag(
  value: boolean | null | undefined,
  trueLabel: string,
  falseLabel: string
): string {
  if (value === true) {
    return trueLabel;
  }

  if (value === false) {
    return falseLabel;
  }

  return "Chỉ dành cho vận hành";
}

export function formatGender(gender: string): string {
  return labelOf(
    {
      male: "Nam",
      female: "Nữ",
      other: "Khác",
      unknown: "Chưa rõ"
    },
    gender
  );
}

export function formatPatientRecordStatus(status: string): string {
  return labelOf(
    {
      active: "Đang hoạt động",
      inactive: "Ngừng hoạt động",
      merged: "Đã merge"
    },
    status
  );
}

export function normalizeSearchText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

export function formatIdentifierType(type: string): string {
  return labelOf(
    {
      "national-id": "Định danh cá nhân",
      "insurance-id": "BHYT",
      "hospital-mrn": "MRN",
      "legacy-id": "Mã cũ"
    },
    type
  );
}

export function formatEncounterClass(value: string): string {
  return labelOf(
    {
      ambulatory: "Ngoại trú",
      inpatient: "Nội trú",
      emergency: "Cấp cứu",
      virtual: "Khám từ xa"
    },
    value
  );
}

export function formatEncounterStatus(status: string): string {
  return labelOf(
    {
      planned: "Đã hẹn",
      "in-progress": "Đang mở",
      finished: "Đã kết thúc",
      cancelled: "Đã hủy",
      "entered-in-error": "Nhập lỗi"
    },
    status
  );
}

export function formatDocumentType(type: string): string {
  return labelOf(
    {
      "admission-note": "Phiếu nhập viện",
      "discharge-summary": "Tóm tắt ra viện",
      "lab-report": "Kết quả xét nghiệm",
      "imaging-report": "Kết quả chẩn đoán hình ảnh",
      "referral-letter": "Giấy chuyển tuyến",
      "consent-form": "Phiếu đồng ý điều trị",
      "advance-directive": "Chỉ dẫn chăm sóc trước",
      ccda: "CCDA",
      ccr: "CCR",
      "medical-record": "Hồ sơ bệnh án",
      "patient-information": "Thông tin bệnh nhân"
    },
    type
  );
}

export function formatDocumentStatus(status: string): string {
  return labelOf(
    {
      draft: "Bản nháp",
      signed: "Đã ký",
      superseded: "Đã thay thế",
      "entered-in-error": "Nhập lỗi"
    },
    status
  );
}

export function formatProviderEndpointConnectionType(type: string): string {
  return labelOf(
    {
      "dicom-wado-rs": "DICOMweb/WADO-RS",
      "direct-project": "Direct Project",
      "hl7-fhir-rest": "HL7 FHIR REST",
      "hl7v2-mllp": "HL7 v2 MLLP",
      "ihe-xds": "IHE XDS",
      other: "Khác"
    },
    type
  );
}

export function formatConsentStatus(status: string): string {
  return labelOf(
    {
      active: "Đang hiệu lực",
      revoked: "Đã thu hồi",
      expired: "Hết hiệu lực"
    },
    status
  );
}

export function formatConsentCategory(category: string): string {
  return labelOf(
    {
      "record-sharing": "Chia sẻ hồ sơ"
    },
    category
  );
}

export function formatAllergyType(type: string): string {
  return labelOf(
    {
      allergy: "Dị ứng",
      intolerance: "Không dung nạp"
    },
    type
  );
}

export function formatAllergyCategory(category: string): string {
  return labelOf(
    {
      biologic: "Sinh phẩm",
      environment: "Môi trường",
      food: "Thực phẩm",
      medication: "Thuốc"
    },
    category
  );
}

export function formatAllergyCriticality(criticality: string | undefined): string {
  if (!criticality) {
    return "Chưa đánh giá";
  }

  return labelOf(
    {
      high: "Nguy cơ cao",
      low: "Nguy cơ thấp",
      "unable-to-assess": "Chưa thể đánh giá"
    },
    criticality
  );
}

export function formatAllergyClinicalStatus(status: string): string {
  return labelOf(
    {
      active: "Đang hoạt động",
      inactive: "Không hoạt động",
      resolved: "Đã giải quyết"
    },
    status
  );
}

export function formatAllergyVerificationStatus(status: string): string {
  return labelOf(
    {
      confirmed: "Đã xác nhận",
      "entered-in-error": "Nhập lỗi",
      refuted: "Đã loại trừ",
      unconfirmed: "Chưa xác nhận"
    },
    status
  );
}

export function formatConditionCategory(category: string): string {
  return labelOf(
    {
      "encounter-diagnosis": "Chẩn đoán theo lượt khám",
      "problem-list-item": "Vấn đề sức khỏe dài hạn"
    },
    category
  );
}

export function formatConditionClinicalStatus(status: string): string {
  return labelOf(
    {
      active: "Đang hoạt động",
      inactive: "Không hoạt động",
      recurrence: "Tái phát",
      relapse: "Diễn tiến lại",
      remission: "Thuyên giảm",
      resolved: "Đã giải quyết"
    },
    status
  );
}

export function formatConditionVerificationStatus(status: string): string {
  return labelOf(
    {
      confirmed: "Đã xác nhận",
      differential: "Chẩn đoán phân biệt",
      "entered-in-error": "Nhập lỗi",
      provisional: "Tạm thời",
      refuted: "Đã loại trừ",
      unconfirmed: "Chưa xác nhận"
    },
    status
  );
}

export function formatConditionSeverity(severity: string): string {
  return labelOf(
    {
      mild: "Nhẹ",
      moderate: "Trung bình",
      severe: "Nặng"
    },
    severity
  );
}

export function formatServiceRequestCategory(category: string): string {
  return labelOf(
    {
      consultation: "Hội chẩn/tư vấn",
      imaging: "Chẩn đoán hình ảnh",
      laboratory: "Xét nghiệm",
      procedure: "Thủ thuật",
      therapy: "Điều trị/phục hồi"
    },
    category
  );
}

export function formatServiceRequestStatus(status: string): string {
  return labelOf(
    {
      active: "Đang hiệu lực",
      completed: "Đã hoàn tất",
      draft: "Bản nháp",
      "entered-in-error": "Nhập lỗi",
      "on-hold": "Tạm giữ",
      revoked: "Đã hủy",
      unknown: "Chưa rõ"
    },
    status
  );
}

export function formatServiceRequestIntent(intent: string): string {
  return labelOf(
    {
      directive: "Chỉ thị",
      "filler-order": "Lệnh thực hiện",
      "instance-order": "Lệnh dùng cụ thể",
      option: "Tùy chọn",
      order: "Chỉ định",
      "original-order": "Chỉ định gốc",
      plan: "Kế hoạch",
      proposal: "Đề xuất",
      "reflex-order": "Chỉ định phản xạ"
    },
    intent
  );
}

export function formatServiceRequestPriority(priority: string): string {
  return labelOf(
    {
      asap: "Càng sớm càng tốt",
      routine: "Thường quy",
      stat: "Ngay lập tức",
      urgent: "Khẩn"
    },
    priority
  );
}

export function formatWorkflowTaskStatus(status: string): string {
  return labelOf(
    {
      accepted: "Đã nhận",
      cancelled: "Đã hủy",
      completed: "Hoàn tất",
      draft: "Bản nháp",
      "entered-in-error": "Nhập lỗi",
      failed: "Thất bại",
      "in-progress": "Đang thực hiện",
      "on-hold": "Tạm giữ",
      ready: "Sẵn sàng",
      received: "Đã tiếp nhận",
      rejected: "Từ chối",
      requested: "Đã yêu cầu"
    },
    status
  );
}

export function formatWorkflowTaskReferences(
  references: readonly WorkflowTaskReferenceLike[]
): string {
  if (references.length === 0) {
    return "Chưa gắn";
  }

  return references
    .map((reference) => `${reference.label ?? reference.resourceType}: ${reference.resourceType}/${reference.id}`)
    .join(" · ");
}

export function formatProcedureStatus(status: string): string {
  return labelOf(
    {
      preparation: "Chuẩn bị",
      "in-progress": "Đang thực hiện",
      "not-done": "Không thực hiện",
      "on-hold": "Tạm giữ",
      stopped: "Đã dừng",
      completed: "Hoàn tất",
      "entered-in-error": "Nhập lỗi",
      unknown: "Chưa rõ"
    },
    status
  );
}

export function formatProcedureCategory(category: string): string {
  return labelOf(
    {
      surgical: "Phẫu thuật",
      diagnostic: "Chẩn đoán",
      therapeutic: "Điều trị",
      counseling: "Tư vấn",
      rehabilitation: "Phục hồi chức năng",
      other: "Khác"
    },
    category
  );
}

export function formatProcedurePerformers(performers: readonly ProcedurePerformerLike[]): string {
  if (performers.length === 0) {
    return "Chưa có";
  }

  return performers
    .map((performer) =>
      [
        `${performer.actorType}/${performer.actorId}`,
        performer.function?.display,
        performer.onBehalfOfOrganizationId ? `thay mặt ${performer.onBehalfOfOrganizationId}` : undefined
      ]
        .filter(Boolean)
        .join(" · ")
    )
    .join(", ");
}

export function formatProcedureReferences(
  references: readonly ProcedureReportReferenceLike[]
): string {
  if (references.length === 0) {
    return "Chưa có";
  }

  return references.map((reference) => `${reference.resourceType}/${reference.id}`).join(", ");
}

export function formatObservationCategory(category: string): string {
  return labelOf(
    {
      laboratory: "Xét nghiệm",
      "vital-signs": "Sinh hiệu"
    },
    category
  );
}

export function formatObservationStatus(status: string): string {
  return labelOf(
    {
      registered: "Đã đăng ký",
      preliminary: "Sơ bộ",
      final: "Chính thức",
      amended: "Đã hiệu chỉnh",
      cancelled: "Đã hủy",
      "entered-in-error": "Nhập lỗi"
    },
    status
  );
}

export function formatObservationValue(observation: ObservationLike): string {
  if (observation.valueQuantity) {
    return `${observation.valueQuantity.value} ${observation.valueQuantity.unit}`;
  }

  return observation.valueText ?? "Chưa có giá trị";
}

export function formatDiagnosticReportCategory(category: string): string {
  return labelOf(
    {
      imaging: "Chẩn đoán hình ảnh",
      laboratory: "Xét nghiệm",
      other: "Khác",
      pathology: "Giải phẫu bệnh"
    },
    category
  );
}

export function formatDiagnosticReportStatus(status: string): string {
  return labelOf(
    {
      amended: "Đã hiệu chỉnh",
      appended: "Đã bổ sung",
      cancelled: "Đã hủy",
      corrected: "Đã sửa",
      "entered-in-error": "Nhập lỗi",
      final: "Chính thức",
      partial: "Một phần",
      preliminary: "Sơ bộ",
      registered: "Đã đăng ký",
      unknown: "Chưa rõ"
    },
    status
  );
}

export function formatImagingStudyStatus(status: string): string {
  return labelOf(
    {
      available: "Sẵn sàng",
      cancelled: "Đã hủy",
      "entered-in-error": "Nhập lỗi",
      registered: "Đã đăng ký",
      unknown: "Chưa rõ"
    },
    status
  );
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function toApiDateTime(value: string): string {
  return new Date(value).toISOString();
}

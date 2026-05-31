type LabeledValue = string;

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

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function toApiDateTime(value: string): string {
  return new Date(value).toISOString();
}

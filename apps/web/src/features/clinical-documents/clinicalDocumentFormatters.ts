type LabeledValue = string;

function labelOf<T extends string>(
  labels: Readonly<Record<T, string>>,
  value: LabeledValue
): string {
  return labels[value as T] ?? value;
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

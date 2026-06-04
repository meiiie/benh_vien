export const workflowSteps = [
  "Tiếp nhận bệnh nhân",
  "Mở lượt khám",
  "Kiểm tra dị ứng",
  "Ghi nhận chẩn đoán",
  "Chỉ định dịch vụ",
  "Theo dõi Task thực thi",
  "Ghi nhận Procedure",
  "Nhận kết quả",
  "Gắn siêu dữ liệu PACS",
  "Định danh cơ sở/endpoint",
  "Ghi nhận chỉ số",
  "Kê đơn/thuốc",
  "Cấp phát thuốc",
  "Xác nhận dùng thuốc",
  "Gắn tài liệu",
  "Ký/xác thực",
  "Xuất FHIR"
];

export const documentTaxonomy = [
  "Advance Directive",
  "CCD/CCDA/CCR",
  "Lab Report",
  "Medical Record",
  "Patient Information",
  "FHIR Export Document"
];

export const referenceSignals = [
  {
    name: "OpenEMR",
    value:
      "Workbench bệnh viện: lịch khám, hồ sơ bệnh nhân, encounter, tài liệu, audit và API."
  },
  {
    name: "HL7 FHIR R4",
    value:
      "Patient, Encounter, AllergyIntolerance, Condition, ServiceRequest, Task, Procedure, Observation, DiagnosticReport, ImagingStudy, MedicationRequest, MedicationDispense, MedicationAdministration, DocumentReference, Provenance cùng Organization/Practitioner/Endpoint là lõi trao đổi dữ liệu; RecordTransfer xuất thành Task để điều phối chuyển hồ sơ."
  },
  {
    name: "Bối cảnh Việt Nam",
    value:
      "Ưu tiên Hải Phòng, định danh nội bộ, BHYT/CCCD ở lớp dữ liệu; chưa giả lập HIS/LIS/PACS khi chưa tích hợp thật."
  },
  {
    name: "Product direction",
    value:
      "Không làm landing page đẹp trước; xây bàn làm việc nghiệp vụ cho nhân viên y tế trước."
  }
];

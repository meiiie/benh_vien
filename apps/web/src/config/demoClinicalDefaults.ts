import type {
  GatewayAcknowledgementForm,
  NewAllergyIntoleranceForm,
  NewClinicalDocumentForm,
  NewConditionForm,
  NewDiagnosticReportForm,
  NewEncounterForm,
  NewImagingStudyForm,
  NewMedicationAdministrationForm,
  NewMedicationDispenseForm,
  NewMedicationRequestForm,
  NewObservationForm,
  NewPatientForm,
  NewProcedureForm,
  NewRecordTransferForm,
  NewServiceRequestForm,
  PatientMergeForm
} from "../types/clinical.js";
export const defaultPatientForm: NewPatientForm = {
  fullName: "Trần Minh Hải",
  birthDate: "1992-09-18",
  gender: "male",
  nationalId: "031092000002",
  hospitalMrn: "MRN-HP-0002",
  phone: "0912345678",
  address: "Hải Phòng, Việt Nam",
  managingOrganizationId: "hospital-hai-phong-demo"
};

export const defaultPatientMergeForm: PatientMergeForm = {
  targetPatientId: "patient-demo-001",
  reason: "Đối soát MPI xác nhận hồ sơ nguồn bị đăng ký trùng với hồ sơ đích.",
  confirmationText: ""
};

export const defaultEncounterForm: NewEncounterForm = {
  class: "ambulatory",
  serviceType: "Khám ngoại trú",
  reasonText: "Tiếp nhận hồ sơ và đánh giá tình trạng ban đầu.",
  departmentId: "department-outpatient",
  attendingPractitionerId: "practitioner-demo-002",
  startedAt: "2026-05-27T10:00"
};

export const defaultClinicalDocumentForm: NewClinicalDocumentForm = {
  encounterId: "",
  type: "referral-letter",
  title: "Giấy chuyển tuyến điện tử - Hải Phòng",
  storageUri: "s3://wiiicare-demo/patients/current/referral-letter.pdf",
  attachmentContentType: "application/pdf",
  attachmentSizeBytes: "131072",
  attachmentHashSha1Base64: "QExIY/y1FG989CjaoCo4NtNAlXQ=",
  attachmentCreatedAt: "2026-05-28T09:00",
  authorPractitionerId: "practitioner-demo-003"
};

export const defaultConditionForm: NewConditionForm = {
  encounterId: "",
  category: "encounter-diagnosis",
  clinicalStatus: "active",
  verificationStatus: "confirmed",
  codeSystem: "http://hl7.org/fhir/sid/icd-10",
  code: "R50.9",
  codeDisplay: "Sốt chưa rõ nguyên nhân",
  severity: "mild",
  onsetAt: "2026-05-27T09:30",
  recorderPractitionerId: "practitioner-demo-001",
  note: "Chẩn đoán làm việc trong quá trình khám."
};

export const defaultAllergyIntoleranceForm: NewAllergyIntoleranceForm = {
  encounterId: "",
  type: "allergy",
  category: "medication",
  clinicalStatus: "active",
  verificationStatus: "confirmed",
  criticality: "high",
  codeSystem: "http://snomed.info/sct",
  code: "91936005",
  codeDisplay: "Allergy to penicillin",
  manifestationSystem: "http://snomed.info/sct",
  manifestationCode: "271807003",
  manifestationDisplay: "Skin rash",
  reactionSeverity: "moderate",
  reactionDescription: "Phát ban sau khi dùng nhóm penicillin theo khai thác bệnh sử.",
  recordedAt: "2026-05-27T10:20",
  recorderPractitionerId: "practitioner-demo-001",
  note: "Cảnh báo dị ứng cần được xem trước khi kê thuốc."
};

export const defaultObservationForm: NewObservationForm = {
  encounterId: "",
  category: "laboratory",
  codeSystem: "http://loinc.org",
  code: "718-7",
  codeDisplay: "Hemoglobin",
  value: "13.8",
  unit: "g/dL",
  unitSystem: "http://unitsofmeasure.org",
  unitCode: "g/dL",
  effectiveAt: "2026-05-27T10:15",
  performerPractitionerId: "practitioner-demo-002"
};

export const defaultMedicationRequestForm: NewMedicationRequestForm = {
  encounterId: "",
  reasonConditionId: "",
  category: "outpatient",
  priority: "routine",
  medicationSystem: "http://www.whocc.no/atc",
  medicationCode: "C08CA01",
  medicationDisplay: "Amlodipine",
  dosageText: "Uống 5 mg mỗi ngày vào buổi tối",
  route: "Đường uống",
  doseValue: "5",
  doseUnit: "mg",
  frequency: "1",
  period: "1",
  periodUnit: "d",
  authoredOn: "2026-05-27T10:30",
  requesterPractitionerId: "practitioner-demo-001",
  expectedSupplyDurationDays: "30",
  note: "Chỉ định thuốc dùng cho quản lý điều trị ngoại trú."
};

export const defaultMedicationDispenseForm: NewMedicationDispenseForm = {
  encounterId: "",
  medicationRequestId: "",
  category: "outpatient",
  medicationSystem: "http://www.whocc.no/atc",
  medicationCode: "C09AA05",
  medicationDisplay: "Ramipril",
  quantityValue: "30",
  quantityUnit: "viên",
  daysSupplyValue: "30",
  whenPrepared: "2026-05-27T12:30",
  whenHandedOver: "2026-05-27T12:45",
  dispenserPractitionerId: "nurse-demo-001",
  receiverPractitionerId: "nurse-demo-001",
  dosageText: "Uống 5 mg mỗi ngày vào buổi sáng",
  route: "Đường uống",
  doseValue: "5",
  doseUnit: "mg",
  frequency: "1",
  period: "1",
  periodUnit: "d",
  note: "Ghi nhận cấp phát thuốc sau khi chỉ định đã được duyệt."
};

export const defaultMedicationAdministrationForm: NewMedicationAdministrationForm = {
  encounterId: "",
  medicationRequestId: "",
  reasonConditionId: "",
  category: "outpatient",
  medicationSystem: "http://www.whocc.no/atc",
  medicationCode: "C09AA05",
  medicationDisplay: "Ramipril",
  effectiveStart: "2026-05-27T13:00",
  performerActorType: "Practitioner",
  performerActorId: "nurse-demo-001",
  performerFunctionDisplay: "Nhân sự xác nhận dùng thuốc",
  dosageText: "Uống 5 mg vào buổi sáng",
  routeSystem: "http://snomed.info/sct",
  routeCode: "26643006",
  routeDisplay: "Oral route",
  doseValue: "5",
  doseUnit: "mg",
  note: "Ghi nhận dùng thuốc thực tế theo chỉ định đã có."
};

export const defaultServiceRequestForm: NewServiceRequestForm = {
  encounterId: "",
  reasonConditionId: "",
  category: "laboratory",
  priority: "urgent",
  codeSystem: "http://loinc.org",
  code: "58410-2",
  codeDisplay: "Complete blood count panel",
  occurrenceAt: "2026-05-27T11:00",
  authoredOn: "2026-05-27T10:40",
  requesterPractitionerId: "practitioner-demo-001",
  performerOrganizationId: "department-laboratory",
  patientInstruction: "Lấy mẫu theo hướng dẫn của khoa xét nghiệm.",
  note: "Chỉ định xét nghiệm/hình ảnh dùng để nối EMR với LIS/PACS."
};

export const defaultProcedureForm: NewProcedureForm = {
  encounterId: "",
  basedOnServiceRequestId: "",
  reasonConditionId: "",
  category: "diagnostic",
  status: "completed",
  codeSystem: "http://snomed.info/sct",
  code: "168537006",
  codeDisplay: "Chest X-ray",
  performedStart: "2026-05-27T12:15",
  performedEnd: "2026-05-27T12:30",
  performerActorType: "Practitioner",
  performerActorId: "practitioner-demo-001",
  performerFunctionSystem: "urn:wiiicare:nexus:procedure-performer-function",
  performerFunctionCode: "clinical-performer",
  performerFunctionDisplay: "Người thực hiện lâm sàng",
  onBehalfOfOrganizationId: "department-diagnostic-imaging",
  recorderPractitionerId: "practitioner-demo-001",
  asserterPractitionerId: "practitioner-demo-001",
  bodySiteSystem: "http://snomed.info/sct",
  bodySiteCode: "51185008",
  bodySiteDisplay: "Thoracic structure",
  outcomeSystem: "urn:wiiicare:nexus:procedure-outcome",
  outcomeCode: "completed",
  outcomeDisplay: "Hoàn tất thủ thuật",
  reportReferenceType: "DiagnosticReport",
  reportReferenceId: "",
  note: "Procedure ghi nhận hành động y tế đã thực hiện, khác với ServiceRequest là y lệnh và Task là hàng đợi thực thi."
};

export const defaultDiagnosticReportForm: NewDiagnosticReportForm = {
  encounterId: "",
  basedOnServiceRequestId: "",
  category: "laboratory",
  codeSystem: "http://loinc.org",
  code: "58410-2",
  codeDisplay: "Complete blood count panel",
  effectiveAt: "2026-05-27T11:30",
  issuedAt: "2026-05-27T12:00",
  performerOrganizationId: "department-laboratory",
  resultsInterpreterPractitionerId: "practitioner-demo-002",
  resultObservationIds: [],
  conclusion: "Kết quả phù hợp với bối cảnh lâm sàng hiện tại.",
  presentedFormUrl: "",
  presentedFormTitle: ""
};

export const defaultImagingStudyForm: NewImagingStudyForm = {
  encounterId: "",
  basedOnServiceRequestId: "",
  diagnosticReportId: "",
  studyInstanceUid: "1.2.826.0.1.3680043.10.543.202605270002",
  accessionNumber: "HP-CXR-20260527-0002",
  description: "Chest X-ray follow-up study",
  startedAt: "2026-05-27T12:10",
  referrerPractitionerId: "practitioner-demo-001",
  interpreterPractitionerId: "practitioner-demo-001",
  endpointId: "endpoint-pacs-hai-phong-demo",
  seriesUid: "1.2.826.0.1.3680043.10.543.202605270002.1",
  seriesNumber: "1",
  modalitySystem: "http://dicom.nema.org/resources/ontology/DCM",
  modalityCode: "DX",
  modalityDisplay: "Digital Radiography",
  seriesDescription: "PA and lateral chest radiographs",
  numberOfInstances: "2",
  bodySiteSystem: "http://snomed.info/sct",
  bodySiteCode: "51185008",
  bodySiteDisplay: "Thoracic structure"
};

export const defaultTransferContext = {
  consentReference: "consent-demo-transfer-001",
  recipientOrganizationId: "hospital-hai-phong-referral"
};

export const defaultRecordTransferForm: NewRecordTransferForm = {
  priority: "urgent",
  bundleType: "document",
  sourceOrganizationId: "hospital-hai-phong-demo",
  recipientOrganizationId: defaultTransferContext.recipientOrganizationId,
  consentReference: defaultTransferContext.consentReference,
  reason: "Chuyển hồ sơ sang bệnh viện tiếp nhận để theo dõi sau cấp cứu.",
  note: "Dùng FHIR document Bundle có Composition làm mục lục lâm sàng."
};

export const defaultGatewayAcknowledgementForm: GatewayAcknowledgementForm = {
  recordTransferId: "record-transfer-demo-001",
  recipientOrganizationId: defaultTransferContext.recipientOrganizationId,
  acknowledgementReference: "ack-record-transfer-callback-demo-001",
  receivedAt: "",
  receivedByActorId: "system-hai-phong-referral-gateway",
  targetEndpointId: "endpoint-fhir-hai-phong-referral",
  deliveryIdempotencyKey: "wiiicare-record-transfer-callback-demo-001",
  note: "Bệnh viện nhận xác nhận đã tiếp nhận gói hồ sơ qua gateway liên thông."
};

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
    value: "Workbench bệnh viện: lịch khám, hồ sơ bệnh nhân, encounter, tài liệu, audit và API."
  },
  {
    name: "HL7 FHIR R4",
    value: "Patient, Encounter, AllergyIntolerance, Condition, ServiceRequest, Task, Procedure, Observation, DiagnosticReport, ImagingStudy, MedicationRequest, MedicationDispense, MedicationAdministration, DocumentReference, Provenance cùng Organization/Practitioner/Endpoint là lõi trao đổi dữ liệu; RecordTransfer xuất thành Task để điều phối chuyển hồ sơ."
  },
  {
    name: "Bối cảnh Việt Nam",
    value: "Ưu tiên Hải Phòng, định danh nội bộ, BHYT/CCCD ở lớp dữ liệu; chưa giả lập HIS/LIS/PACS khi chưa tích hợp thật."
  },
  {
    name: "Product direction",
    value: "Không làm landing page đẹp trước; xây bàn làm việc nghiệp vụ cho nhân viên y tế trước."
  }
];

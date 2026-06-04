import type { NewAllergyIntoleranceForm } from "../types/allergies.js";
import type { NewClinicalDocumentForm } from "../types/clinicalDocuments.js";
import type { NewConditionForm } from "../types/conditions.js";
import type { NewEncounterForm } from "../types/encounters.js";
import type { NewObservationForm } from "../types/observations.js";

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
  reactionDescription:
    "Phát ban sau khi dùng nhóm penicillin theo khai thác bệnh sử.",
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

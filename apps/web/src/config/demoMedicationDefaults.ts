import type {
  NewMedicationAdministrationForm,
  NewMedicationDispenseForm,
  NewMedicationRequestForm
} from "../types/medications.js";

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

export const defaultMedicationAdministrationForm: NewMedicationAdministrationForm =
  {
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

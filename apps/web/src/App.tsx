import { FormEvent, ReactNode, useEffect, useState } from "react";

type AppRoute =
  | "landing"
  | "login"
  | "dashboard"
  | "workspace"
  | "documents"
  | "audit"
  | "interop"
  | "settings";
type PatientIdentifierType = "national-id" | "insurance-id" | "hospital-mrn" | "legacy-id";
type PatientGender = "male" | "female" | "other" | "unknown";
type EncounterClass = "ambulatory" | "inpatient" | "emergency" | "virtual";
type EncounterStatus = "planned" | "in-progress" | "finished" | "cancelled" | "entered-in-error";
type ClinicalDocumentType =
  | "admission-note"
  | "discharge-summary"
  | "lab-report"
  | "imaging-report"
  | "referral-letter"
  | "consent-form"
  | "advance-directive"
  | "ccda"
  | "ccr"
  | "medical-record"
  | "patient-information";
type ClinicalDocumentStatus = "draft" | "signed" | "superseded" | "entered-in-error";
type ConditionClinicalStatus =
  | "active"
  | "recurrence"
  | "relapse"
  | "inactive"
  | "remission"
  | "resolved";
type ConditionVerificationStatus =
  | "unconfirmed"
  | "provisional"
  | "differential"
  | "confirmed"
  | "refuted"
  | "entered-in-error";
type ConditionCategory = "problem-list-item" | "encounter-diagnosis";
type ConditionSeverity = "mild" | "moderate" | "severe";
type AllergyClinicalStatus = "active" | "inactive" | "resolved";
type AllergyVerificationStatus = "unconfirmed" | "confirmed" | "refuted" | "entered-in-error";
type AllergyType = "allergy" | "intolerance";
type AllergyCategory = "food" | "medication" | "environment" | "biologic";
type AllergyCriticality = "low" | "high" | "unable-to-assess";
type AllergyReactionSeverity = "mild" | "moderate" | "severe";
type ObservationStatus =
  | "registered"
  | "preliminary"
  | "final"
  | "amended"
  | "cancelled"
  | "entered-in-error";
type ObservationCategory = "vital-signs" | "laboratory";
type MedicationRequestStatus =
  | "active"
  | "on-hold"
  | "cancelled"
  | "completed"
  | "entered-in-error"
  | "stopped"
  | "draft"
  | "unknown";
type MedicationRequestIntent =
  | "proposal"
  | "plan"
  | "order"
  | "original-order"
  | "reflex-order"
  | "filler-order"
  | "instance-order"
  | "option";
type MedicationRequestCategory = "inpatient" | "outpatient" | "community" | "discharge";
type MedicationRequestPriority = "routine" | "urgent" | "asap" | "stat";
type MedicationTimingUnit = "h" | "d" | "wk";
type DemoRole = "clinician" | "nurse" | "auditor" | "admin";
type PurposeOfUse = "TREATMENT" | "AUDIT" | "OPERATIONS";
type ConsentStatus = "active" | "revoked" | "expired";
type ConsentCategory = "record-sharing";

type PatientIdentifier = {
  readonly system: string;
  readonly value: string;
  readonly type: PatientIdentifierType;
};

type Patient = {
  readonly id: string;
  readonly identifiers: readonly PatientIdentifier[];
  readonly fullName: string;
  readonly birthDate?: string;
  readonly gender: PatientGender;
  readonly address?: string;
  readonly phone?: string;
  readonly managingOrganizationId: string;
  readonly status: "active" | "merged" | "inactive";
  readonly createdAt: string;
  readonly updatedAt: string;
};

type Encounter = {
  readonly id: string;
  readonly patientId: string;
  readonly status: EncounterStatus;
  readonly class: EncounterClass;
  readonly serviceType: string;
  readonly reasonText: string;
  readonly departmentId?: string;
  readonly attendingPractitionerId: string;
  readonly startedAt: string;
  readonly endedAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

type ClinicalDocument = {
  readonly id: string;
  readonly patientId: string;
  readonly encounterId?: string;
  readonly type: ClinicalDocumentType;
  readonly title: string;
  readonly status: ClinicalDocumentStatus;
  readonly storageUri: string;
  readonly authorPractitionerId: string;
  readonly signedAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

type ObservationCode = {
  readonly system: string;
  readonly code: string;
  readonly display: string;
};

type ConditionCode = {
  readonly system: string;
  readonly code: string;
  readonly display: string;
};

type AllergyCode = {
  readonly system: string;
  readonly code: string;
  readonly display: string;
};

type AllergyReaction = {
  readonly manifestation: AllergyCode;
  readonly severity?: AllergyReactionSeverity;
  readonly description?: string;
};

type AllergyIntolerance = {
  readonly id: string;
  readonly patientId: string;
  readonly encounterId?: string;
  readonly clinicalStatus: AllergyClinicalStatus;
  readonly verificationStatus: AllergyVerificationStatus;
  readonly type: AllergyType;
  readonly category: AllergyCategory;
  readonly criticality?: AllergyCriticality;
  readonly code: AllergyCode;
  readonly reaction?: AllergyReaction;
  readonly recordedAt: string;
  readonly recorderPractitionerId: string;
  readonly note?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

type Condition = {
  readonly id: string;
  readonly patientId: string;
  readonly encounterId?: string;
  readonly clinicalStatus: ConditionClinicalStatus;
  readonly verificationStatus: ConditionVerificationStatus;
  readonly category: ConditionCategory;
  readonly code: ConditionCode;
  readonly severity?: ConditionSeverity;
  readonly onsetAt?: string;
  readonly recordedAt: string;
  readonly recorderPractitionerId: string;
  readonly note?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

type ObservationQuantity = {
  readonly value: number;
  readonly unit: string;
  readonly system?: string;
  readonly code?: string;
};

type Observation = {
  readonly id: string;
  readonly patientId: string;
  readonly encounterId?: string;
  readonly status: ObservationStatus;
  readonly category: ObservationCategory;
  readonly code: ObservationCode;
  readonly effectiveAt: string;
  readonly valueQuantity?: ObservationQuantity;
  readonly valueText?: string;
  readonly performerPractitionerId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

type MedicationCode = {
  readonly system: string;
  readonly code: string;
  readonly display: string;
};

type MedicationQuantity = {
  readonly value: number;
  readonly unit: string;
  readonly system?: string;
  readonly code?: string;
};

type DosageInstruction = {
  readonly text: string;
  readonly route?: string;
  readonly doseQuantity?: MedicationQuantity;
  readonly frequency?: number;
  readonly period?: number;
  readonly periodUnit?: MedicationTimingUnit;
};

type MedicationRequest = {
  readonly id: string;
  readonly patientId: string;
  readonly encounterId?: string;
  readonly reasonConditionId?: string;
  readonly status: MedicationRequestStatus;
  readonly intent: MedicationRequestIntent;
  readonly category: MedicationRequestCategory;
  readonly priority: MedicationRequestPriority;
  readonly medicationCode: MedicationCode;
  readonly dosageInstruction: DosageInstruction;
  readonly authoredOn: string;
  readonly requesterPractitionerId: string;
  readonly expectedSupplyDurationDays?: number;
  readonly note?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

type AuditAction =
  | "patient.list"
  | "patient.create"
  | "patient.read"
  | "patient.fhir-export"
  | "patient.fhir-bundle-export"
  | "encounter.list"
  | "encounter.create"
  | "encounter.read"
  | "encounter.finish"
  | "encounter.fhir-export"
  | "allergy-intolerance.list"
  | "allergy-intolerance.create"
  | "allergy-intolerance.read"
  | "allergy-intolerance.fhir-export"
  | "condition.list"
  | "condition.create"
  | "condition.read"
  | "condition.fhir-export"
  | "medication-request.list"
  | "medication-request.create"
  | "medication-request.read"
  | "medication-request.fhir-export"
  | "observation.list"
  | "observation.create"
  | "observation.read"
  | "observation.fhir-export"
  | "clinical-document.list"
  | "clinical-document.create"
  | "clinical-document.sign"
  | "clinical-document.fhir-export"
  | "consent.list"
  | "consent.create"
  | "audit-event.list";

type AuditResourceType =
  | "Patient"
  | "Encounter"
  | "AllergyIntolerance"
  | "Condition"
  | "MedicationRequest"
  | "Observation"
  | "ClinicalDocument"
  | "Consent"
  | "AuditEvent";

type AuditEvent = {
  readonly id?: string;
  readonly occurredAt: string;
  readonly actorId: string;
  readonly action: AuditAction;
  readonly resourceType: AuditResourceType;
  readonly resourceId: string;
  readonly patientId?: string;
  readonly purposeOfUse?: string;
  readonly ipAddress?: string;
  readonly userAgent?: string;
  readonly metadata: Record<string, unknown>;
};

type Consent = {
  readonly id: string;
  readonly patientId: string;
  readonly status: ConsentStatus;
  readonly category: ConsentCategory;
  readonly granteeOrganizationId: string;
  readonly grantorActorId: string;
  readonly evidenceDocumentId?: string;
  readonly validFrom: string;
  readonly validUntil?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

type PatientsResponse = {
  readonly items: readonly Patient[];
};

type EncountersResponse = {
  readonly items: readonly Encounter[];
};

type ClinicalDocumentsResponse = {
  readonly items: readonly ClinicalDocument[];
};

type ConditionsResponse = {
  readonly items: readonly Condition[];
};

type AllergyIntolerancesResponse = {
  readonly items: readonly AllergyIntolerance[];
};

type ObservationsResponse = {
  readonly items: readonly Observation[];
};

type MedicationRequestsResponse = {
  readonly items: readonly MedicationRequest[];
};

type AuditEventsResponse = {
  readonly items: readonly AuditEvent[];
};

type ConsentsResponse = {
  readonly items: readonly Consent[];
};

type NewPatientForm = {
  fullName: string;
  birthDate: string;
  gender: PatientGender;
  nationalId: string;
  hospitalMrn: string;
  phone: string;
  address: string;
  managingOrganizationId: string;
};

type NewEncounterForm = {
  class: EncounterClass;
  serviceType: string;
  reasonText: string;
  departmentId: string;
  attendingPractitionerId: string;
  startedAt: string;
};

type NewClinicalDocumentForm = {
  encounterId: string;
  type: ClinicalDocumentType;
  title: string;
  storageUri: string;
  authorPractitionerId: string;
};

type NewConditionForm = {
  encounterId: string;
  category: ConditionCategory;
  clinicalStatus: ConditionClinicalStatus;
  verificationStatus: ConditionVerificationStatus;
  codeSystem: string;
  code: string;
  codeDisplay: string;
  severity: "" | ConditionSeverity;
  onsetAt: string;
  recorderPractitionerId: string;
  note: string;
};

type NewAllergyIntoleranceForm = {
  encounterId: string;
  type: AllergyType;
  category: AllergyCategory;
  clinicalStatus: AllergyClinicalStatus;
  verificationStatus: AllergyVerificationStatus;
  criticality: "" | AllergyCriticality;
  codeSystem: string;
  code: string;
  codeDisplay: string;
  manifestationSystem: string;
  manifestationCode: string;
  manifestationDisplay: string;
  reactionSeverity: "" | AllergyReactionSeverity;
  reactionDescription: string;
  recordedAt: string;
  recorderPractitionerId: string;
  note: string;
};

type NewObservationForm = {
  encounterId: string;
  category: ObservationCategory;
  codeSystem: string;
  code: string;
  codeDisplay: string;
  value: string;
  unit: string;
  unitSystem: string;
  unitCode: string;
  effectiveAt: string;
  performerPractitionerId: string;
};

type NewMedicationRequestForm = {
  encounterId: string;
  reasonConditionId: string;
  category: MedicationRequestCategory;
  priority: MedicationRequestPriority;
  medicationSystem: string;
  medicationCode: string;
  medicationDisplay: string;
  dosageText: string;
  route: string;
  doseValue: string;
  doseUnit: string;
  frequency: string;
  period: string;
  periodUnit: MedicationTimingUnit;
  authoredOn: string;
  requesterPractitionerId: string;
  expectedSupplyDurationDays: string;
  note: string;
};

type LoginForm = {
  username: string;
  password: string;
  role: DemoRole;
};

type AuthSession = {
  readonly accessToken: string;
  readonly expiresAt: string;
  readonly actor: {
    readonly actorId: string;
    readonly displayName: string;
    readonly role: DemoRole;
  };
};

const defaultPatientForm: NewPatientForm = {
  fullName: "Trần Minh Hải",
  birthDate: "1992-09-18",
  gender: "male",
  nationalId: "031092000002",
  hospitalMrn: "MRN-HP-0002",
  phone: "0912345678",
  address: "Hải Phòng, Việt Nam",
  managingOrganizationId: "hospital-hai-phong-demo"
};

const defaultEncounterForm: NewEncounterForm = {
  class: "ambulatory",
  serviceType: "Khám ngoại trú",
  reasonText: "Tiếp nhận hồ sơ và đánh giá tình trạng ban đầu.",
  departmentId: "department-outpatient",
  attendingPractitionerId: "practitioner-demo-002",
  startedAt: "2026-05-27T10:00"
};

const defaultClinicalDocumentForm: NewClinicalDocumentForm = {
  encounterId: "",
  type: "referral-letter",
  title: "Giấy chuyển tuyến điện tử - Hải Phòng",
  storageUri: "s3://wiiicare-demo/patients/current/referral-letter.pdf",
  authorPractitionerId: "practitioner-demo-003"
};

const defaultConditionForm: NewConditionForm = {
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

const defaultAllergyIntoleranceForm: NewAllergyIntoleranceForm = {
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

const defaultObservationForm: NewObservationForm = {
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

const defaultMedicationRequestForm: NewMedicationRequestForm = {
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

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ??
  (window.location.port === "7311" ? "http://localhost:7310/api/v1" : "/api/v1");

const defaultTransferContext = {
  consentReference: "consent-demo-transfer-001",
  recipientOrganizationId: "hospital-hai-phong-referral"
};

const loginPresets: Record<DemoRole, LoginForm> = {
  clinician: {
    username: "practitioner-demo-001",
    password: "demo",
    role: "clinician"
  },
  nurse: {
    username: "nurse-demo-001",
    password: "demo",
    role: "nurse"
  },
  auditor: {
    username: "security-officer-demo",
    password: "demo",
    role: "auditor"
  },
  admin: {
    username: "admin-demo",
    password: "demo",
    role: "admin"
  }
};

const workflowSteps = [
  "Tiếp nhận bệnh nhân",
  "Mở lượt khám",
  "Kiểm tra dị ứng",
  "Ghi nhận chẩn đoán",
  "Ghi nhận chỉ số",
  "Kê đơn/thuốc",
  "Gắn tài liệu",
  "Ký/xác thực",
  "Xuất FHIR"
];

const documentTaxonomy = [
  "Advance Directive",
  "CCD/CCDA/CCR",
  "Lab Report",
  "Medical Record",
  "Patient Information",
  "FHIR Export Document"
];

const navigationItems: readonly {
  readonly route: Exclude<AppRoute, "landing" | "login">;
  readonly label: string;
  readonly hint: string;
}[] = [
  { route: "dashboard", label: "Tổng quan", hint: "Vận hành" },
  { route: "workspace", label: "Hồ sơ bệnh nhân", hint: "Lượt khám" },
  { route: "documents", label: "Tài liệu", hint: "Bệnh án điện tử" },
  { route: "audit", label: "Kiểm toán", hint: "Nhật ký truy cập" },
  { route: "interop", label: "Liên thông", hint: "FHIR/HIS/LIS/PACS" },
  { route: "settings", label: "Cấu hình", hint: "Vai trò và bảo mật" }
];

const referenceSignals = [
  {
    name: "OpenEMR",
    value: "Workbench bệnh viện: lịch khám, hồ sơ bệnh nhân, encounter, tài liệu, audit và API."
  },
  {
    name: "HL7 FHIR R4",
    value: "Patient, Encounter, AllergyIntolerance, Condition, Observation, MedicationRequest và DocumentReference là lõi trao đổi dữ liệu trong lát cắt này."
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

export function App() {
  const [appRoute, setAppRoute] = useState<AppRoute>("landing");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authSession, setAuthSession] = useState<AuthSession>();
  const [loginForm, setLoginForm] = useState<LoginForm>(loginPresets.clinician);
  const [loginError, setLoginError] = useState<string>();
  const [patients, setPatients] = useState<readonly Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>();
  const [encounters, setEncounters] = useState<readonly Encounter[]>([]);
  const [selectedEncounterId, setSelectedEncounterId] = useState<string>();
  const [clinicalDocuments, setClinicalDocuments] = useState<readonly ClinicalDocument[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>();
  const [allergyIntolerances, setAllergyIntolerances] = useState<readonly AllergyIntolerance[]>([]);
  const [selectedAllergyIntoleranceId, setSelectedAllergyIntoleranceId] = useState<string>();
  const [conditions, setConditions] = useState<readonly Condition[]>([]);
  const [selectedConditionId, setSelectedConditionId] = useState<string>();
  const [observations, setObservations] = useState<readonly Observation[]>([]);
  const [selectedObservationId, setSelectedObservationId] = useState<string>();
  const [medicationRequests, setMedicationRequests] = useState<readonly MedicationRequest[]>([]);
  const [selectedMedicationRequestId, setSelectedMedicationRequestId] = useState<string>();
  const [auditEvents, setAuditEvents] = useState<readonly AuditEvent[]>([]);
  const [consents, setConsents] = useState<readonly Consent[]>([]);
  const [patientFhirPreview, setPatientFhirPreview] = useState<unknown>();
  const [patientFhirBundlePreview, setPatientFhirBundlePreview] = useState<unknown>();
  const [encounterFhirPreview, setEncounterFhirPreview] = useState<unknown>();
  const [documentFhirPreview, setDocumentFhirPreview] = useState<unknown>();
  const [allergyIntoleranceFhirPreview, setAllergyIntoleranceFhirPreview] = useState<unknown>();
  const [conditionFhirPreview, setConditionFhirPreview] = useState<unknown>();
  const [observationFhirPreview, setObservationFhirPreview] = useState<unknown>();
  const [medicationRequestFhirPreview, setMedicationRequestFhirPreview] = useState<unknown>();
  const [patientForm, setPatientForm] = useState<NewPatientForm>(defaultPatientForm);
  const [encounterForm, setEncounterForm] = useState<NewEncounterForm>(defaultEncounterForm);
  const [documentForm, setDocumentForm] =
    useState<NewClinicalDocumentForm>(defaultClinicalDocumentForm);
  const [allergyIntoleranceForm, setAllergyIntoleranceForm] =
    useState<NewAllergyIntoleranceForm>(defaultAllergyIntoleranceForm);
  const [conditionForm, setConditionForm] =
    useState<NewConditionForm>(defaultConditionForm);
  const [observationForm, setObservationForm] =
    useState<NewObservationForm>(defaultObservationForm);
  const [medicationRequestForm, setMedicationRequestForm] =
    useState<NewMedicationRequestForm>(defaultMedicationRequestForm);
  const [statusMessage, setStatusMessage] = useState("Chưa đăng nhập.");
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [isLoadingEncounters, setIsLoadingEncounters] = useState(false);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [isLoadingAllergyIntolerances, setIsLoadingAllergyIntolerances] = useState(false);
  const [isLoadingConditions, setIsLoadingConditions] = useState(false);
  const [isLoadingObservations, setIsLoadingObservations] = useState(false);
  const [isLoadingMedicationRequests, setIsLoadingMedicationRequests] = useState(false);
  const [isLoadingAuditEvents, setIsLoadingAuditEvents] = useState(false);
  const [isLoadingConsents, setIsLoadingConsents] = useState(false);
  const [isSubmittingPatient, setIsSubmittingPatient] = useState(false);
  const [isSubmittingEncounter, setIsSubmittingEncounter] = useState(false);
  const [isSubmittingDocument, setIsSubmittingDocument] = useState(false);
  const [isSubmittingAllergyIntolerance, setIsSubmittingAllergyIntolerance] = useState(false);
  const [isSubmittingCondition, setIsSubmittingCondition] = useState(false);
  const [isSubmittingObservation, setIsSubmittingObservation] = useState(false);
  const [isSubmittingMedicationRequest, setIsSubmittingMedicationRequest] = useState(false);
  const [isSigningDocument, setIsSigningDocument] = useState(false);
  const [isFinishingEncounter, setIsFinishingEncounter] = useState(false);

  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId);
  const selectedEncounter = encounters.find((encounter) => encounter.id === selectedEncounterId);
  const selectedDocument = clinicalDocuments.find((document) => document.id === selectedDocumentId);
  const selectedAllergyIntolerance = allergyIntolerances.find(
    (allergyIntolerance) => allergyIntolerance.id === selectedAllergyIntoleranceId
  );
  const selectedCondition = conditions.find((condition) => condition.id === selectedConditionId);
  const selectedObservation = observations.find((observation) => observation.id === selectedObservationId);
  const selectedMedicationRequest = medicationRequests.find(
    (medicationRequest) => medicationRequest.id === selectedMedicationRequestId
  );
  const selectedEncounterDocuments = selectedEncounter
    ? clinicalDocuments.filter((document) => document.encounterId === selectedEncounter.id)
    : [];
  const selectedEncounterAllergyIntolerances = selectedEncounter
    ? allergyIntolerances.filter((allergyIntolerance) => allergyIntolerance.encounterId === selectedEncounter.id)
    : [];
  const selectedEncounterObservations = selectedEncounter
    ? observations.filter((observation) => observation.encounterId === selectedEncounter.id)
    : [];
  const selectedEncounterConditions = selectedEncounter
    ? conditions.filter((condition) => condition.encounterId === selectedEncounter.id)
    : [];
  const selectedEncounterMedicationRequests = selectedEncounter
    ? medicationRequests.filter((medicationRequest) => medicationRequest.encounterId === selectedEncounter.id)
    : [];
  const openEncounters = encounters.filter((encounter) => encounter.status === "in-progress");
  const signedDocuments = clinicalDocuments.filter((document) => document.status === "signed");
  const draftDocuments = clinicalDocuments.filter((document) => document.status === "draft");
  const canReadAudit = authSession?.actor.role === "auditor" || authSession?.actor.role === "admin";

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    void loadPatients();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !selectedPatientId) {
      setPatientFhirPreview(undefined);
      setPatientFhirBundlePreview(undefined);
      setEncounterFhirPreview(undefined);
      setDocumentFhirPreview(undefined);
      setAllergyIntoleranceFhirPreview(undefined);
      setConditionFhirPreview(undefined);
      setObservationFhirPreview(undefined);
      setMedicationRequestFhirPreview(undefined);
      setEncounters([]);
      setClinicalDocuments([]);
      setAllergyIntolerances([]);
      setConditions([]);
      setObservations([]);
      setMedicationRequests([]);
      setAuditEvents([]);
      setConsents([]);
      setSelectedEncounterId(undefined);
      setSelectedDocumentId(undefined);
      setSelectedAllergyIntoleranceId(undefined);
      setSelectedConditionId(undefined);
      setSelectedObservationId(undefined);
      setSelectedMedicationRequestId(undefined);
      return;
    }

    void loadPatientWorkspace(selectedPatientId);
  }, [isAuthenticated, selectedPatientId]);

  useEffect(() => {
    if (!selectedEncounterId) {
      setEncounterFhirPreview(undefined);
      setDocumentForm((current) => ({ ...current, encounterId: "" }));
      setAllergyIntoleranceForm((current) => ({ ...current, encounterId: "" }));
      setConditionForm((current) => ({ ...current, encounterId: "" }));
      setObservationForm((current) => ({ ...current, encounterId: "" }));
      setMedicationRequestForm((current) => ({ ...current, encounterId: "" }));
      return;
    }

    setDocumentForm((current) => ({ ...current, encounterId: selectedEncounterId }));
    setAllergyIntoleranceForm((current) => ({ ...current, encounterId: selectedEncounterId }));
    setConditionForm((current) => ({ ...current, encounterId: selectedEncounterId }));
    setObservationForm((current) => ({ ...current, encounterId: selectedEncounterId }));
    setMedicationRequestForm((current) => ({ ...current, encounterId: selectedEncounterId }));
    void loadEncounterFhirPreview(selectedEncounterId);
  }, [selectedEncounterId]);

  useEffect(() => {
    if (!selectedDocumentId) {
      setDocumentFhirPreview(undefined);
      return;
    }

    void loadDocumentFhirPreview(selectedDocumentId);
  }, [selectedDocumentId]);

  useEffect(() => {
    if (!selectedConditionId) {
      setConditionFhirPreview(undefined);
      return;
    }

    void loadConditionFhirPreview(selectedConditionId);
  }, [selectedConditionId]);

  useEffect(() => {
    if (!selectedAllergyIntoleranceId) {
      setAllergyIntoleranceFhirPreview(undefined);
      return;
    }

    void loadAllergyIntoleranceFhirPreview(selectedAllergyIntoleranceId);
  }, [selectedAllergyIntoleranceId]);

  useEffect(() => {
    if (!selectedObservationId) {
      setObservationFhirPreview(undefined);
      return;
    }

    void loadObservationFhirPreview(selectedObservationId);
  }, [selectedObservationId]);

  useEffect(() => {
    if (!selectedMedicationRequestId) {
      setMedicationRequestFhirPreview(undefined);
      return;
    }

    void loadMedicationRequestFhirPreview(selectedMedicationRequestId);
  }, [selectedMedicationRequestId]);

  function buildHeaders(
    purposeOfUse: PurposeOfUse,
    headers: Record<string, string> = {}
  ): Record<string, string> {
    if (!authSession) {
      throw new Error("Chưa có phiên đăng nhập hợp lệ.");
    }

    return {
      ...headers,
      Authorization: `Bearer ${authSession.accessToken}`,
      "x-purpose-of-use": purposeOfUse
    };
  }

  async function loadPatients(nextSelectedId?: string) {
    setIsLoadingPatients(true);

    try {
      const response = await fetch(`${apiBaseUrl}/patients`, {
        headers: buildHeaders("TREATMENT")
      });

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      const data = (await response.json()) as PatientsResponse;
      setPatients(data.items);
      setSelectedPatientId(nextSelectedId ?? selectedPatientId ?? data.items[0]?.id);
      setStatusMessage(`Đã tải ${data.items.length} hồ sơ bệnh nhân từ backend.`);
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể tải dữ liệu bệnh nhân: ${error.message}`
          : "Không thể tải dữ liệu bệnh nhân."
      );
    } finally {
      setIsLoadingPatients(false);
    }
  }

  async function loadPatientWorkspace(patientId: string) {
    const workspaceTasks = [
      loadPatientFhirPreview(patientId),
      loadPatientFhirBundlePreview(patientId),
      loadEncounters(patientId),
      loadAllergyIntolerances(patientId),
      loadConditions(patientId),
      loadObservations(patientId),
      loadMedicationRequests(patientId),
      loadClinicalDocuments(patientId),
      loadConsents(patientId)
    ];

    if (canReadAudit) {
      workspaceTasks.push(loadAuditEvents(patientId, { silent: true }));
    } else {
      setAuditEvents([]);
    }

    await Promise.all(workspaceTasks);
  }

  async function loadEncounters(patientId: string, nextSelectedEncounterId?: string) {
    setIsLoadingEncounters(true);

    try {
      const response = await fetch(`${apiBaseUrl}/patients/${patientId}/encounters`, {
        headers: buildHeaders("TREATMENT")
      });

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      const data = (await response.json()) as EncountersResponse;
      setEncounters(data.items);
      setSelectedEncounterId(nextSelectedEncounterId ?? data.items[0]?.id);
    } catch (error) {
      setEncounters([]);
      setSelectedEncounterId(undefined);
      setStatusMessage(
        error instanceof Error
          ? `Không thể tải lượt khám: ${error.message}`
          : "Không thể tải lượt khám."
      );
    } finally {
      setIsLoadingEncounters(false);
    }
  }

  async function loadClinicalDocuments(patientId: string, nextSelectedDocumentId?: string) {
    setIsLoadingDocuments(true);

    try {
      const response = await fetch(`${apiBaseUrl}/patients/${patientId}/documents`, {
        headers: buildHeaders("TREATMENT")
      });

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      const data = (await response.json()) as ClinicalDocumentsResponse;
      setClinicalDocuments(data.items);
      setSelectedDocumentId(nextSelectedDocumentId ?? data.items[0]?.id);
    } catch (error) {
      setClinicalDocuments([]);
      setSelectedDocumentId(undefined);
      setStatusMessage(
        error instanceof Error
          ? `Không thể tải tài liệu bệnh án: ${error.message}`
          : "Không thể tải tài liệu bệnh án."
      );
    } finally {
      setIsLoadingDocuments(false);
    }
  }

  async function loadAllergyIntolerances(
    patientId: string,
    nextSelectedAllergyIntoleranceId?: string
  ) {
    setIsLoadingAllergyIntolerances(true);

    try {
      const response = await fetch(`${apiBaseUrl}/patients/${patientId}/allergy-intolerances`, {
        headers: buildHeaders("TREATMENT")
      });

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      const data = (await response.json()) as AllergyIntolerancesResponse;
      setAllergyIntolerances(data.items);
      setSelectedAllergyIntoleranceId(nextSelectedAllergyIntoleranceId ?? data.items[0]?.id);
    } catch (error) {
      setAllergyIntolerances([]);
      setSelectedAllergyIntoleranceId(undefined);
      setStatusMessage(
        error instanceof Error
          ? `Không thể tải dị ứng/cảnh báo: ${error.message}`
          : "Không thể tải dị ứng/cảnh báo."
      );
    } finally {
      setIsLoadingAllergyIntolerances(false);
    }
  }

  async function loadConditions(patientId: string, nextSelectedConditionId?: string) {
    setIsLoadingConditions(true);

    try {
      const response = await fetch(`${apiBaseUrl}/patients/${patientId}/conditions`, {
        headers: buildHeaders("TREATMENT")
      });

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      const data = (await response.json()) as ConditionsResponse;
      setConditions(data.items);
      setSelectedConditionId(nextSelectedConditionId ?? data.items[0]?.id);
    } catch (error) {
      setConditions([]);
      setSelectedConditionId(undefined);
      setStatusMessage(
        error instanceof Error
          ? `Không thể tải chẩn đoán/vấn đề sức khỏe: ${error.message}`
          : "Không thể tải chẩn đoán/vấn đề sức khỏe."
      );
    } finally {
      setIsLoadingConditions(false);
    }
  }

  async function loadObservations(patientId: string, nextSelectedObservationId?: string) {
    setIsLoadingObservations(true);

    try {
      const response = await fetch(`${apiBaseUrl}/patients/${patientId}/observations`, {
        headers: buildHeaders("TREATMENT")
      });

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      const data = (await response.json()) as ObservationsResponse;
      setObservations(data.items);
      setSelectedObservationId(nextSelectedObservationId ?? data.items[0]?.id);
    } catch (error) {
      setObservations([]);
      setSelectedObservationId(undefined);
      setStatusMessage(
        error instanceof Error
          ? `Không thể tải chỉ số lâm sàng: ${error.message}`
          : "Không thể tải chỉ số lâm sàng."
      );
    } finally {
      setIsLoadingObservations(false);
    }
  }

  async function loadMedicationRequests(
    patientId: string,
    nextSelectedMedicationRequestId?: string
  ) {
    setIsLoadingMedicationRequests(true);

    try {
      const response = await fetch(`${apiBaseUrl}/patients/${patientId}/medication-requests`, {
        headers: buildHeaders("TREATMENT")
      });

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      const data = (await response.json()) as MedicationRequestsResponse;
      setMedicationRequests(data.items);
      setSelectedMedicationRequestId(nextSelectedMedicationRequestId ?? data.items[0]?.id);
    } catch (error) {
      setMedicationRequests([]);
      setSelectedMedicationRequestId(undefined);
      setStatusMessage(
        error instanceof Error
          ? `Không thể tải chỉ định thuốc: ${error.message}`
          : "Không thể tải chỉ định thuốc."
      );
    } finally {
      setIsLoadingMedicationRequests(false);
    }
  }

  async function loadAuditEvents(patientId: string, options: { readonly silent?: boolean } = {}) {
    if (!canReadAudit) {
      setAuditEvents([]);

      if (!options.silent) {
        setStatusMessage("Nhật ký kiểm toán chỉ mở cho vai trò kiểm toán hoặc quản trị.");
      }

      return;
    }

    setIsLoadingAuditEvents(true);

    try {
      const response = await fetch(`${apiBaseUrl}/patients/${patientId}/audit-events`, {
        headers: buildHeaders("AUDIT")
      });

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      const data = (await response.json()) as AuditEventsResponse;
      setAuditEvents(data.items);
    } catch (error) {
      setAuditEvents([]);
      setStatusMessage(
        error instanceof Error
          ? `Không thể tải nhật ký kiểm toán: ${error.message}`
          : "Không thể tải nhật ký kiểm toán."
      );
    } finally {
      setIsLoadingAuditEvents(false);
    }
  }

  async function loadConsents(patientId: string) {
    setIsLoadingConsents(true);

    try {
      const response = await fetch(`${apiBaseUrl}/patients/${patientId}/consents`, {
        headers: buildHeaders("TREATMENT")
      });

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      const data = (await response.json()) as ConsentsResponse;
      setConsents(data.items);
    } catch (error) {
      setConsents([]);
      setStatusMessage(
        error instanceof Error
          ? `Không thể tải consent chia sẻ hồ sơ: ${error.message}`
          : "Không thể tải consent chia sẻ hồ sơ."
      );
    } finally {
      setIsLoadingConsents(false);
    }
  }

  async function loadPatientFhirPreview(patientId: string) {
    try {
      const response = await fetch(`${apiBaseUrl}/patients/${patientId}/fhir`, {
        headers: buildHeaders("TREATMENT")
      });

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      setPatientFhirPreview(await response.json());
    } catch (error) {
      setPatientFhirPreview({
        error:
          error instanceof Error
            ? `Không thể xuất FHIR Patient: ${error.message}`
            : "Không thể xuất FHIR Patient."
      });
    }
  }

  async function loadPatientFhirBundlePreview(patientId: string) {
    try {
      const response = await fetch(`${apiBaseUrl}/patients/${patientId}/fhir-bundle`, {
        headers: buildHeaders("TREATMENT", {
          "x-consent-reference": defaultTransferContext.consentReference,
          "x-recipient-organization-id": defaultTransferContext.recipientOrganizationId
        })
      });

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      setPatientFhirBundlePreview(await response.json());
    } catch (error) {
      setPatientFhirBundlePreview({
        error:
          error instanceof Error
            ? `Không thể xuất FHIR Bundle hồ sơ bệnh nhân: ${error.message}`
            : "Không thể xuất FHIR Bundle hồ sơ bệnh nhân."
      });
    }
  }

  async function loadEncounterFhirPreview(encounterId: string) {
    try {
      const response = await fetch(`${apiBaseUrl}/encounters/${encounterId}/fhir`, {
        headers: buildHeaders("TREATMENT")
      });

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      setEncounterFhirPreview(await response.json());
    } catch (error) {
      setEncounterFhirPreview({
        error:
          error instanceof Error
            ? `Không thể xuất FHIR Encounter: ${error.message}`
            : "Không thể xuất FHIR Encounter."
      });
    }
  }

  async function loadDocumentFhirPreview(documentId: string) {
    try {
      const response = await fetch(`${apiBaseUrl}/clinical-documents/${documentId}/fhir`, {
        headers: buildHeaders("TREATMENT")
      });

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      setDocumentFhirPreview(await response.json());
    } catch (error) {
      setDocumentFhirPreview({
        error:
          error instanceof Error
            ? `Không thể xuất FHIR DocumentReference: ${error.message}`
            : "Không thể xuất FHIR DocumentReference."
      });
    }
  }

  async function loadConditionFhirPreview(conditionId: string) {
    try {
      const response = await fetch(`${apiBaseUrl}/conditions/${conditionId}/fhir`, {
        headers: buildHeaders("TREATMENT")
      });

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      setConditionFhirPreview(await response.json());
    } catch (error) {
      setConditionFhirPreview({
        error:
          error instanceof Error
            ? `Không thể xuất FHIR Condition: ${error.message}`
            : "Không thể xuất FHIR Condition."
      });
    }
  }

  async function loadAllergyIntoleranceFhirPreview(allergyIntoleranceId: string) {
    try {
      const response = await fetch(`${apiBaseUrl}/allergy-intolerances/${allergyIntoleranceId}/fhir`, {
        headers: buildHeaders("TREATMENT")
      });

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      setAllergyIntoleranceFhirPreview(await response.json());
    } catch (error) {
      setAllergyIntoleranceFhirPreview({
        error:
          error instanceof Error
            ? `Không thể xuất FHIR AllergyIntolerance: ${error.message}`
            : "Không thể xuất FHIR AllergyIntolerance."
      });
    }
  }

  async function loadObservationFhirPreview(observationId: string) {
    try {
      const response = await fetch(`${apiBaseUrl}/observations/${observationId}/fhir`, {
        headers: buildHeaders("TREATMENT")
      });

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      setObservationFhirPreview(await response.json());
    } catch (error) {
      setObservationFhirPreview({
        error:
          error instanceof Error
            ? `Không thể xuất FHIR Observation: ${error.message}`
            : "Không thể xuất FHIR Observation."
      });
    }
  }

  async function loadMedicationRequestFhirPreview(medicationRequestId: string) {
    try {
      const response = await fetch(`${apiBaseUrl}/medication-requests/${medicationRequestId}/fhir`, {
        headers: buildHeaders("TREATMENT")
      });

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      setMedicationRequestFhirPreview(await response.json());
    } catch (error) {
      setMedicationRequestFhirPreview({
        error:
          error instanceof Error
            ? `Không thể xuất FHIR MedicationRequest: ${error.message}`
            : "Không thể xuất FHIR MedicationRequest."
      });
    }
  }

  async function handleLogin(event?: FormEvent<HTMLFormElement>) {
    const shouldOpenLoginOnFailure = !event;

    event?.preventDefault();

    if (!loginForm.username.trim() || !loginForm.password.trim()) {
      setLoginError("Vui lòng nhập tài khoản và mật khẩu demo.");
      return;
    }

    try {
      setLoginError(undefined);
      setStatusMessage("Đang xác thực phiên đăng nhập...");

      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(loginForm)
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => undefined);
        throw new Error(payload?.message ?? payload?.error ?? `API trả về HTTP ${response.status}`);
      }

      const session = (await response.json()) as AuthSession;
      setAuthSession(session);
      setIsAuthenticated(true);
      setAppRoute(session.actor.role === "auditor" ? "audit" : "dashboard");
      setStatusMessage(
        `Đã đăng nhập ${session.actor.displayName}; phiên hết hạn ${formatDateTime(session.expiresAt)}.`
      );
    } catch (error) {
      setLoginError(
        error instanceof Error ? error.message : "Không thể đăng nhập phiên demo."
      );
      setStatusMessage("Đăng nhập thất bại.");

      if (shouldOpenLoginOnFailure) {
        setAppRoute("login");
      }
    }
  }

  function handleLogout() {
    setAuthSession(undefined);
    setIsAuthenticated(false);
    setAppRoute("landing");
    setStatusMessage("Đã đăng xuất khỏi phiên demo.");
    setPatients([]);
    setEncounters([]);
    setClinicalDocuments([]);
    setAllergyIntolerances([]);
    setConditions([]);
    setObservations([]);
    setMedicationRequests([]);
    setAuditEvents([]);
    setConsents([]);
    setPatientFhirPreview(undefined);
    setPatientFhirBundlePreview(undefined);
    setEncounterFhirPreview(undefined);
    setDocumentFhirPreview(undefined);
    setAllergyIntoleranceFhirPreview(undefined);
    setConditionFhirPreview(undefined);
    setObservationFhirPreview(undefined);
    setMedicationRequestFhirPreview(undefined);
    setSelectedPatientId(undefined);
    setSelectedEncounterId(undefined);
    setSelectedDocumentId(undefined);
    setSelectedAllergyIntoleranceId(undefined);
    setSelectedConditionId(undefined);
    setSelectedObservationId(undefined);
    setSelectedMedicationRequestId(undefined);
  }

  async function handleCreatePatient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmittingPatient(true);

    const identifiers: PatientIdentifier[] = [
      {
        system: "urn:gov:vietnam:national-id",
        value: patientForm.nationalId,
        type: "national-id"
      },
      {
        system: "urn:benh-vien-so:mrn",
        value: patientForm.hospitalMrn,
        type: "hospital-mrn"
      }
    ];

    try {
      const response = await fetch(`${apiBaseUrl}/patients`, {
        method: "POST",
        headers: buildHeaders("TREATMENT", {
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({
          identifiers,
          fullName: patientForm.fullName,
          birthDate: patientForm.birthDate || undefined,
          gender: patientForm.gender,
          address: patientForm.address || undefined,
          phone: patientForm.phone || undefined,
          managingOrganizationId: patientForm.managingOrganizationId
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => undefined);
        throw new Error(payload?.message ?? payload?.error ?? `API trả về HTTP ${response.status}`);
      }

      const createdPatient = (await response.json()) as Patient;
      await loadPatients(createdPatient.id);
      setAppRoute("workspace");
      setStatusMessage(`Đã tạo hồ sơ ${createdPatient.fullName} và chọn ngay trên workspace.`);
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể tạo hồ sơ bệnh nhân: ${error.message}`
          : "Không thể tạo hồ sơ bệnh nhân."
      );
    } finally {
      setIsSubmittingPatient(false);
    }
  }

  async function handleCreateEncounter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedPatient) {
      setStatusMessage("Cần chọn bệnh nhân trước khi mở lượt khám.");
      return;
    }

    setIsSubmittingEncounter(true);

    try {
      const response = await fetch(`${apiBaseUrl}/patients/${selectedPatient.id}/encounters`, {
        method: "POST",
        headers: buildHeaders("TREATMENT", {
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({
          class: encounterForm.class,
          serviceType: encounterForm.serviceType,
          reasonText: encounterForm.reasonText,
          departmentId: encounterForm.departmentId || undefined,
          attendingPractitionerId: encounterForm.attendingPractitionerId,
          startedAt: toApiDateTime(encounterForm.startedAt)
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => undefined);
        throw new Error(payload?.message ?? payload?.error ?? `API trả về HTTP ${response.status}`);
      }

      const createdEncounter = (await response.json()) as Encounter;
      await loadEncounters(selectedPatient.id, createdEncounter.id);
      await loadAuditEvents(selectedPatient.id, { silent: true });
      setAppRoute("workspace");
      setStatusMessage(`Đã mở lượt khám "${createdEncounter.serviceType}" cho ${selectedPatient.fullName}.`);
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể mở lượt khám: ${error.message}`
          : "Không thể mở lượt khám."
      );
    } finally {
      setIsSubmittingEncounter(false);
    }
  }

  async function handleFinishEncounter(encounterId: string) {
    if (!selectedPatient) {
      return;
    }

    setIsFinishingEncounter(true);

    try {
      const response = await fetch(`${apiBaseUrl}/encounters/${encounterId}/finish`, {
        method: "POST",
        headers: buildHeaders("TREATMENT")
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => undefined);
        throw new Error(payload?.message ?? payload?.error ?? `API trả về HTTP ${response.status}`);
      }

      const finishedEncounter = (await response.json()) as Encounter;
      await loadEncounters(selectedPatient.id, finishedEncounter.id);
      await loadEncounterFhirPreview(finishedEncounter.id);
      await loadAuditEvents(selectedPatient.id, { silent: true });
      setStatusMessage(`Đã kết thúc lượt khám "${finishedEncounter.serviceType}".`);
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể kết thúc lượt khám: ${error.message}`
          : "Không thể kết thúc lượt khám."
      );
    } finally {
      setIsFinishingEncounter(false);
    }
  }

  async function handleCreateAllergyIntolerance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedPatient) {
      setStatusMessage("Cần chọn bệnh nhân trước khi ghi nhận dị ứng/cảnh báo.");
      return;
    }

    const hasReaction =
      allergyIntoleranceForm.manifestationCode.trim() ||
      allergyIntoleranceForm.manifestationDisplay.trim() ||
      allergyIntoleranceForm.reactionDescription.trim();

    setIsSubmittingAllergyIntolerance(true);

    try {
      const response = await fetch(`${apiBaseUrl}/patients/${selectedPatient.id}/allergy-intolerances`, {
        method: "POST",
        headers: buildHeaders("TREATMENT", {
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({
          encounterId: allergyIntoleranceForm.encounterId || undefined,
          clinicalStatus: allergyIntoleranceForm.clinicalStatus,
          verificationStatus: allergyIntoleranceForm.verificationStatus,
          type: allergyIntoleranceForm.type,
          category: allergyIntoleranceForm.category,
          criticality: allergyIntoleranceForm.criticality || undefined,
          code: {
            system: allergyIntoleranceForm.codeSystem,
            code: allergyIntoleranceForm.code,
            display: allergyIntoleranceForm.codeDisplay
          },
          reaction: hasReaction
            ? {
                manifestation: {
                  system: allergyIntoleranceForm.manifestationSystem,
                  code: allergyIntoleranceForm.manifestationCode,
                  display: allergyIntoleranceForm.manifestationDisplay
                },
                severity: allergyIntoleranceForm.reactionSeverity || undefined,
                description: allergyIntoleranceForm.reactionDescription || undefined
              }
            : undefined,
          recordedAt: allergyIntoleranceForm.recordedAt
            ? toApiDateTime(allergyIntoleranceForm.recordedAt)
            : undefined,
          recorderPractitionerId: allergyIntoleranceForm.recorderPractitionerId,
          note: allergyIntoleranceForm.note || undefined
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => undefined);
        throw new Error(payload?.message ?? payload?.error ?? `API trả về HTTP ${response.status}`);
      }

      const createdAllergyIntolerance = (await response.json()) as AllergyIntolerance;
      await loadAllergyIntolerances(selectedPatient.id, createdAllergyIntolerance.id);
      await loadPatientFhirBundlePreview(selectedPatient.id);
      await loadAuditEvents(selectedPatient.id, { silent: true });
      setAppRoute("workspace");
      setStatusMessage(
        `Đã ghi nhận dị ứng/cảnh báo "${createdAllergyIntolerance.code.display}" cho ${selectedPatient.fullName}.`
      );
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể ghi nhận dị ứng/cảnh báo: ${error.message}`
          : "Không thể ghi nhận dị ứng/cảnh báo."
      );
    } finally {
      setIsSubmittingAllergyIntolerance(false);
    }
  }

  async function handleCreateCondition(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedPatient) {
      setStatusMessage("Cần chọn bệnh nhân trước khi ghi nhận chẩn đoán.");
      return;
    }

    setIsSubmittingCondition(true);

    try {
      const response = await fetch(`${apiBaseUrl}/patients/${selectedPatient.id}/conditions`, {
        method: "POST",
        headers: buildHeaders("TREATMENT", {
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({
          encounterId: conditionForm.encounterId || undefined,
          clinicalStatus: conditionForm.clinicalStatus,
          verificationStatus: conditionForm.verificationStatus,
          category: conditionForm.category,
          code: {
            system: conditionForm.codeSystem,
            code: conditionForm.code,
            display: conditionForm.codeDisplay
          },
          severity: conditionForm.severity || undefined,
          onsetAt: conditionForm.onsetAt ? toApiDateTime(conditionForm.onsetAt) : undefined,
          recorderPractitionerId: conditionForm.recorderPractitionerId,
          note: conditionForm.note || undefined
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => undefined);
        throw new Error(payload?.message ?? payload?.error ?? `API trả về HTTP ${response.status}`);
      }

      const createdCondition = (await response.json()) as Condition;
      await loadConditions(selectedPatient.id, createdCondition.id);
      await loadPatientFhirBundlePreview(selectedPatient.id);
      await loadAuditEvents(selectedPatient.id, { silent: true });
      setAppRoute("workspace");
      setStatusMessage(`Đã ghi nhận chẩn đoán "${createdCondition.code.display}" cho ${selectedPatient.fullName}.`);
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể ghi nhận chẩn đoán: ${error.message}`
          : "Không thể ghi nhận chẩn đoán."
      );
    } finally {
      setIsSubmittingCondition(false);
    }
  }

  async function handleCreateObservation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedPatient) {
      setStatusMessage("Cần chọn bệnh nhân trước khi ghi nhận chỉ số lâm sàng.");
      return;
    }

    const numericValue = Number(observationForm.value);

    if (!Number.isFinite(numericValue)) {
      setStatusMessage("Giá trị chỉ số phải là số hợp lệ.");
      return;
    }

    setIsSubmittingObservation(true);

    try {
      const response = await fetch(`${apiBaseUrl}/patients/${selectedPatient.id}/observations`, {
        method: "POST",
        headers: buildHeaders("TREATMENT", {
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({
          encounterId: observationForm.encounterId || undefined,
          category: observationForm.category,
          code: {
            system: observationForm.codeSystem,
            code: observationForm.code,
            display: observationForm.codeDisplay
          },
          effectiveAt: toApiDateTime(observationForm.effectiveAt),
          valueQuantity: {
            value: numericValue,
            unit: observationForm.unit,
            system: observationForm.unitSystem || undefined,
            code: observationForm.unitCode || undefined
          },
          performerPractitionerId: observationForm.performerPractitionerId || undefined
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => undefined);
        throw new Error(payload?.message ?? payload?.error ?? `API trả về HTTP ${response.status}`);
      }

      const createdObservation = (await response.json()) as Observation;
      await loadObservations(selectedPatient.id, createdObservation.id);
      await loadPatientFhirBundlePreview(selectedPatient.id);
      await loadAuditEvents(selectedPatient.id, { silent: true });
      setAppRoute("workspace");
      setStatusMessage(`Đã ghi nhận "${createdObservation.code.display}" cho ${selectedPatient.fullName}.`);
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể ghi nhận chỉ số lâm sàng: ${error.message}`
          : "Không thể ghi nhận chỉ số lâm sàng."
      );
    } finally {
      setIsSubmittingObservation(false);
    }
  }

  async function handleCreateMedicationRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedPatient) {
      setStatusMessage("Cần chọn bệnh nhân trước khi kê/chỉ định thuốc.");
      return;
    }

    const doseValue = Number(medicationRequestForm.doseValue);
    const frequency = Number(medicationRequestForm.frequency);
    const period = Number(medicationRequestForm.period);
    const expectedSupplyDurationDays = Number(
      medicationRequestForm.expectedSupplyDurationDays
    );

    if (!Number.isFinite(doseValue) || doseValue <= 0) {
      setStatusMessage("Liều lượng thuốc phải là số lớn hơn 0.");
      return;
    }

    if (!Number.isFinite(frequency) || frequency <= 0 || !Number.isFinite(period) || period <= 0) {
      setStatusMessage("Nhịp dùng thuốc phải có tần suất và chu kỳ lớn hơn 0.");
      return;
    }

    if (
      medicationRequestForm.expectedSupplyDurationDays &&
      (!Number.isFinite(expectedSupplyDurationDays) || expectedSupplyDurationDays <= 0)
    ) {
      setStatusMessage("Số ngày cấp thuốc phải là số lớn hơn 0.");
      return;
    }

    setIsSubmittingMedicationRequest(true);

    try {
      const response = await fetch(`${apiBaseUrl}/patients/${selectedPatient.id}/medication-requests`, {
        method: "POST",
        headers: buildHeaders("TREATMENT", {
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({
          encounterId: medicationRequestForm.encounterId || undefined,
          reasonConditionId: medicationRequestForm.reasonConditionId || undefined,
          category: medicationRequestForm.category,
          priority: medicationRequestForm.priority,
          medicationCode: {
            system: medicationRequestForm.medicationSystem,
            code: medicationRequestForm.medicationCode,
            display: medicationRequestForm.medicationDisplay
          },
          dosageInstruction: {
            text: medicationRequestForm.dosageText,
            route: medicationRequestForm.route || undefined,
            doseQuantity: {
              value: doseValue,
              unit: medicationRequestForm.doseUnit,
              system: "http://unitsofmeasure.org",
              code: medicationRequestForm.doseUnit
            },
            frequency,
            period,
            periodUnit: medicationRequestForm.periodUnit
          },
          authoredOn: medicationRequestForm.authoredOn
            ? toApiDateTime(medicationRequestForm.authoredOn)
            : undefined,
          requesterPractitionerId: medicationRequestForm.requesterPractitionerId,
          expectedSupplyDurationDays: medicationRequestForm.expectedSupplyDurationDays
            ? expectedSupplyDurationDays
            : undefined,
          note: medicationRequestForm.note || undefined
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => undefined);
        throw new Error(payload?.message ?? payload?.error ?? `API trả về HTTP ${response.status}`);
      }

      const createdMedicationRequest = (await response.json()) as MedicationRequest;
      await loadMedicationRequests(selectedPatient.id, createdMedicationRequest.id);
      await loadPatientFhirBundlePreview(selectedPatient.id);
      await loadAuditEvents(selectedPatient.id, { silent: true });
      setAppRoute("workspace");
      setStatusMessage(
        `Đã ghi nhận chỉ định thuốc "${createdMedicationRequest.medicationCode.display}" cho ${selectedPatient.fullName}.`
      );
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể ghi nhận chỉ định thuốc: ${error.message}`
          : "Không thể ghi nhận chỉ định thuốc."
      );
    } finally {
      setIsSubmittingMedicationRequest(false);
    }
  }

  async function handleCreateClinicalDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedPatient) {
      setStatusMessage("Cần chọn bệnh nhân trước khi tạo tài liệu bệnh án.");
      return;
    }

    setIsSubmittingDocument(true);

    try {
      const response = await fetch(`${apiBaseUrl}/patients/${selectedPatient.id}/documents`, {
        method: "POST",
        headers: buildHeaders("TREATMENT", {
          "Content-Type": "application/json"
        }),
        body: JSON.stringify({
          encounterId: documentForm.encounterId || undefined,
          type: documentForm.type,
          title: documentForm.title,
          storageUri: documentForm.storageUri.replace("/current/", `/${selectedPatient.id}/`),
          authorPractitionerId: documentForm.authorPractitionerId
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => undefined);
        throw new Error(payload?.message ?? payload?.error ?? `API trả về HTTP ${response.status}`);
      }

      const createdDocument = (await response.json()) as ClinicalDocument;
      await loadClinicalDocuments(selectedPatient.id, createdDocument.id);
      await loadAuditEvents(selectedPatient.id, { silent: true });
      setAppRoute("documents");
      setStatusMessage(`Đã tạo tài liệu "${createdDocument.title}" ở trạng thái nháp.`);
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể tạo tài liệu bệnh án: ${error.message}`
          : "Không thể tạo tài liệu bệnh án."
      );
    } finally {
      setIsSubmittingDocument(false);
    }
  }

  async function handleSignClinicalDocument(documentId: string) {
    setIsSigningDocument(true);

    try {
      const response = await fetch(`${apiBaseUrl}/clinical-documents/${documentId}/sign`, {
        method: "POST",
        headers: buildHeaders("TREATMENT")
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => undefined);
        throw new Error(payload?.message ?? payload?.error ?? `API trả về HTTP ${response.status}`);
      }

      const signedDocument = (await response.json()) as ClinicalDocument;
      await loadClinicalDocuments(signedDocument.patientId, signedDocument.id);
      await loadDocumentFhirPreview(signedDocument.id);
      await loadAuditEvents(signedDocument.patientId, { silent: true });
      setStatusMessage(`Đã ký tài liệu "${signedDocument.title}".`);
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể ký tài liệu bệnh án: ${error.message}`
          : "Không thể ký tài liệu bệnh án."
      );
    } finally {
      setIsSigningDocument(false);
    }
  }

  if (!isAuthenticated) {
    if (appRoute === "login") {
      return (
        <LoginPage
          form={loginForm}
          error={loginError}
          onBack={() => setAppRoute("landing")}
          onChange={setLoginForm}
          onSubmit={handleLogin}
        />
      );
    }

    return <LandingPage onDemo={() => void handleLogin()} onLogin={() => setAppRoute("login")} />;
  }

  return (
    <AuthenticatedLayout
      apiBaseUrl={apiBaseUrl}
      currentRoute={appRoute}
      userRole={authSession?.actor.role ?? loginForm.role}
      userName={authSession?.actor.displayName ?? loginForm.username}
      onLogout={handleLogout}
      onNavigate={setAppRoute}
      statusMessage={statusMessage}
    >
      {renderCurrentRoute()}
    </AuthenticatedLayout>
  );

  function renderCurrentRoute(): ReactNode {
    if (appRoute === "workspace") {
      return renderWorkspacePage();
    }

    if (appRoute === "documents") {
      return renderDocumentsPage();
    }

    if (appRoute === "audit") {
      return renderAuditPage();
    }

    if (appRoute === "interop") {
      return renderInteropPage();
    }

    if (appRoute === "settings") {
      return renderSettingsPage();
    }

    return renderDashboardPage();
  }

  function renderDashboardPage(): ReactNode {
    return (
      <div className="page-stack">
        <PageHeader
          eyebrow="Dashboard"
          title="Tổng quan vận hành bệnh án điện tử"
          description="Màn hình dành cho đầu ca làm việc: xem nhanh hồ sơ, lượt khám mở, tài liệu chờ ký và trạng thái liên thông."
        />

        <section className="metric-grid">
          <MetricCard label="Bệnh nhân" value={`${patients.length}`} note="Hồ sơ trong registry demo" />
          <MetricCard label="Lượt khám mở" value={`${openEncounters.length}`} note="Theo bệnh nhân đang chọn" />
          <MetricCard label="Dị ứng" value={`${allergyIntolerances.length}`} note="Cảnh báo an toàn" />
          <MetricCard label="Chẩn đoán" value={`${conditions.length}`} note="Vấn đề sức khỏe có cấu trúc" />
          <MetricCard label="Chỉ định thuốc" value={`${medicationRequests.length}`} note="FHIR MedicationRequest" />
          <MetricCard label="Tài liệu nháp" value={`${draftDocuments.length}`} note="Cần ký/xác thực" />
        </section>

        <section className="dashboard-grid">
          <article className="panel command-panel">
            <div>
              <p className="eyebrow">Today queue</p>
              <h2>Việc nên xử lý tiếp</h2>
            </div>
            <div className="queue-list">
              <button type="button" onClick={() => setAppRoute("workspace")}>
                <strong>Mở patient workspace</strong>
                <span>Xem hồ sơ, lượt khám và tài liệu đang gắn với bệnh nhân.</span>
              </button>
              <button type="button" onClick={() => setAppRoute("documents")}>
                <strong>Kiểm tra tài liệu chờ ký</strong>
                <span>{draftDocuments.length} tài liệu đang ở trạng thái nháp.</span>
              </button>
              <button type="button" onClick={() => setAppRoute("interop")}>
                <strong>Xem gói FHIR</strong>
                <span>Patient, Encounter, AllergyIntolerance, Condition, Observation, MedicationRequest và DocumentReference đã có preview.</span>
              </button>
            </div>
          </article>

          <article className="panel">
            <p className="eyebrow">Selected chart</p>
            <h2>{selectedPatient?.fullName ?? "Chưa chọn bệnh nhân"}</h2>
            {selectedPatient ? (
              <div className="detail-grid compact">
                <Info label="MRN" value={selectedPatient.identifiers[0]?.value ?? selectedPatient.id} />
                <Info label="Lượt khám gần nhất" value={encounters[0]?.serviceType ?? "Chưa có"} />
                <Info label="Dị ứng/cảnh báo" value={`${allergyIntolerances.length}`} />
                <Info label="Chẩn đoán/vấn đề" value={`${conditions.length}`} />
                <Info label="Chỉ số lâm sàng" value={`${observations.length}`} />
                <Info label="Chỉ định thuốc" value={`${medicationRequests.length}`} />
                <Info label="Tài liệu" value={`${clinicalDocuments.length}`} />
                <Info label="Cập nhật" value={formatDateTime(selectedPatient.updatedAt)} />
              </div>
            ) : (
              <p className="empty-state">Chưa có dữ liệu bệnh nhân để hiển thị.</p>
            )}
          </article>
        </section>
      </div>
    );
  }

  function renderWorkspacePage(): ReactNode {
    return (
      <div className="page-stack">
        <PageHeader
          eyebrow="Patient Workspace"
          title="Bàn làm việc bệnh nhân"
          description="Luồng chính mô phỏng EMR thật: chọn bệnh nhân, mở lượt khám, gắn tài liệu và theo dõi hồ sơ."
        />

        <section className="workspace">
          {renderPatientListPanel()}
          {renderPatientDetailPanel()}
          {renderEncounterPanel()}
          {renderAllergyIntolerancePanel()}
          {renderConditionPanel()}
          {renderObservationPanel()}
          {renderMedicationRequestPanel()}
          {renderCreatePatientPanel()}
        </section>
      </div>
    );
  }

  function renderDocumentsPage(): ReactNode {
    return (
      <div className="page-stack">
        <PageHeader
          eyebrow="Document Center"
          title="Trung tâm tài liệu bệnh án"
          description="Tổ chức tài liệu theo danh mục gần với OpenEMR: CCR/CCDA, hồ sơ bệnh án, xét nghiệm, thông tin bệnh nhân và tài liệu FHIR export."
        />

        <section className="workspace">
          {renderPatientListPanel()}
          {renderDocumentPanel()}
          <FhirPanel title="FHIR DocumentReference JSON" badge="DocumentReference" value={documentFhirPreview} />
        </section>
      </div>
    );
  }

  function renderAuditPage(): ReactNode {
    return (
      <div className="page-stack">
        <PageHeader
          eyebrow="Audit"
          title="Nhật ký truy cập và kiểm toán"
          description="Mỗi lần xem FHIR, mở lượt khám, tạo/ký tài liệu đều được ghi log với actor, mục đích sử dụng và tài nguyên liên quan."
        />

        <section className="workspace">
          {renderAuditPanel()}
          <article className="panel">
            <p className="eyebrow">Policy note</p>
            <h2>Ranh giới demo</h2>
            <ul className="milestone-list">
              <li>Giao diện đã dùng phiên Bearer token nội bộ, chưa phải IAM/SSO bệnh viện thật.</li>
              <li>API chặn quyền cơ bản: điều trị thao tác hồ sơ, kiểm toán xem nhật ký, quản trị có quyền giám sát.</li>
              <li>Khi lên sản phẩm thật cần thêm SSO/MFA, consent, chữ ký số và log bất biến.</li>
            </ul>
          </article>
        </section>
      </div>
    );
  }

  function renderInteropPage(): ReactNode {
    return (
      <div className="page-stack">
        <PageHeader
          eyebrow="Interop"
          title="FHIR và hướng liên thông bệnh viện"
          description="Màn này gom các biểu diễn FHIR hiện có để chuẩn bị cho luồng gửi sang HAPI FHIR hoặc hệ thống bệnh viện khác."
        />

        <section className="workflow-strip" aria-label="Luồng liên thông">
          {workflowSteps.map((item, index) => (
            <div className="workflow-step" key={item}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{item}</strong>
            </div>
          ))}
        </section>

        <section className="workspace">
          <FhirPanel title="FHIR Patient JSON" badge="Patient" value={patientFhirPreview} />
          <FhirPanel title="FHIR Patient Record Bundle JSON" badge="Bundle" value={patientFhirBundlePreview} />
          <FhirPanel title="FHIR Encounter JSON" badge="Encounter" value={encounterFhirPreview} />
          <FhirPanel title="FHIR AllergyIntolerance JSON" badge="AllergyIntolerance" value={allergyIntoleranceFhirPreview} />
          <FhirPanel title="FHIR Condition JSON" badge="Condition" value={conditionFhirPreview} />
          <FhirPanel title="FHIR Observation JSON" badge="Observation" value={observationFhirPreview} />
          <FhirPanel title="FHIR MedicationRequest JSON" badge="MedicationRequest" value={medicationRequestFhirPreview} />
          <FhirPanel title="FHIR DocumentReference JSON" badge="DocumentReference" value={documentFhirPreview} />
          {renderConsentInteropPanel()}
          <article className="panel dark-panel">
            <p className="eyebrow">Reference map</p>
            <h2>Chuẩn đang bám theo</h2>
            <div className="reference-list">
              {referenceSignals.map((reference) => (
                <div key={reference.name}>
                  <strong>{reference.name}</strong>
                  <span>{reference.value}</span>
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
    );
  }

  function renderSettingsPage(): ReactNode {
    return (
      <div className="page-stack">
        <PageHeader
          eyebrow="Settings"
          title="Cấu hình demo và đường nâng cấp"
          description="Trang này cố ý ghi rõ phần nào là demo, phần nào cần triển khai thật để tránh nhầm với hệ thống bệnh viện hoàn chỉnh."
        />

        <section className="settings-grid">
          <article className="panel">
            <p className="eyebrow">Session</p>
            <h2>Phiên hiện tại</h2>
            <div className="detail-grid compact">
              <Info label="Người dùng" value={authSession?.actor.displayName ?? loginForm.username} />
              <Info label="Mã actor" value={authSession?.actor.actorId ?? "Chưa xác thực"} />
              <Info label="Vai trò demo" value={formatDemoRole(authSession?.actor.role ?? loginForm.role)} />
              <Info label="API" value={apiBaseUrl} />
              <Info label="Phiên hết hạn" value={authSession ? formatDateTime(authSession.expiresAt) : "Chưa có"} />
              <Info label="Mục đích" value="Bearer token + PurposeOfUse" />
            </div>
          </article>
          <article className="panel">
            <p className="eyebrow">Roadmap</p>
            <h2>Cần làm thật sau skeleton</h2>
            <ul className="milestone-list">
              <li>Thêm IAM/SSO thật thay cho đăng nhập demo.</li>
              <li>Bổ sung role matrix chi tiết theo bác sĩ, điều dưỡng, văn thư, kiểm toán, quản trị.</li>
              <li>Thêm consent, chữ ký số, luồng gửi nhận FHIR Bundle.</li>
              <li>Tách cấu hình cơ sở y tế, khoa/phòng, mã định danh và danh mục tài liệu.</li>
            </ul>
          </article>
        </section>
      </div>
    );
  }

  function renderPatientListPanel(): ReactNode {
    return (
      <article className="panel patient-list">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Registry</p>
            <h2>Danh sách bệnh nhân</h2>
          </div>
          <button
            className="ghost-button"
            type="button"
            onClick={() => void loadPatients()}
            disabled={isLoadingPatients}
          >
            {isLoadingPatients ? "Đang tải..." : "Tải lại"}
          </button>
        </div>

        <div className="patient-cards">
          {patients.map((patient) => (
            <button
              className={patient.id === selectedPatientId ? "patient-card selected" : "patient-card"}
              key={patient.id}
              type="button"
              onClick={() => setSelectedPatientId(patient.id)}
            >
              <span>{patient.identifiers[0]?.value ?? patient.id}</span>
              <strong>{patient.fullName}</strong>
              <small>{patient.address ?? "Chưa có địa chỉ"}</small>
            </button>
          ))}
        </div>
      </article>
    );
  }

  function renderConsentInteropPanel(): ReactNode {
    return (
      <article className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Transfer consent</p>
            <h2>Căn cứ chia sẻ hồ sơ</h2>
          </div>
          <span className="pill cyan">{isLoadingConsents ? "loading" : `${consents.length} consent`}</span>
        </div>

        <div className="detail-grid compact">
          <Info label="Consent dùng để xuất Bundle" value={defaultTransferContext.consentReference} />
          <Info label="Đơn vị nhận" value={defaultTransferContext.recipientOrganizationId} />
        </div>

        <div className="reference-list">
          {consents.map((consent) => (
            <div key={consent.id}>
              <strong>
                {consent.id} · {formatConsentStatus(consent.status)}
              </strong>
              <span>
                {formatConsentCategory(consent.category)} cho {consent.granteeOrganizationId}, hiệu lực từ{" "}
                {formatDateTime(consent.validFrom)}
                {consent.validUntil ? ` đến ${formatDateTime(consent.validUntil)}` : ""}
              </span>
            </div>
          ))}
          {consents.length === 0 ? (
            <p className="empty-state">
              Chưa có consent hợp lệ trong workspace này; FHIR Bundle liên viện sẽ bị API chặn nếu thiếu consent.
            </p>
          ) : null}
        </div>
      </article>
    );
  }

  function renderPatientDetailPanel(): ReactNode {
    return (
      <article className="panel patient-detail">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Patient chart</p>
            <h2>Hồ sơ đang chọn</h2>
          </div>
          {selectedPatient ? <span className="pill">{selectedPatient.status}</span> : null}
        </div>

        {selectedPatient ? (
          <div className="detail-grid">
            <Info label="Họ tên" value={selectedPatient.fullName} />
            <Info label="Ngày sinh" value={selectedPatient.birthDate ?? "Chưa có"} />
            <Info label="Giới tính" value={formatGender(selectedPatient.gender)} />
            <Info label="Điện thoại" value={selectedPatient.phone ?? "Chưa có"} />
            <Info label="Cơ sở quản lý" value={selectedPatient.managingOrganizationId} />
            <Info label="Cập nhật" value={formatDateTime(selectedPatient.updatedAt)} />
            <div className="identifiers">
              <span>Định danh</span>
              {selectedPatient.identifiers.map((identifier) => (
                <code key={`${identifier.system}:${identifier.value}`}>
                  {formatIdentifierType(identifier.type)} · {identifier.value}
                </code>
              ))}
            </div>
          </div>
        ) : (
          <p className="empty-state">Chưa có bệnh nhân nào để hiển thị.</p>
        )}
      </article>
    );
  }

  function renderEncounterPanel(): ReactNode {
    return (
      <article className="panel encounter-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Encounter timeline</p>
            <h2>Lượt khám và đợt điều trị</h2>
          </div>
          <span className="pill cyan">{isLoadingEncounters ? "loading" : `${encounters.length} lượt`}</span>
        </div>

        <div className="encounter-layout">
          <div className="timeline">
            {encounters.map((encounter) => (
              <button
                className={encounter.id === selectedEncounterId ? "timeline-item selected" : "timeline-item"}
                key={encounter.id}
                type="button"
                onClick={() => setSelectedEncounterId(encounter.id)}
              >
                <span>{formatDateTime(encounter.startedAt)}</span>
                <strong>{encounter.serviceType}</strong>
                <small>
                  {formatEncounterClass(encounter.class)} · {formatEncounterStatus(encounter.status)}
                </small>
              </button>
            ))}
            {encounters.length === 0 ? (
              <p className="empty-state">Chưa có lượt khám nào cho bệnh nhân này.</p>
            ) : null}
          </div>

          <div className="encounter-summary">
            {selectedEncounter ? (
              <>
                <div className="document-meta">
                  <Info label="Lý do khám" value={selectedEncounter.reasonText} />
                  <Info label="Khoa/phòng" value={selectedEncounter.departmentId ?? "Chưa gắn"} />
                  <Info label="Nhân sự phụ trách" value={selectedEncounter.attendingPractitionerId} />
                  <Info label="Dị ứng gắn lượt khám" value={`${selectedEncounterAllergyIntolerances.length}`} />
                  <Info label="Chẩn đoán gắn lượt khám" value={`${selectedEncounterConditions.length}`} />
                  <Info label="Chỉ số gắn lượt khám" value={`${selectedEncounterObservations.length}`} />
                  <Info label="Thuốc gắn lượt khám" value={`${selectedEncounterMedicationRequests.length}`} />
                  <Info label="Tài liệu gắn lượt khám" value={`${selectedEncounterDocuments.length}`} />
                </div>
                <div className="action-row">
                  <button
                    className="primary-button"
                    type="button"
                    disabled={selectedEncounter.status !== "in-progress" || isFinishingEncounter}
                    onClick={() => void handleFinishEncounter(selectedEncounter.id)}
                  >
                    {isFinishingEncounter ? "Đang kết thúc..." : "Kết thúc lượt khám"}
                  </button>
                </div>
              </>
            ) : (
              <p className="empty-state">Chọn một lượt khám để xem chi tiết và xuất FHIR Encounter.</p>
            )}
          </div>
        </div>

        <form className="encounter-form" onSubmit={(event) => void handleCreateEncounter(event)}>
          <label>
            Loại lượt khám
            <select
              value={encounterForm.class}
              onChange={(event) =>
                setEncounterForm({ ...encounterForm, class: event.target.value as EncounterClass })
              }
            >
              <option value="ambulatory">Ngoại trú</option>
              <option value="inpatient">Nội trú</option>
              <option value="emergency">Cấp cứu</option>
              <option value="virtual">Khám từ xa</option>
            </select>
          </label>
          <label>
            Dịch vụ/khoa khám
            <input
              value={encounterForm.serviceType}
              onChange={(event) => setEncounterForm({ ...encounterForm, serviceType: event.target.value })}
            />
          </label>
          <label className="wide-field">
            Lý do khám
            <input
              value={encounterForm.reasonText}
              onChange={(event) => setEncounterForm({ ...encounterForm, reasonText: event.target.value })}
            />
          </label>
          <label>
            Khoa/phòng
            <input
              value={encounterForm.departmentId}
              onChange={(event) => setEncounterForm({ ...encounterForm, departmentId: event.target.value })}
            />
          </label>
          <label>
            Nhân sự phụ trách
            <input
              value={encounterForm.attendingPractitionerId}
              onChange={(event) =>
                setEncounterForm({ ...encounterForm, attendingPractitionerId: event.target.value })
              }
            />
          </label>
          <label className="wide-field">
            Thời điểm bắt đầu
            <input
              type="datetime-local"
              value={encounterForm.startedAt}
              onChange={(event) => setEncounterForm({ ...encounterForm, startedAt: event.target.value })}
            />
          </label>
          <button className="primary-button" type="submit" disabled={!selectedPatient || isSubmittingEncounter}>
            {isSubmittingEncounter ? "Đang mở..." : "Mở lượt khám"}
          </button>
        </form>
      </article>
    );
  }

  function renderAllergyIntolerancePanel(): ReactNode {
    return (
      <article className="panel allergy-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Allergy safety</p>
            <h2>Dị ứng và cảnh báo an toàn</h2>
          </div>
          <span className="pill cyan">
            {isLoadingAllergyIntolerances ? "loading" : `${allergyIntolerances.length} cảnh báo`}
          </span>
        </div>

        <div className="document-layout">
          <div className="allergy-cards">
            {allergyIntolerances.map((allergyIntolerance) => (
              <button
                className={
                  allergyIntolerance.id === selectedAllergyIntoleranceId
                    ? "allergy-card selected"
                    : "allergy-card"
                }
                key={allergyIntolerance.id}
                type="button"
                onClick={() => setSelectedAllergyIntoleranceId(allergyIntolerance.id)}
              >
                <span>{formatAllergyCategory(allergyIntolerance.category)}</span>
                <strong>{allergyIntolerance.code.display}</strong>
                <small>
                  {formatAllergyCriticality(allergyIntolerance.criticality)} ·{" "}
                  {formatDateTime(allergyIntolerance.recordedAt)}
                </small>
              </button>
            ))}
            {allergyIntolerances.length === 0 ? (
              <p className="empty-state">
                Chưa có dị ứng/cảnh báo có cấu trúc. Khi kê thuốc, đây là vùng cần kiểm tra trước tiên.
              </p>
            ) : null}
          </div>

          <div className="allergy-summary">
            {selectedAllergyIntolerance ? (
              <>
                <div className="document-meta">
                  <Info label="Tác nhân" value={selectedAllergyIntolerance.code.display} />
                  <Info label="Loại" value={formatAllergyType(selectedAllergyIntolerance.type)} />
                  <Info label="Nhóm" value={formatAllergyCategory(selectedAllergyIntolerance.category)} />
                  <Info label="Mức cảnh báo" value={formatAllergyCriticality(selectedAllergyIntolerance.criticality)} />
                  <Info label="Lâm sàng" value={formatAllergyClinicalStatus(selectedAllergyIntolerance.clinicalStatus)} />
                  <Info label="Xác minh" value={formatAllergyVerificationStatus(selectedAllergyIntolerance.verificationStatus)} />
                  <Info label="Biểu hiện" value={selectedAllergyIntolerance.reaction?.manifestation.display ?? "Chưa ghi"} />
                  <Info label="Encounter" value={selectedAllergyIntolerance.encounterId ?? "Chưa gắn"} />
                </div>
                <p className="empty-state">
                  AllergyIntolerance giúp hệ thống cảnh báo trước khi kê thuốc hoặc chuyển hồ sơ, tránh để dị ứng chỉ nằm trong ghi chú tự do.
                </p>
              </>
            ) : (
              <p className="empty-state">Chọn một dị ứng/cảnh báo để xem metadata và xuất FHIR AllergyIntolerance.</p>
            )}
          </div>
        </div>

        <form className="allergy-form" onSubmit={(event) => void handleCreateAllergyIntolerance(event)}>
          <label>
            Gắn với lượt khám
            <select
              value={allergyIntoleranceForm.encounterId}
              onChange={(event) =>
                setAllergyIntoleranceForm({ ...allergyIntoleranceForm, encounterId: event.target.value })
              }
            >
              <option value="">Không gắn</option>
              {encounters.map((encounter) => (
                <option key={encounter.id} value={encounter.id}>
                  {encounter.serviceType} · {formatDateTime(encounter.startedAt)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Loại
            <select
              value={allergyIntoleranceForm.type}
              onChange={(event) =>
                setAllergyIntoleranceForm({ ...allergyIntoleranceForm, type: event.target.value as AllergyType })
              }
            >
              <option value="allergy">Dị ứng</option>
              <option value="intolerance">Không dung nạp</option>
            </select>
          </label>
          <label>
            Nhóm
            <select
              value={allergyIntoleranceForm.category}
              onChange={(event) =>
                setAllergyIntoleranceForm({
                  ...allergyIntoleranceForm,
                  category: event.target.value as AllergyCategory
                })
              }
            >
              <option value="medication">Thuốc</option>
              <option value="food">Thực phẩm</option>
              <option value="environment">Môi trường</option>
              <option value="biologic">Sinh phẩm</option>
            </select>
          </label>
          <label>
            Mức cảnh báo
            <select
              value={allergyIntoleranceForm.criticality}
              onChange={(event) =>
                setAllergyIntoleranceForm({
                  ...allergyIntoleranceForm,
                  criticality: event.target.value as "" | AllergyCriticality
                })
              }
            >
              <option value="">Chưa đánh giá</option>
              <option value="low">Thấp</option>
              <option value="high">Cao</option>
              <option value="unable-to-assess">Chưa thể đánh giá</option>
            </select>
          </label>
          <label>
            Trạng thái lâm sàng
            <select
              value={allergyIntoleranceForm.clinicalStatus}
              onChange={(event) =>
                setAllergyIntoleranceForm({
                  ...allergyIntoleranceForm,
                  clinicalStatus: event.target.value as AllergyClinicalStatus
                })
              }
            >
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Không hoạt động</option>
              <option value="resolved">Đã giải quyết</option>
            </select>
          </label>
          <label>
            Trạng thái xác minh
            <select
              value={allergyIntoleranceForm.verificationStatus}
              onChange={(event) =>
                setAllergyIntoleranceForm({
                  ...allergyIntoleranceForm,
                  verificationStatus: event.target.value as AllergyVerificationStatus
                })
              }
            >
              <option value="confirmed">Đã xác nhận</option>
              <option value="unconfirmed">Chưa xác nhận</option>
              <option value="refuted">Đã loại trừ</option>
              <option value="entered-in-error">Nhập lỗi</option>
            </select>
          </label>
          <label>
            Hệ mã tác nhân
            <input
              value={allergyIntoleranceForm.codeSystem}
              onChange={(event) =>
                setAllergyIntoleranceForm({ ...allergyIntoleranceForm, codeSystem: event.target.value })
              }
            />
          </label>
          <label>
            Mã tác nhân
            <input
              value={allergyIntoleranceForm.code}
              onChange={(event) =>
                setAllergyIntoleranceForm({ ...allergyIntoleranceForm, code: event.target.value })
              }
            />
          </label>
          <label className="wide-field">
            Tên tác nhân
            <input
              value={allergyIntoleranceForm.codeDisplay}
              onChange={(event) =>
                setAllergyIntoleranceForm({ ...allergyIntoleranceForm, codeDisplay: event.target.value })
              }
            />
          </label>
          <label>
            Mã biểu hiện
            <input
              value={allergyIntoleranceForm.manifestationCode}
              onChange={(event) =>
                setAllergyIntoleranceForm({
                  ...allergyIntoleranceForm,
                  manifestationCode: event.target.value
                })
              }
            />
          </label>
          <label className="wide-field">
            Biểu hiện phản ứng
            <input
              value={allergyIntoleranceForm.manifestationDisplay}
              onChange={(event) =>
                setAllergyIntoleranceForm({
                  ...allergyIntoleranceForm,
                  manifestationDisplay: event.target.value
                })
              }
            />
          </label>
          <label>
            Mức độ phản ứng
            <select
              value={allergyIntoleranceForm.reactionSeverity}
              onChange={(event) =>
                setAllergyIntoleranceForm({
                  ...allergyIntoleranceForm,
                  reactionSeverity: event.target.value as "" | AllergyReactionSeverity
                })
              }
            >
              <option value="">Chưa ghi</option>
              <option value="mild">Nhẹ</option>
              <option value="moderate">Trung bình</option>
              <option value="severe">Nặng</option>
            </select>
          </label>
          <label>
            Thời điểm ghi nhận
            <input
              type="datetime-local"
              value={allergyIntoleranceForm.recordedAt}
              onChange={(event) =>
                setAllergyIntoleranceForm({ ...allergyIntoleranceForm, recordedAt: event.target.value })
              }
            />
          </label>
          <label className="wide-field">
            Người ghi nhận
            <input
              value={allergyIntoleranceForm.recorderPractitionerId}
              onChange={(event) =>
                setAllergyIntoleranceForm({
                  ...allergyIntoleranceForm,
                  recorderPractitionerId: event.target.value
                })
              }
            />
          </label>
          <label className="wide-field">
            Mô tả phản ứng
            <input
              value={allergyIntoleranceForm.reactionDescription}
              onChange={(event) =>
                setAllergyIntoleranceForm({
                  ...allergyIntoleranceForm,
                  reactionDescription: event.target.value
                })
              }
            />
          </label>
          <label className="wide-field">
            Ghi chú
            <input
              value={allergyIntoleranceForm.note}
              onChange={(event) =>
                setAllergyIntoleranceForm({ ...allergyIntoleranceForm, note: event.target.value })
              }
            />
          </label>
          <button
            className="primary-button"
            type="submit"
            disabled={!selectedPatient || isSubmittingAllergyIntolerance}
          >
            {isSubmittingAllergyIntolerance ? "Đang ghi nhận..." : "Ghi nhận dị ứng/cảnh báo"}
          </button>
        </form>
      </article>
    );
  }

  function renderConditionPanel(): ReactNode {
    return (
      <article className="panel condition-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Conditions</p>
            <h2>Chẩn đoán và vấn đề sức khỏe</h2>
          </div>
          <span className="pill cyan">{isLoadingConditions ? "loading" : `${conditions.length} chẩn đoán`}</span>
        </div>

        <div className="document-layout">
          <div className="condition-cards">
            {conditions.map((condition) => (
              <button
                className={condition.id === selectedConditionId ? "condition-card selected" : "condition-card"}
                key={condition.id}
                type="button"
                onClick={() => setSelectedConditionId(condition.id)}
              >
                <span>{formatConditionCategory(condition.category)}</span>
                <strong>{condition.code.display}</strong>
                <small>
                  {formatConditionClinicalStatus(condition.clinicalStatus)} ·{" "}
                  {formatDateTime(condition.recordedAt)}
                </small>
              </button>
            ))}
            {conditions.length === 0 ? (
              <p className="empty-state">
                Bệnh nhân này chưa có chẩn đoán có cấu trúc. Hãy ghi nhận vấn đề sức khỏe đầu tiên.
              </p>
            ) : null}
          </div>

          <div className="condition-summary">
            {selectedCondition ? (
              <>
                <div className="document-meta">
                  <Info label="Nhóm" value={formatConditionCategory(selectedCondition.category)} />
                  <Info label="Lâm sàng" value={formatConditionClinicalStatus(selectedCondition.clinicalStatus)} />
                  <Info label="Xác minh" value={formatConditionVerificationStatus(selectedCondition.verificationStatus)} />
                  <Info label="Mã chuẩn" value={`${selectedCondition.code.system} · ${selectedCondition.code.code}`} />
                  <Info label="Mức độ" value={selectedCondition.severity ? formatConditionSeverity(selectedCondition.severity) : "Chưa gắn"} />
                  <Info label="Encounter" value={selectedCondition.encounterId ?? "Chưa gắn"} />
                </div>
                <p className="empty-state">
                  Condition giúp bên nhận hiểu chẩn đoán/vấn đề sức khỏe ở dạng có cấu trúc, thay vì chỉ đọc thủ công trong file PDF.
                </p>
              </>
            ) : (
              <p className="empty-state">Chọn một chẩn đoán để xem metadata và xuất FHIR Condition.</p>
            )}
          </div>
        </div>

        <form className="condition-form" onSubmit={(event) => void handleCreateCondition(event)}>
          <label>
            Gắn với lượt khám
            <select
              value={conditionForm.encounterId}
              onChange={(event) => setConditionForm({ ...conditionForm, encounterId: event.target.value })}
            >
              <option value="">Không gắn</option>
              {encounters.map((encounter) => (
                <option key={encounter.id} value={encounter.id}>
                  {encounter.serviceType} · {formatDateTime(encounter.startedAt)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Loại chẩn đoán
            <select
              value={conditionForm.category}
              onChange={(event) =>
                setConditionForm({ ...conditionForm, category: event.target.value as ConditionCategory })
              }
            >
              <option value="encounter-diagnosis">Chẩn đoán theo lượt khám</option>
              <option value="problem-list-item">Vấn đề sức khỏe dài hạn</option>
            </select>
          </label>
          <label>
            Trạng thái lâm sàng
            <select
              value={conditionForm.clinicalStatus}
              onChange={(event) =>
                setConditionForm({ ...conditionForm, clinicalStatus: event.target.value as ConditionClinicalStatus })
              }
            >
              <option value="active">Đang hoạt động</option>
              <option value="recurrence">Tái phát</option>
              <option value="relapse">Diễn tiến lại</option>
              <option value="inactive">Không hoạt động</option>
              <option value="remission">Thuyên giảm</option>
              <option value="resolved">Đã giải quyết</option>
            </select>
          </label>
          <label>
            Trạng thái xác minh
            <select
              value={conditionForm.verificationStatus}
              onChange={(event) =>
                setConditionForm({
                  ...conditionForm,
                  verificationStatus: event.target.value as ConditionVerificationStatus
                })
              }
            >
              <option value="confirmed">Đã xác nhận</option>
              <option value="provisional">Tạm thời</option>
              <option value="differential">Chẩn đoán phân biệt</option>
              <option value="unconfirmed">Chưa xác nhận</option>
              <option value="refuted">Đã loại trừ</option>
              <option value="entered-in-error">Nhập lỗi</option>
            </select>
          </label>
          <label>
            Hệ mã
            <input
              value={conditionForm.codeSystem}
              onChange={(event) => setConditionForm({ ...conditionForm, codeSystem: event.target.value })}
            />
          </label>
          <label>
            Mã chẩn đoán
            <input
              value={conditionForm.code}
              onChange={(event) => setConditionForm({ ...conditionForm, code: event.target.value })}
            />
          </label>
          <label className="wide-field">
            Tên chẩn đoán
            <input
              value={conditionForm.codeDisplay}
              onChange={(event) => setConditionForm({ ...conditionForm, codeDisplay: event.target.value })}
            />
          </label>
          <label>
            Mức độ
            <select
              value={conditionForm.severity}
              onChange={(event) =>
                setConditionForm({ ...conditionForm, severity: event.target.value as "" | ConditionSeverity })
              }
            >
              <option value="">Chưa gắn</option>
              <option value="mild">Nhẹ</option>
              <option value="moderate">Trung bình</option>
              <option value="severe">Nặng</option>
            </select>
          </label>
          <label>
            Thời điểm khởi phát
            <input
              type="datetime-local"
              value={conditionForm.onsetAt}
              onChange={(event) => setConditionForm({ ...conditionForm, onsetAt: event.target.value })}
            />
          </label>
          <label className="wide-field">
            Nhân sự ghi nhận
            <input
              value={conditionForm.recorderPractitionerId}
              onChange={(event) =>
                setConditionForm({ ...conditionForm, recorderPractitionerId: event.target.value })
              }
            />
          </label>
          <label className="wide-field">
            Ghi chú
            <input
              value={conditionForm.note}
              onChange={(event) => setConditionForm({ ...conditionForm, note: event.target.value })}
            />
          </label>
          <button className="primary-button" type="submit" disabled={!selectedPatient || isSubmittingCondition}>
            {isSubmittingCondition ? "Đang ghi nhận..." : "Ghi nhận chẩn đoán"}
          </button>
        </form>
      </article>
    );
  }

  function renderObservationPanel(): ReactNode {
    return (
      <article className="panel observation-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Clinical observations</p>
            <h2>Chỉ số lâm sàng và xét nghiệm</h2>
          </div>
          <span className="pill cyan">{isLoadingObservations ? "loading" : `${observations.length} chỉ số`}</span>
        </div>

        <div className="document-layout">
          <div className="observation-cards">
            {observations.map((observation) => (
              <button
                className={observation.id === selectedObservationId ? "observation-card selected" : "observation-card"}
                key={observation.id}
                type="button"
                onClick={() => setSelectedObservationId(observation.id)}
              >
                <span>{formatObservationCategory(observation.category)}</span>
                <strong>{observation.code.display}</strong>
                <small>
                  {formatObservationValue(observation)} · {formatDateTime(observation.effectiveAt)}
                </small>
              </button>
            ))}
            {observations.length === 0 ? (
              <p className="empty-state">
                Bệnh nhân này chưa có chỉ số có cấu trúc. Hãy ghi nhận sinh hiệu hoặc kết quả xét nghiệm đầu tiên.
              </p>
            ) : null}
          </div>

          <div className="observation-summary">
            {selectedObservation ? (
              <>
                <div className="document-meta">
                  <Info label="Nhóm" value={formatObservationCategory(selectedObservation.category)} />
                  <Info label="Trạng thái" value={formatObservationStatus(selectedObservation.status)} />
                  <Info label="Mã chuẩn" value={`${selectedObservation.code.system} · ${selectedObservation.code.code}`} />
                  <Info label="Giá trị" value={formatObservationValue(selectedObservation)} />
                  <Info label="Encounter" value={selectedObservation.encounterId ?? "Chưa gắn"} />
                  <Info label="Người ghi nhận" value={selectedObservation.performerPractitionerId ?? "Chưa gắn"} />
                </div>
                <p className="empty-state">
                  Observation là dữ liệu lâm sàng có cấu trúc; khi xuất Bundle sẽ đi cùng Patient, Encounter và
                  DocumentReference để bên nhận có thể xử lý máy đọc được.
                </p>
              </>
            ) : (
              <p className="empty-state">Chọn một chỉ số để xem metadata và xuất FHIR Observation.</p>
            )}
          </div>
        </div>

        <form className="observation-form" onSubmit={(event) => void handleCreateObservation(event)}>
          <label>
            Gắn với lượt khám
            <select
              value={observationForm.encounterId}
              onChange={(event) => setObservationForm({ ...observationForm, encounterId: event.target.value })}
            >
              <option value="">Không gắn</option>
              {encounters.map((encounter) => (
                <option key={encounter.id} value={encounter.id}>
                  {encounter.serviceType} · {formatDateTime(encounter.startedAt)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Nhóm chỉ số
            <select
              value={observationForm.category}
              onChange={(event) =>
                setObservationForm({ ...observationForm, category: event.target.value as ObservationCategory })
              }
            >
              <option value="laboratory">Xét nghiệm</option>
              <option value="vital-signs">Sinh hiệu</option>
            </select>
          </label>
          <label>
            Hệ mã
            <input
              value={observationForm.codeSystem}
              onChange={(event) => setObservationForm({ ...observationForm, codeSystem: event.target.value })}
            />
          </label>
          <label>
            Mã chỉ số
            <input
              value={observationForm.code}
              onChange={(event) => setObservationForm({ ...observationForm, code: event.target.value })}
            />
          </label>
          <label className="wide-field">
            Tên chỉ số
            <input
              value={observationForm.codeDisplay}
              onChange={(event) => setObservationForm({ ...observationForm, codeDisplay: event.target.value })}
            />
          </label>
          <label>
            Giá trị
            <input
              type="number"
              step="any"
              value={observationForm.value}
              onChange={(event) => setObservationForm({ ...observationForm, value: event.target.value })}
            />
          </label>
          <label>
            Đơn vị
            <input
              value={observationForm.unit}
              onChange={(event) => setObservationForm({ ...observationForm, unit: event.target.value })}
            />
          </label>
          <label>
            Hệ đơn vị
            <input
              value={observationForm.unitSystem}
              onChange={(event) => setObservationForm({ ...observationForm, unitSystem: event.target.value })}
            />
          </label>
          <label>
            Mã đơn vị
            <input
              value={observationForm.unitCode}
              onChange={(event) => setObservationForm({ ...observationForm, unitCode: event.target.value })}
            />
          </label>
          <label>
            Thời điểm ghi nhận
            <input
              type="datetime-local"
              value={observationForm.effectiveAt}
              onChange={(event) => setObservationForm({ ...observationForm, effectiveAt: event.target.value })}
            />
          </label>
          <label>
            Nhân sự ghi nhận
            <input
              value={observationForm.performerPractitionerId}
              onChange={(event) =>
                setObservationForm({ ...observationForm, performerPractitionerId: event.target.value })
              }
            />
          </label>
          <button className="primary-button" type="submit" disabled={!selectedPatient || isSubmittingObservation}>
            {isSubmittingObservation ? "Đang ghi nhận..." : "Ghi nhận chỉ số"}
          </button>
        </form>
      </article>
    );
  }

  function renderMedicationRequestPanel(): ReactNode {
    return (
      <article className="panel medication-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Medication requests</p>
            <h2>Chỉ định thuốc và đơn thuốc</h2>
          </div>
          <span className="pill cyan">
            {isLoadingMedicationRequests ? "loading" : `${medicationRequests.length} chỉ định`}
          </span>
        </div>

        <div className="document-layout">
          <div className="medication-cards">
            {medicationRequests.map((medicationRequest) => (
              <button
                className={
                  medicationRequest.id === selectedMedicationRequestId
                    ? "medication-card selected"
                    : "medication-card"
                }
                key={medicationRequest.id}
                type="button"
                onClick={() => setSelectedMedicationRequestId(medicationRequest.id)}
              >
                <span>{formatMedicationRequestCategory(medicationRequest.category)}</span>
                <strong>{medicationRequest.medicationCode.display}</strong>
                <small>
                  {formatMedicationRequestStatus(medicationRequest.status)} ·{" "}
                  {formatDateTime(medicationRequest.authoredOn)}
                </small>
              </button>
            ))}
            {medicationRequests.length === 0 ? (
              <p className="empty-state">
                Bệnh nhân này chưa có chỉ định thuốc có cấu trúc. Hãy ghi nhận thuốc đầu tiên để Bundle có thêm MedicationRequest.
              </p>
            ) : null}
          </div>

          <div className="medication-summary">
            {selectedMedicationRequest ? (
              <>
                <div className="document-meta">
                  <Info label="Thuốc" value={selectedMedicationRequest.medicationCode.display} />
                  <Info label="Mã thuốc" value={`${selectedMedicationRequest.medicationCode.system} · ${selectedMedicationRequest.medicationCode.code}`} />
                  <Info label="Trạng thái" value={formatMedicationRequestStatus(selectedMedicationRequest.status)} />
                  <Info label="Mục đích" value={formatMedicationRequestIntent(selectedMedicationRequest.intent)} />
                  <Info label="Ưu tiên" value={formatMedicationRequestPriority(selectedMedicationRequest.priority)} />
                  <Info label="Liều dùng" value={formatDosageInstruction(selectedMedicationRequest.dosageInstruction)} />
                  <Info label="Chẩn đoán liên quan" value={selectedMedicationRequest.reasonConditionId ?? "Chưa gắn"} />
                  <Info label="Người kê" value={selectedMedicationRequest.requesterPractitionerId} />
                </div>
                <p className="empty-state">
                  MedicationRequest thể hiện yêu cầu dùng thuốc ở dạng máy đọc được; trong luồng liên viện, nó giúp bên nhận thấy thuốc đang được chỉ định thay vì chỉ đọc trong tài liệu PDF.
                </p>
              </>
            ) : (
              <p className="empty-state">Chọn một chỉ định thuốc để xem metadata và xuất FHIR MedicationRequest.</p>
            )}
          </div>
        </div>

        <form className="medication-form" onSubmit={(event) => void handleCreateMedicationRequest(event)}>
          <label>
            Gắn với lượt khám
            <select
              value={medicationRequestForm.encounterId}
              onChange={(event) =>
                setMedicationRequestForm({ ...medicationRequestForm, encounterId: event.target.value })
              }
            >
              <option value="">Không gắn</option>
              {encounters.map((encounter) => (
                <option key={encounter.id} value={encounter.id}>
                  {encounter.serviceType} · {formatDateTime(encounter.startedAt)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Chẩn đoán liên quan
            <select
              value={medicationRequestForm.reasonConditionId}
              onChange={(event) =>
                setMedicationRequestForm({ ...medicationRequestForm, reasonConditionId: event.target.value })
              }
            >
              <option value="">Không gắn</option>
              {conditions.map((condition) => (
                <option key={condition.id} value={condition.id}>
                  {condition.code.display} · {condition.code.code}
                </option>
              ))}
            </select>
          </label>
          <label>
            Loại chỉ định
            <select
              value={medicationRequestForm.category}
              onChange={(event) =>
                setMedicationRequestForm({
                  ...medicationRequestForm,
                  category: event.target.value as MedicationRequestCategory
                })
              }
            >
              <option value="outpatient">Ngoại trú</option>
              <option value="inpatient">Nội trú</option>
              <option value="community">Cộng đồng</option>
              <option value="discharge">Ra viện</option>
            </select>
          </label>
          <label>
            Ưu tiên
            <select
              value={medicationRequestForm.priority}
              onChange={(event) =>
                setMedicationRequestForm({
                  ...medicationRequestForm,
                  priority: event.target.value as MedicationRequestPriority
                })
              }
            >
              <option value="routine">Thường quy</option>
              <option value="urgent">Khẩn</option>
              <option value="asap">Càng sớm càng tốt</option>
              <option value="stat">Ngay lập tức</option>
            </select>
          </label>
          <label>
            Hệ mã thuốc
            <input
              value={medicationRequestForm.medicationSystem}
              onChange={(event) =>
                setMedicationRequestForm({ ...medicationRequestForm, medicationSystem: event.target.value })
              }
            />
          </label>
          <label>
            Mã thuốc
            <input
              value={medicationRequestForm.medicationCode}
              onChange={(event) =>
                setMedicationRequestForm({ ...medicationRequestForm, medicationCode: event.target.value })
              }
            />
          </label>
          <label className="wide-field">
            Tên thuốc
            <input
              value={medicationRequestForm.medicationDisplay}
              onChange={(event) =>
                setMedicationRequestForm({ ...medicationRequestForm, medicationDisplay: event.target.value })
              }
            />
          </label>
          <label className="wide-field">
            Hướng dẫn dùng
            <input
              value={medicationRequestForm.dosageText}
              onChange={(event) =>
                setMedicationRequestForm({ ...medicationRequestForm, dosageText: event.target.value })
              }
            />
          </label>
          <label>
            Đường dùng
            <input
              value={medicationRequestForm.route}
              onChange={(event) =>
                setMedicationRequestForm({ ...medicationRequestForm, route: event.target.value })
              }
            />
          </label>
          <label>
            Liều lượng
            <input
              type="number"
              step="any"
              value={medicationRequestForm.doseValue}
              onChange={(event) =>
                setMedicationRequestForm({ ...medicationRequestForm, doseValue: event.target.value })
              }
            />
          </label>
          <label>
            Đơn vị liều
            <input
              value={medicationRequestForm.doseUnit}
              onChange={(event) =>
                setMedicationRequestForm({ ...medicationRequestForm, doseUnit: event.target.value })
              }
            />
          </label>
          <label>
            Tần suất
            <input
              type="number"
              value={medicationRequestForm.frequency}
              onChange={(event) =>
                setMedicationRequestForm({ ...medicationRequestForm, frequency: event.target.value })
              }
            />
          </label>
          <label>
            Chu kỳ
            <input
              type="number"
              step="any"
              value={medicationRequestForm.period}
              onChange={(event) =>
                setMedicationRequestForm({ ...medicationRequestForm, period: event.target.value })
              }
            />
          </label>
          <label>
            Đơn vị chu kỳ
            <select
              value={medicationRequestForm.periodUnit}
              onChange={(event) =>
                setMedicationRequestForm({
                  ...medicationRequestForm,
                  periodUnit: event.target.value as MedicationTimingUnit
                })
              }
            >
              <option value="h">Giờ</option>
              <option value="d">Ngày</option>
              <option value="wk">Tuần</option>
            </select>
          </label>
          <label>
            Thời điểm kê
            <input
              type="datetime-local"
              value={medicationRequestForm.authoredOn}
              onChange={(event) =>
                setMedicationRequestForm({ ...medicationRequestForm, authoredOn: event.target.value })
              }
            />
          </label>
          <label>
            Số ngày cấp
            <input
              type="number"
              value={medicationRequestForm.expectedSupplyDurationDays}
              onChange={(event) =>
                setMedicationRequestForm({
                  ...medicationRequestForm,
                  expectedSupplyDurationDays: event.target.value
                })
              }
            />
          </label>
          <label className="wide-field">
            Người kê
            <input
              value={medicationRequestForm.requesterPractitionerId}
              onChange={(event) =>
                setMedicationRequestForm({
                  ...medicationRequestForm,
                  requesterPractitionerId: event.target.value
                })
              }
            />
          </label>
          <label className="wide-field">
            Ghi chú
            <input
              value={medicationRequestForm.note}
              onChange={(event) =>
                setMedicationRequestForm({ ...medicationRequestForm, note: event.target.value })
              }
            />
          </label>
          <button
            className="primary-button"
            type="submit"
            disabled={!selectedPatient || isSubmittingMedicationRequest}
          >
            {isSubmittingMedicationRequest ? "Đang ghi nhận..." : "Ghi nhận chỉ định thuốc"}
          </button>
        </form>
      </article>
    );
  }

  function renderDocumentPanel(): ReactNode {
    return (
      <article className="panel document-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Document center</p>
            <h2>Tài liệu bệnh án</h2>
          </div>
          <span className="pill cyan">{isLoadingDocuments ? "loading" : `${clinicalDocuments.length} docs`}</span>
        </div>

        <div className="taxonomy-strip" aria-label="Phân loại tài liệu tham chiếu OpenEMR">
          {documentTaxonomy.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>

        <div className="document-layout">
          <div className="document-cards">
            {clinicalDocuments.map((document) => (
              <button
                className={document.id === selectedDocumentId ? "document-card selected" : "document-card"}
                key={document.id}
                type="button"
                onClick={() => setSelectedDocumentId(document.id)}
              >
                <span>{formatDocumentType(document.type)}</span>
                <strong>{document.title}</strong>
                <small>
                  {formatDocumentStatus(document.status)} ·{" "}
                  {document.encounterId ? `Encounter ${document.encounterId}` : "Chưa gắn encounter"}
                </small>
              </button>
            ))}
            {clinicalDocuments.length === 0 ? (
              <p className="empty-state">Bệnh nhân này chưa có tài liệu bệnh án.</p>
            ) : null}
          </div>

          <div className="document-summary">
            {selectedDocument ? (
              <>
                <div className="document-meta">
                  <Info label="Loại tài liệu" value={formatDocumentType(selectedDocument.type)} />
                  <Info label="Trạng thái" value={formatDocumentStatus(selectedDocument.status)} />
                  <Info label="Encounter" value={selectedDocument.encounterId ?? "Chưa gắn"} />
                  <Info label="Người tạo" value={selectedDocument.authorPractitionerId} />
                </div>
                <code>{selectedDocument.storageUri}</code>
                <div className="action-row">
                  <button
                    className="primary-button"
                    type="button"
                    disabled={selectedDocument.status !== "draft" || isSigningDocument}
                    onClick={() => void handleSignClinicalDocument(selectedDocument.id)}
                  >
                    {isSigningDocument ? "Đang ký..." : "Ký tài liệu nháp"}
                  </button>
                </div>
              </>
            ) : (
              <p className="empty-state">Chọn một tài liệu để xem metadata và thao tác ký.</p>
            )}
          </div>
        </div>

        <form className="document-form" onSubmit={(event) => void handleCreateClinicalDocument(event)}>
          <label>
            Loại tài liệu
            <select
              value={documentForm.type}
              onChange={(event) =>
                setDocumentForm({ ...documentForm, type: event.target.value as ClinicalDocumentType })
              }
            >
              <option value="referral-letter">Giấy chuyển tuyến</option>
              <option value="discharge-summary">Tóm tắt ra viện</option>
              <option value="lab-report">Kết quả xét nghiệm</option>
              <option value="imaging-report">Kết quả chẩn đoán hình ảnh</option>
              <option value="admission-note">Phiếu nhập viện</option>
              <option value="consent-form">Phiếu đồng ý điều trị</option>
              <option value="advance-directive">Chỉ dẫn chăm sóc trước</option>
              <option value="ccda">CCDA</option>
              <option value="ccr">CCR</option>
              <option value="medical-record">Hồ sơ bệnh án</option>
              <option value="patient-information">Thông tin bệnh nhân</option>
            </select>
          </label>
          <label>
            Gắn với lượt khám
            <select
              value={documentForm.encounterId}
              onChange={(event) => setDocumentForm({ ...documentForm, encounterId: event.target.value })}
            >
              <option value="">Không gắn</option>
              {encounters.map((encounter) => (
                <option key={encounter.id} value={encounter.id}>
                  {encounter.serviceType} · {formatDateTime(encounter.startedAt)}
                </option>
              ))}
            </select>
          </label>
          <label className="wide-field">
            Tiêu đề tài liệu
            <input
              value={documentForm.title}
              onChange={(event) => setDocumentForm({ ...documentForm, title: event.target.value })}
            />
          </label>
          <label className="wide-field">
            URI lưu trữ
            <input
              value={documentForm.storageUri}
              onChange={(event) => setDocumentForm({ ...documentForm, storageUri: event.target.value })}
            />
          </label>
          <label className="wide-field">
            Mã bác sĩ/người tạo
            <input
              value={documentForm.authorPractitionerId}
              onChange={(event) =>
                setDocumentForm({ ...documentForm, authorPractitionerId: event.target.value })
              }
            />
          </label>
          <button className="primary-button" type="submit" disabled={!selectedPatient || isSubmittingDocument}>
            {isSubmittingDocument ? "Đang tạo..." : "Tạo tài liệu bệnh án"}
          </button>
        </form>
      </article>
    );
  }

  function renderAuditPanel(): ReactNode {
    return (
      <article className="panel audit-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Security trace</p>
            <h2>Nhật ký kiểm toán</h2>
          </div>
          <button
            className="ghost-button"
            type="button"
            disabled={!selectedPatient || isLoadingAuditEvents || !canReadAudit}
            onClick={() => selectedPatient && void loadAuditEvents(selectedPatient.id)}
          >
            {isLoadingAuditEvents ? "Đang tải..." : canReadAudit ? "Tải audit" : "Cần quyền kiểm toán"}
          </button>
        </div>

        <div className="audit-list">
          {auditEvents.map((event) => (
            <div className="audit-item" key={event.id ?? `${event.occurredAt}:${event.action}`}>
              <div>
                <span>{formatDateTime(event.occurredAt)}</span>
                <strong>{formatAuditAction(event.action)}</strong>
              </div>
              <div>
                <span>Actor</span>
                <strong>{event.actorId}</strong>
              </div>
              <div>
                <span>Tài nguyên</span>
                <strong>
                  {formatAuditResourceType(event.resourceType)} · {event.resourceId}
                </strong>
              </div>
              <div>
                <span>Mục đích</span>
                <strong>
                  {event.purposeOfUse ?? "Chưa khai báo"}
                  {typeof event.metadata.actorRole === "string" ? ` · ${event.metadata.actorRole}` : ""}
                </strong>
              </div>
            </div>
          ))}
          {auditEvents.length === 0 ? (
            <p className="empty-state">
              {canReadAudit
                ? "Chưa có audit event cho bệnh nhân đang chọn. Hãy xem FHIR, mở lượt khám hoặc ký tài liệu để phát sinh log."
                : "Nhật ký kiểm toán chỉ hiển thị với kiểm toán viên hoặc quản trị viên."}
            </p>
          ) : null}
        </div>
      </article>
    );
  }

  function renderCreatePatientPanel(): ReactNode {
    return (
      <article className="panel create-panel">
        <div>
          <p className="eyebrow">Intake</p>
          <h2>Tạo nhanh hồ sơ mới</h2>
        </div>

        <form className="patient-form" onSubmit={(event) => void handleCreatePatient(event)}>
          <label>
            Họ tên
            <input
              value={patientForm.fullName}
              onChange={(event) => setPatientForm({ ...patientForm, fullName: event.target.value })}
            />
          </label>
          <label>
            Số định danh
            <input
              value={patientForm.nationalId}
              onChange={(event) => setPatientForm({ ...patientForm, nationalId: event.target.value })}
            />
          </label>
          <label>
            Mã hồ sơ bệnh viện
            <input
              value={patientForm.hospitalMrn}
              onChange={(event) => setPatientForm({ ...patientForm, hospitalMrn: event.target.value })}
            />
          </label>
          <label>
            Ngày sinh
            <input
              type="date"
              value={patientForm.birthDate}
              onChange={(event) => setPatientForm({ ...patientForm, birthDate: event.target.value })}
            />
          </label>
          <label>
            Giới tính
            <select
              value={patientForm.gender}
              onChange={(event) => setPatientForm({ ...patientForm, gender: event.target.value as PatientGender })}
            >
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
              <option value="unknown">Chưa rõ</option>
            </select>
          </label>
          <label>
            Điện thoại
            <input
              value={patientForm.phone}
              onChange={(event) => setPatientForm({ ...patientForm, phone: event.target.value })}
            />
          </label>
          <label className="wide-field">
            Địa chỉ
            <input
              value={patientForm.address}
              onChange={(event) => setPatientForm({ ...patientForm, address: event.target.value })}
            />
          </label>
          <label className="wide-field">
            Cơ sở quản lý
            <input
              value={patientForm.managingOrganizationId}
              onChange={(event) =>
                setPatientForm({ ...patientForm, managingOrganizationId: event.target.value })
              }
            />
          </label>
          <button className="primary-button" type="submit" disabled={isSubmittingPatient}>
            {isSubmittingPatient ? "Đang tạo..." : "Tạo hồ sơ bệnh nhân"}
          </button>
        </form>
      </article>
    );
  }
}

function LandingPage({
  onDemo,
  onLogin
}: {
  readonly onDemo: () => void;
  readonly onLogin: () => void;
}) {
  return (
    <main className="marketing-shell">
      <nav className="marketing-nav" aria-label="Điều hướng giới thiệu">
        <strong>WiiiCare Nexus</strong>
        <div>
          <button className="ghost-button" type="button" onClick={onLogin}>
            Đăng nhập
          </button>
          <button className="primary-button" type="button" onClick={onDemo}>
            Vào phiên demo
          </button>
        </div>
      </nav>

      <section className="landing-hero">
        <div>
          <p className="eyebrow">HoLiLiHu · The Wiii Lab</p>
          <h1>Nền tảng bệnh án điện tử mở cho liên thông y tế</h1>
          <p className="lede">
            WiiiCare Nexus mô phỏng lõi EMR hiện đại: hồ sơ bệnh nhân, lượt khám, dị ứng, chẩn đoán,
            chỉ số lâm sàng, chỉ định thuốc, tài liệu bệnh án, audit trail và ánh xạ FHIR để chuẩn bị kết nối giữa các bệnh viện.
          </p>
          <div className="landing-actions">
            <button className="primary-button" type="button" onClick={onLogin}>
              Đăng nhập demo
            </button>
            <button className="ghost-button" type="button" onClick={onDemo}>
              Vào nhanh bằng tài khoản bác sĩ demo
            </button>
          </div>
        </div>
        <aside className="landing-card">
          <span>Product slice</span>
          <strong>Patient → Encounter → AllergyIntolerance → Condition → Observation → MedicationRequest → Document → FHIR</strong>
          <small>Không còn là landing page đơn thuần; app có luồng vận hành sau đăng nhập.</small>
        </aside>
      </section>

      <section className="landing-grid">
        {[
          ["Patient Workspace", "Bàn làm việc theo bệnh nhân, giống nhịp vận hành EMR thật."],
          ["Document Center", "Quản lý CCR, CCDA, hồ sơ bệnh án, xét nghiệm và tài liệu chuyển tuyến."],
          ["Audit & RBAC", "Ghi log truy cập nhạy cảm và kiểm tra quyền theo vai trò demo."],
          ["FHIR Interop", "Xuất Patient, Encounter, AllergyIntolerance, Condition, Observation, MedicationRequest và DocumentReference để chuẩn bị liên thông."]
        ].map(([title, description]) => (
          <article className="panel" key={title}>
            <p className="eyebrow">{title}</p>
            <h2>{title}</h2>
            <p className="empty-state">{description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

function LoginPage({
  error,
  form,
  onBack,
  onChange,
  onSubmit
}: {
  readonly error?: string;
  readonly form: LoginForm;
  readonly onBack: () => void;
  readonly onChange: (form: LoginForm) => void;
  readonly onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <main className="login-shell">
      <section className="login-panel">
        <button className="ghost-button" type="button" onClick={onBack}>
          Quay lại landing
        </button>
        <div>
          <p className="eyebrow">Secure access</p>
          <h1>Đăng nhập WiiiCare Nexus</h1>
          <p className="lede">
            Đây là đăng nhập demo để trình bày luồng sản phẩm. Khi lên sản phẩm thật, lớp này cần
            thay bằng IAM/SSO, MFA, quản lý phiên và chính sách bảo mật đầy đủ.
          </p>
        </div>

        <form className="login-form" onSubmit={onSubmit}>
          <label>
            Tài khoản
            <input
              value={form.username}
              onChange={(event) => onChange({ ...form, username: event.target.value })}
            />
          </label>
          <label>
            Mật khẩu
            <input
              type="password"
              value={form.password}
              onChange={(event) => onChange({ ...form, password: event.target.value })}
            />
          </label>
          <label>
            Vai trò demo
            <select
              value={form.role}
              onChange={(event) => onChange(loginPresets[event.target.value as DemoRole])}
            >
              <option value="clinician">Bác sĩ / điều trị</option>
              <option value="nurse">Điều dưỡng / tiếp nhận</option>
              <option value="auditor">Kiểm toán</option>
              <option value="admin">Quản trị</option>
            </select>
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button className="primary-button" type="submit">
            Đăng nhập demo
          </button>
        </form>
      </section>
    </main>
  );
}

function AuthenticatedLayout({
  apiBaseUrl,
  children,
  currentRoute,
  onLogout,
  onNavigate,
  statusMessage,
  userName,
  userRole
}: {
  readonly apiBaseUrl: string;
  readonly children: ReactNode;
  readonly currentRoute: AppRoute;
  readonly onLogout: () => void;
  readonly onNavigate: (route: AppRoute) => void;
  readonly statusMessage: string;
  readonly userName: string;
  readonly userRole: DemoRole;
}) {
  return (
    <main className="app-layout">
      <aside className="app-sidebar">
        <div className="brand-block">
          <span>WiiiCare</span>
          <strong>Nexus</strong>
        </div>
        <nav className="app-nav" aria-label="Điều hướng ứng dụng">
          {navigationItems.map((item) => (
            <button
              className={currentRoute === item.route ? "selected" : ""}
              key={item.route}
              type="button"
              onClick={() => onNavigate(item.route)}
            >
              <strong>{item.label}</strong>
              <span>{item.hint}</span>
            </button>
          ))}
        </nav>
        <button className="ghost-button logout-button" type="button" onClick={onLogout}>
          Đăng xuất
        </button>
      </aside>

      <section className="app-main">
        <header className="app-topbar">
          <div>
            <span>{apiBaseUrl}</span>
            <strong>{statusMessage}</strong>
          </div>
          <div className="user-chip">
            <span>{formatDemoRole(userRole)}</span>
            <strong>{userName}</strong>
          </div>
        </header>
        {children}
      </section>
    </main>
  );
}

function PageHeader({
  description,
  eyebrow,
  title
}: {
  readonly description: string;
  readonly eyebrow: string;
  readonly title: string;
}) {
  return (
    <section className="page-header">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="lede">{description}</p>
    </section>
  );
}

function MetricCard({
  label,
  note,
  value
}: {
  readonly label: string;
  readonly note: string;
  readonly value: string;
}) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

function FhirPanel({
  title,
  badge,
  value
}: {
  readonly title: string;
  readonly badge: string;
  readonly value: unknown;
}) {
  return (
    <article className="panel fhir-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">FHIR facade</p>
          <h2>{title}</h2>
        </div>
        <span className="pill gold">{badge}</span>
      </div>
      <pre>{JSON.stringify(value ?? { note: "Chọn dữ liệu ở workspace để xuất FHIR." }, null, 2)}</pre>
    </article>
  );
}

function Info({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="info-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function formatDemoRole(role: DemoRole): string {
  const labels: Record<DemoRole, string> = {
    admin: "Quản trị",
    auditor: "Kiểm toán",
    clinician: "Bác sĩ điều trị",
    nurse: "Điều dưỡng tiếp nhận"
  };

  return labels[role];
}

function formatGender(gender: PatientGender): string {
  const labels: Record<PatientGender, string> = {
    male: "Nam",
    female: "Nữ",
    other: "Khác",
    unknown: "Chưa rõ"
  };

  return labels[gender];
}

function formatIdentifierType(type: PatientIdentifierType): string {
  const labels: Record<PatientIdentifierType, string> = {
    "national-id": "Định danh cá nhân",
    "insurance-id": "BHYT",
    "hospital-mrn": "MRN",
    "legacy-id": "Mã cũ"
  };

  return labels[type];
}

function formatEncounterClass(value: EncounterClass): string {
  const labels: Record<EncounterClass, string> = {
    ambulatory: "Ngoại trú",
    inpatient: "Nội trú",
    emergency: "Cấp cứu",
    virtual: "Khám từ xa"
  };

  return labels[value];
}

function formatEncounterStatus(status: EncounterStatus): string {
  const labels: Record<EncounterStatus, string> = {
    planned: "Đã hẹn",
    "in-progress": "Đang mở",
    finished: "Đã kết thúc",
    cancelled: "Đã hủy",
    "entered-in-error": "Nhập lỗi"
  };

  return labels[status];
}

function formatDocumentType(type: ClinicalDocumentType): string {
  const labels: Record<ClinicalDocumentType, string> = {
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
  };

  return labels[type];
}

function formatDocumentStatus(status: ClinicalDocumentStatus): string {
  const labels: Record<ClinicalDocumentStatus, string> = {
    draft: "Bản nháp",
    signed: "Đã ký",
    superseded: "Đã thay thế",
    "entered-in-error": "Nhập lỗi"
  };

  return labels[status];
}

function formatAuditAction(action: AuditAction): string {
  const labels: Record<AuditAction, string> = {
    "patient.list": "Tải danh sách bệnh nhân",
    "patient.create": "Tạo hồ sơ bệnh nhân",
    "patient.read": "Xem hồ sơ bệnh nhân",
    "patient.fhir-export": "Xuất FHIR Patient",
    "patient.fhir-bundle-export": "Xuất FHIR Bundle hồ sơ",
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
    "observation.list": "Tải chỉ số lâm sàng",
    "observation.create": "Ghi nhận chỉ số lâm sàng",
    "observation.read": "Xem chỉ số lâm sàng",
    "observation.fhir-export": "Xuất FHIR Observation",
    "clinical-document.list": "Tải tài liệu bệnh án",
    "clinical-document.create": "Tạo tài liệu bệnh án",
    "clinical-document.sign": "Ký tài liệu bệnh án",
    "clinical-document.fhir-export": "Xuất FHIR DocumentReference",
    "consent.list": "Tải consent chia sẻ hồ sơ",
    "consent.create": "Tạo consent chia sẻ hồ sơ",
    "audit-event.list": "Xem nhật ký kiểm toán"
  };

  return labels[action];
}

function formatAuditResourceType(resourceType: AuditResourceType): string {
  const labels: Record<AuditResourceType, string> = {
    Patient: "Bệnh nhân",
    Encounter: "Lượt khám",
    AllergyIntolerance: "Dị ứng/cảnh báo",
    Condition: "Chẩn đoán",
    MedicationRequest: "Chỉ định thuốc",
    Observation: "Chỉ số lâm sàng",
    ClinicalDocument: "Tài liệu",
    Consent: "Consent",
    AuditEvent: "Audit"
  };

  return labels[resourceType];
}

function formatConsentStatus(status: ConsentStatus): string {
  const labels: Record<ConsentStatus, string> = {
    active: "Đang hiệu lực",
    revoked: "Đã thu hồi",
    expired: "Hết hiệu lực"
  };

  return labels[status];
}

function formatConsentCategory(category: ConsentCategory): string {
  const labels: Record<ConsentCategory, string> = {
    "record-sharing": "Chia sẻ hồ sơ"
  };

  return labels[category];
}

function formatAllergyType(type: AllergyType): string {
  const labels: Record<AllergyType, string> = {
    allergy: "Dị ứng",
    intolerance: "Không dung nạp"
  };

  return labels[type];
}

function formatAllergyCategory(category: AllergyCategory): string {
  const labels: Record<AllergyCategory, string> = {
    biologic: "Sinh phẩm",
    environment: "Môi trường",
    food: "Thực phẩm",
    medication: "Thuốc"
  };

  return labels[category];
}

function formatAllergyCriticality(criticality: AllergyCriticality | undefined): string {
  if (!criticality) {
    return "Chưa đánh giá";
  }

  const labels: Record<AllergyCriticality, string> = {
    high: "Nguy cơ cao",
    low: "Nguy cơ thấp",
    "unable-to-assess": "Chưa thể đánh giá"
  };

  return labels[criticality];
}

function formatAllergyClinicalStatus(status: AllergyClinicalStatus): string {
  const labels: Record<AllergyClinicalStatus, string> = {
    active: "Đang hoạt động",
    inactive: "Không hoạt động",
    resolved: "Đã giải quyết"
  };

  return labels[status];
}

function formatAllergyVerificationStatus(status: AllergyVerificationStatus): string {
  const labels: Record<AllergyVerificationStatus, string> = {
    confirmed: "Đã xác nhận",
    "entered-in-error": "Nhập lỗi",
    refuted: "Đã loại trừ",
    unconfirmed: "Chưa xác nhận"
  };

  return labels[status];
}

function formatConditionCategory(category: ConditionCategory): string {
  const labels: Record<ConditionCategory, string> = {
    "encounter-diagnosis": "Chẩn đoán theo lượt khám",
    "problem-list-item": "Vấn đề sức khỏe dài hạn"
  };

  return labels[category];
}

function formatConditionClinicalStatus(status: ConditionClinicalStatus): string {
  const labels: Record<ConditionClinicalStatus, string> = {
    active: "Đang hoạt động",
    inactive: "Không hoạt động",
    recurrence: "Tái phát",
    relapse: "Diễn tiến lại",
    remission: "Thuyên giảm",
    resolved: "Đã giải quyết"
  };

  return labels[status];
}

function formatConditionVerificationStatus(status: ConditionVerificationStatus): string {
  const labels: Record<ConditionVerificationStatus, string> = {
    confirmed: "Đã xác nhận",
    differential: "Chẩn đoán phân biệt",
    "entered-in-error": "Nhập lỗi",
    provisional: "Tạm thời",
    refuted: "Đã loại trừ",
    unconfirmed: "Chưa xác nhận"
  };

  return labels[status];
}

function formatConditionSeverity(severity: ConditionSeverity): string {
  const labels: Record<ConditionSeverity, string> = {
    mild: "Nhẹ",
    moderate: "Trung bình",
    severe: "Nặng"
  };

  return labels[severity];
}

function formatMedicationRequestCategory(category: MedicationRequestCategory): string {
  const labels: Record<MedicationRequestCategory, string> = {
    community: "Cộng đồng",
    discharge: "Ra viện",
    inpatient: "Nội trú",
    outpatient: "Ngoại trú"
  };

  return labels[category];
}

function formatMedicationRequestStatus(status: MedicationRequestStatus): string {
  const labels: Record<MedicationRequestStatus, string> = {
    active: "Đang hiệu lực",
    cancelled: "Đã hủy",
    completed: "Đã hoàn tất",
    draft: "Bản nháp",
    "entered-in-error": "Nhập lỗi",
    "on-hold": "Tạm giữ",
    stopped: "Đã dừng",
    unknown: "Chưa rõ"
  };

  return labels[status];
}

function formatMedicationRequestIntent(intent: MedicationRequestIntent): string {
  const labels: Record<MedicationRequestIntent, string> = {
    "filler-order": "Lệnh thực hiện",
    "instance-order": "Lệnh dùng cụ thể",
    option: "Tùy chọn",
    order: "Chỉ định",
    "original-order": "Chỉ định gốc",
    plan: "Kế hoạch",
    proposal: "Đề xuất",
    "reflex-order": "Chỉ định phản xạ"
  };

  return labels[intent];
}

function formatMedicationRequestPriority(priority: MedicationRequestPriority): string {
  const labels: Record<MedicationRequestPriority, string> = {
    asap: "Càng sớm càng tốt",
    routine: "Thường quy",
    stat: "Ngay lập tức",
    urgent: "Khẩn"
  };

  return labels[priority];
}

function formatDosageInstruction(dosageInstruction: DosageInstruction): string {
  const dose = dosageInstruction.doseQuantity
    ? `${dosageInstruction.doseQuantity.value} ${dosageInstruction.doseQuantity.unit}`
    : undefined;
  const timing =
    dosageInstruction.frequency && dosageInstruction.period && dosageInstruction.periodUnit
      ? `${dosageInstruction.frequency} lần/${dosageInstruction.period}${dosageInstruction.periodUnit}`
      : undefined;

  return [dosageInstruction.text, dose, timing].filter(Boolean).join(" · ");
}

function formatObservationCategory(category: ObservationCategory): string {
  const labels: Record<ObservationCategory, string> = {
    laboratory: "Xét nghiệm",
    "vital-signs": "Sinh hiệu"
  };

  return labels[category];
}

function formatObservationStatus(status: ObservationStatus): string {
  const labels: Record<ObservationStatus, string> = {
    registered: "Đã đăng ký",
    preliminary: "Sơ bộ",
    final: "Chính thức",
    amended: "Đã hiệu chỉnh",
    cancelled: "Đã hủy",
    "entered-in-error": "Nhập lỗi"
  };

  return labels[status];
}

function formatObservationValue(observation: Observation): string {
  if (observation.valueQuantity) {
    return `${observation.valueQuantity.value} ${observation.valueQuantity.unit}`;
  }

  return observation.valueText ?? "Chưa có giá trị";
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function toApiDateTime(value: string): string {
  return new Date(value).toISOString();
}

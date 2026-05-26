import { FormEvent, useEffect, useState } from "react";

type PatientIdentifierType = "national-id" | "insurance-id" | "hospital-mrn" | "legacy-id";
type PatientGender = "male" | "female" | "other" | "unknown";
type ClinicalDocumentType =
  | "admission-note"
  | "discharge-summary"
  | "lab-report"
  | "imaging-report"
  | "referral-letter"
  | "consent-form";
type ClinicalDocumentStatus = "draft" | "signed" | "superseded" | "entered-in-error";

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

type AuditAction =
  | "patient.list"
  | "patient.create"
  | "patient.read"
  | "patient.fhir-export"
  | "clinical-document.list"
  | "clinical-document.create"
  | "clinical-document.sign"
  | "clinical-document.fhir-export"
  | "audit-event.list";

type AuditResourceType = "Patient" | "ClinicalDocument" | "AuditEvent";

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

type PatientsResponse = {
  readonly items: readonly Patient[];
};

type ClinicalDocumentsResponse = {
  readonly items: readonly ClinicalDocument[];
};

type AuditEventsResponse = {
  readonly items: readonly AuditEvent[];
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

type NewClinicalDocumentForm = {
  encounterId: string;
  type: ClinicalDocumentType;
  title: string;
  storageUri: string;
  authorPractitionerId: string;
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

const defaultClinicalDocumentForm: NewClinicalDocumentForm = {
  encounterId: "encounter-demo-002",
  type: "referral-letter",
  title: "Giấy chuyển tuyến điện tử - Hải Phòng",
  storageUri: "s3://wiiicare-demo/patients/current/referral-letter.pdf",
  authorPractitionerId: "practitioner-demo-003"
};

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ??
  (window.location.port === "7311" ? "http://localhost:7310/api/v1" : "/api/v1");

const treatmentAuditHeaders = {
  "x-actor-id": "practitioner-demo-001",
  "x-purpose-of-use": "TREATMENT"
};

const auditReviewHeaders = {
  "x-actor-id": "security-officer-demo",
  "x-purpose-of-use": "AUDIT"
};

const referenceSignals = [
  {
    name: "OpenEMR",
    value: "Luồng bệnh nhân, encounter, tài liệu và FHIR API"
  },
  {
    name: "HAPI FHIR",
    value: "FHIR R4 server, round-trip resource và CapabilityStatement"
  },
  {
    name: "Orthanc",
    value: "PACS/DICOMweb, EMR chỉ giữ metadata ảnh"
  },
  {
    name: "Vietsens HIS",
    value: "Thuật ngữ/luồng HIS nội địa: viện phí, BHYT, chỉ định dịch vụ"
  }
];

const nextMilestones = [
  "Encounter/Treatment: một lần khám hoặc đợt điều trị gắn với bệnh nhân",
  "Audit Event: ghi lại ai xem/sửa/ký/chia sẻ hồ sơ",
  "Interop: đẩy Patient/DocumentReference sang HAPI FHIR",
  "Imaging: liên kết metadata ảnh từ Orthanc, không lưu DICOM trong EMR",
  "Consent: kiểm soát đồng ý chia sẻ khi chuyển hồ sơ giữa bệnh viện"
];

export function App() {
  const [patients, setPatients] = useState<readonly Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>();
  const [clinicalDocuments, setClinicalDocuments] = useState<readonly ClinicalDocument[]>([]);
  const [auditEvents, setAuditEvents] = useState<readonly AuditEvent[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>();
  const [patientFhirPreview, setPatientFhirPreview] = useState<unknown>();
  const [documentFhirPreview, setDocumentFhirPreview] = useState<unknown>();
  const [patientForm, setPatientForm] = useState<NewPatientForm>(defaultPatientForm);
  const [documentForm, setDocumentForm] =
    useState<NewClinicalDocumentForm>(defaultClinicalDocumentForm);
  const [statusMessage, setStatusMessage] = useState("Đang kết nối API...");
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [isLoadingAuditEvents, setIsLoadingAuditEvents] = useState(false);
  const [isSubmittingPatient, setIsSubmittingPatient] = useState(false);
  const [isSubmittingDocument, setIsSubmittingDocument] = useState(false);
  const [isSigningDocument, setIsSigningDocument] = useState(false);

  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId);
  const selectedDocument = clinicalDocuments.find((document) => document.id === selectedDocumentId);

  useEffect(() => {
    void loadPatients();
  }, []);

  useEffect(() => {
    if (!selectedPatientId) {
      setPatientFhirPreview(undefined);
      setClinicalDocuments([]);
      setAuditEvents([]);
      setSelectedDocumentId(undefined);
      return;
    }

    void loadPatientFhirPreview(selectedPatientId);
    void loadClinicalDocuments(selectedPatientId);
    void loadAuditEvents(selectedPatientId);
  }, [selectedPatientId]);

  useEffect(() => {
    if (!selectedDocumentId) {
      setDocumentFhirPreview(undefined);
      return;
    }

    void loadDocumentFhirPreview(selectedDocumentId);
  }, [selectedDocumentId]);

  async function loadPatients(nextSelectedId?: string) {
    setIsLoadingPatients(true);

    try {
      const response = await fetch(`${apiBaseUrl}/patients`, {
        headers: treatmentAuditHeaders
      });

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      const data = (await response.json()) as PatientsResponse;
      setPatients(data.items);
      setSelectedPatientId(nextSelectedId ?? data.items[0]?.id);
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

  async function loadClinicalDocuments(patientId: string, nextSelectedDocumentId?: string) {
    setIsLoadingDocuments(true);

    try {
      const response = await fetch(`${apiBaseUrl}/patients/${patientId}/documents`, {
        headers: treatmentAuditHeaders
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
          ? `Không thể tải tài liệu lâm sàng: ${error.message}`
          : "Không thể tải tài liệu lâm sàng."
      );
    } finally {
      setIsLoadingDocuments(false);
    }
  }

  async function loadAuditEvents(patientId: string) {
    setIsLoadingAuditEvents(true);

    try {
      const response = await fetch(`${apiBaseUrl}/patients/${patientId}/audit-events`, {
        headers: auditReviewHeaders
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

  async function loadPatientFhirPreview(patientId: string) {
    try {
      const response = await fetch(`${apiBaseUrl}/patients/${patientId}/fhir`, {
        headers: treatmentAuditHeaders
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

  async function loadDocumentFhirPreview(documentId: string) {
    try {
      const response = await fetch(`${apiBaseUrl}/clinical-documents/${documentId}/fhir`, {
        headers: treatmentAuditHeaders
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
        headers: {
          ...treatmentAuditHeaders,
          "Content-Type": "application/json"
        },
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
      await loadAuditEvents(createdPatient.id);
      setStatusMessage(`Đã tạo hồ sơ ${createdPatient.fullName} và chọn ngay trên giao diện.`);
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

  async function handleCreateClinicalDocument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedPatient) {
      setStatusMessage("Cần chọn bệnh nhân trước khi tạo tài liệu lâm sàng.");
      return;
    }

    setIsSubmittingDocument(true);

    try {
      const response = await fetch(`${apiBaseUrl}/patients/${selectedPatient.id}/documents`, {
        method: "POST",
        headers: {
          ...treatmentAuditHeaders,
          "Content-Type": "application/json"
        },
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
      await loadAuditEvents(selectedPatient.id);
      setStatusMessage(`Đã tạo tài liệu "${createdDocument.title}" ở trạng thái nháp.`);
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể tạo tài liệu lâm sàng: ${error.message}`
          : "Không thể tạo tài liệu lâm sàng."
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
        headers: treatmentAuditHeaders
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => undefined);
        throw new Error(payload?.message ?? payload?.error ?? `API trả về HTTP ${response.status}`);
      }

      const signedDocument = (await response.json()) as ClinicalDocument;
      await loadClinicalDocuments(signedDocument.patientId, signedDocument.id);
      await loadDocumentFhirPreview(signedDocument.id);
      await loadAuditEvents(signedDocument.patientId);
      setStatusMessage(`Đã ký tài liệu "${signedDocument.title}".`);
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể ký tài liệu lâm sàng: ${error.message}`
          : "Không thể ký tài liệu lâm sàng."
      );
    } finally {
      setIsSigningDocument(false);
    }
  }

  return (
    <main className="shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">WiiiCare Nexus · EMR interoperability slice</p>
          <h1>Bệnh án điện tử đang chạy bằng backend thật</h1>
          <p className="lede">
            Lát cắt hiện tại mô phỏng phần lõi của EMR: định danh bệnh nhân, tài liệu lâm sàng,
            ký hồ sơ và xuất metadata theo HL7 FHIR để chuẩn bị liên thông giữa bệnh viện.
          </p>
        </div>

        <aside className="status-card" aria-label="Trạng thái hệ thống">
          <span>API base</span>
          <strong>{apiBaseUrl}</strong>
          <small>{statusMessage}</small>
        </aside>
      </section>

      <section className="workflow-strip" aria-label="Luồng ưu tiên">
        {["Patient", "Clinical Document", "DocumentReference", "Audit", "PACS link"].map(
          (item, index) => (
            <div className="workflow-step" key={item}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{item}</strong>
            </div>
          )
        )}
      </section>

      <section className="workspace">
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

        <article className="panel patient-detail">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">EMR core</p>
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

        <article className="panel document-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Clinical documents</p>
              <h2>Tài liệu bệnh án</h2>
            </div>
            <span className="pill cyan">{isLoadingDocuments ? "loading" : `${clinicalDocuments.length} docs`}</span>
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
                    {formatDocumentStatus(document.status)} · {formatDateTime(document.updatedAt)}
                  </small>
                </button>
              ))}
              {clinicalDocuments.length === 0 ? (
                <p className="empty-state">Bệnh nhân này chưa có tài liệu lâm sàng.</p>
              ) : null}
            </div>

            <div className="document-summary">
              {selectedDocument ? (
                <>
                  <div className="document-meta">
                    <Info label="Loại tài liệu" value={formatDocumentType(selectedDocument.type)} />
                    <Info label="Trạng thái" value={formatDocumentStatus(selectedDocument.status)} />
                    <Info label="Encounter" value={selectedDocument.encounterId ?? "Chưa gắn"} />
                    <Info label="Người ký/tạo" value={selectedDocument.authorPractitionerId} />
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
              </select>
            </label>
            <label>
              Mã lần khám/đợt điều trị
              <input
                value={documentForm.encounterId}
                onChange={(event) => setDocumentForm({ ...documentForm, encounterId: event.target.value })}
              />
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

        <article className="panel audit-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Security trace</p>
              <h2>Nhật ký kiểm toán</h2>
            </div>
            <button
              className="ghost-button"
              type="button"
              disabled={!selectedPatient || isLoadingAuditEvents}
              onClick={() => selectedPatient && void loadAuditEvents(selectedPatient.id)}
            >
              {isLoadingAuditEvents ? "Đang tải..." : "Tải audit"}
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
                  <strong>{event.purposeOfUse ?? "Chưa khai báo"}</strong>
                </div>
              </div>
            ))}
            {auditEvents.length === 0 ? (
              <p className="empty-state">
                Chưa có audit event cho bệnh nhân đang chọn. Hãy xem FHIR, tạo tài liệu hoặc ký tài liệu để phát sinh log.
              </p>
            ) : null}
          </div>
        </article>

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

        <article className="panel fhir-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">FHIR facade</p>
              <h2>FHIR Patient JSON</h2>
            </div>
            <span className="pill cyan">HL7 FHIR R4</span>
          </div>
          <pre>{JSON.stringify(patientFhirPreview ?? { note: "Chọn một bệnh nhân để xuất FHIR Patient." }, null, 2)}</pre>
        </article>

        <article className="panel fhir-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Interoperability</p>
              <h2>FHIR DocumentReference JSON</h2>
            </div>
            <span className="pill gold">MHD-ready</span>
          </div>
          <pre>
            {JSON.stringify(
              documentFhirPreview ?? {
                note: "Chọn một tài liệu bệnh án để xuất FHIR DocumentReference."
              },
              null,
              2
            )}
          </pre>
        </article>
      </section>

      <section className="reference-grid">
        <article className="panel dark-panel">
          <p className="eyebrow">Tham chiếu repos</p>
          <h2>Đang bám vào luồng nào?</h2>
          <div className="reference-list">
            {referenceSignals.map((reference) => (
              <div key={reference.name}>
                <strong>{reference.name}</strong>
                <span>{reference.value}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <p className="eyebrow">Next build</p>
          <h2>Việc nên làm tiếp</h2>
          <ul className="milestone-list">
            {nextMilestones.map((milestone) => (
              <li key={milestone}>{milestone}</li>
            ))}
          </ul>
        </article>
      </section>
    </main>
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

function formatDocumentType(type: ClinicalDocumentType): string {
  const labels: Record<ClinicalDocumentType, string> = {
    "admission-note": "Phiếu nhập viện",
    "discharge-summary": "Tóm tắt ra viện",
    "lab-report": "Kết quả xét nghiệm",
    "imaging-report": "Kết quả chẩn đoán hình ảnh",
    "referral-letter": "Giấy chuyển tuyến",
    "consent-form": "Phiếu đồng ý điều trị"
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
    "clinical-document.list": "Tải tài liệu bệnh án",
    "clinical-document.create": "Tạo tài liệu bệnh án",
    "clinical-document.sign": "Ký tài liệu bệnh án",
    "clinical-document.fhir-export": "Xuất FHIR DocumentReference",
    "audit-event.list": "Xem nhật ký kiểm toán"
  };

  return labels[action];
}

function formatAuditResourceType(resourceType: AuditResourceType): string {
  const labels: Record<AuditResourceType, string> = {
    Patient: "Bệnh nhân",
    ClinicalDocument: "Tài liệu",
    AuditEvent: "Audit"
  };

  return labels[resourceType];
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

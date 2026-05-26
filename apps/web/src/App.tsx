import { FormEvent, useEffect, useState } from "react";

type PatientIdentifierType = "national-id" | "insurance-id" | "hospital-mrn" | "legacy-id";
type PatientGender = "male" | "female" | "other" | "unknown";

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

type PatientsResponse = {
  readonly items: readonly Patient[];
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

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ??
  (window.location.port === "7311" ? "http://localhost:7310/api/v1" : "/api/v1");

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
  "Clinical Document: tạo nháp, ký, lưu URI và xuất DocumentReference",
  "Audit Event: ghi lại ai xem/sửa/ký/chia sẻ hồ sơ",
  "Interop: đẩy Patient/DocumentReference sang HAPI FHIR",
  "Imaging: liên kết metadata ảnh từ Orthanc, không lưu DICOM trong EMR"
];

export function App() {
  const [patients, setPatients] = useState<readonly Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>();
  const [fhirPreview, setFhirPreview] = useState<unknown>();
  const [form, setForm] = useState<NewPatientForm>(defaultPatientForm);
  const [statusMessage, setStatusMessage] = useState("Đang kết nối API...");
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId);

  useEffect(() => {
    void loadPatients();
  }, []);

  useEffect(() => {
    if (!selectedPatientId) {
      setFhirPreview(undefined);
      return;
    }

    void loadFhirPreview(selectedPatientId);
  }, [selectedPatientId]);

  async function loadPatients(nextSelectedId?: string) {
    setIsLoadingPatients(true);

    try {
      const response = await fetch(`${apiBaseUrl}/patients`);

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

  async function loadFhirPreview(patientId: string) {
    try {
      const response = await fetch(`${apiBaseUrl}/patients/${patientId}/fhir`);

      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      setFhirPreview(await response.json());
    } catch (error) {
      setFhirPreview({
        error:
          error instanceof Error
            ? `Không thể xuất FHIR Patient: ${error.message}`
            : "Không thể xuất FHIR Patient."
      });
    }
  }

  async function handleCreatePatient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const identifiers: PatientIdentifier[] = [
      {
        system: "urn:gov:vietnam:national-id",
        value: form.nationalId,
        type: "national-id"
      },
      {
        system: "urn:benh-vien-so:mrn",
        value: form.hospitalMrn,
        type: "hospital-mrn"
      }
    ];

    try {
      const response = await fetch(`${apiBaseUrl}/patients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          identifiers,
          fullName: form.fullName,
          birthDate: form.birthDate || undefined,
          gender: form.gender,
          address: form.address || undefined,
          phone: form.phone || undefined,
          managingOrganizationId: form.managingOrganizationId
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => undefined);
        throw new Error(payload?.message ?? payload?.error ?? `API trả về HTTP ${response.status}`);
      }

      const createdPatient = (await response.json()) as Patient;
      await loadPatients(createdPatient.id);
      setStatusMessage(`Đã tạo hồ sơ ${createdPatient.fullName} và chọn ngay trên giao diện.`);
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? `Không thể tạo hồ sơ bệnh nhân: ${error.message}`
          : "Không thể tạo hồ sơ bệnh nhân."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">WiiiCare Nexus · EMR interoperability slice</p>
          <h1>Patient Registry đang gọi backend thật</h1>
          <p className="lede">
            Lát cắt đầu tiên tập trung vào định danh bệnh nhân, vì đây là nền của EMR,
            FHIR, chia sẻ tài liệu và liên thông giữa bệnh viện.
          </p>
        </div>

        <aside className="status-card" aria-label="Trạng thái hệ thống">
          <span>API base</span>
          <strong>{apiBaseUrl}</strong>
          <small>{statusMessage}</small>
        </aside>
      </section>

      <section className="workflow-strip" aria-label="Luồng ưu tiên">
        {["Patient", "FHIR Patient", "DocumentReference", "Audit", "PACS link"].map((item, index) => (
          <div className="workflow-step" key={item}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{item}</strong>
          </div>
        ))}
      </section>

      <section className="workspace">
        <article className="panel patient-list">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Registry</p>
              <h2>Danh sách bệnh nhân</h2>
            </div>
            <button className="ghost-button" type="button" onClick={() => void loadPatients()} disabled={isLoadingPatients}>
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

        <article className="panel create-panel">
          <div>
            <p className="eyebrow">Intake</p>
            <h2>Tạo nhanh hồ sơ mới</h2>
          </div>

          <form className="patient-form" onSubmit={(event) => void handleCreatePatient(event)}>
            <label>
              Họ tên
              <input value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} />
            </label>
            <label>
              Số định danh
              <input value={form.nationalId} onChange={(event) => setForm({ ...form, nationalId: event.target.value })} />
            </label>
            <label>
              Mã hồ sơ bệnh viện
              <input value={form.hospitalMrn} onChange={(event) => setForm({ ...form, hospitalMrn: event.target.value })} />
            </label>
            <label>
              Ngày sinh
              <input
                type="date"
                value={form.birthDate}
                onChange={(event) => setForm({ ...form, birthDate: event.target.value })}
              />
            </label>
            <label>
              Giới tính
              <select
                value={form.gender}
                onChange={(event) => setForm({ ...form, gender: event.target.value as PatientGender })}
              >
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
                <option value="unknown">Chưa rõ</option>
              </select>
            </label>
            <label>
              Điện thoại
              <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
            </label>
            <label className="wide-field">
              Địa chỉ
              <input value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
            </label>
            <label className="wide-field">
              Cơ sở quản lý
              <input
                value={form.managingOrganizationId}
                onChange={(event) => setForm({ ...form, managingOrganizationId: event.target.value })}
              />
            </label>
            <button className="primary-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang tạo..." : "Tạo hồ sơ bệnh nhân"}
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
          <pre>{JSON.stringify(fhirPreview ?? { note: "Chọn một bệnh nhân để xuất FHIR Patient." }, null, 2)}</pre>
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

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

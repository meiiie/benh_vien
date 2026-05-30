type LandingPageProps = {
  readonly onDemo: () => void;
  readonly onLogin: () => void;
};

const capabilityCards = [
  {
    label: "Hồ sơ lâm sàng",
    title: "Patient Workspace",
    description:
      "Theo dõi bệnh nhân, lượt khám, dị ứng, chẩn đoán, chỉ định, kết quả và thuốc trong một bàn làm việc thống nhất.",
    tags: ["Patient", "Encounter", "Medication"]
  },
  {
    label: "Bệnh án điện tử",
    title: "Document Center",
    description:
      "Quản lý tài liệu bệnh án, metadata tệp, nguồn tạo, băm kiểm chứng và ánh xạ sang DocumentReference/Provenance.",
    tags: ["DocumentReference", "Provenance", "Hash"]
  },
  {
    label: "Liên thông",
    title: "Record Transfer",
    description:
      "Mô phỏng chuyển hồ sơ theo đồng ý của người bệnh, tạo gói FHIR Bundle, hàng đợi gửi, retry và callback biên nhận.",
    tags: ["Consent", "FHIR Task", "Outbox"]
  },
  {
    label: "An toàn vận hành",
    title: "Audit & Access",
    description:
      "Phân quyền theo vai trò, mục đích sử dụng, phạm vi tổ chức và chuỗi audit để phục vụ kiểm toán truy cập dữ liệu nhạy cảm.",
    tags: ["RBAC", "ABAC", "Audit trail"]
  }
];

const workflowSignals = [
  "Tiếp nhận",
  "Lượt khám",
  "Tài liệu",
  "Đồng ý",
  "Chuyển hồ sơ",
  "FHIR",
  "Audit"
];

export function LandingPage({ onDemo, onLogin }: LandingPageProps) {
  return (
    <main className="marketing-shell">
      <nav className="marketing-nav" aria-label="Điều hướng giới thiệu">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">
            W
          </span>
          <span>
            <strong>WiiiCare Nexus</strong>
            <small>HoLiLiHu · The Wiii Lab</small>
          </span>
        </div>
        <div className="marketing-actions">
          <button className="ghost-button" type="button" onClick={onLogin}>
            Đăng nhập
          </button>
          <button className="primary-button" type="button" onClick={onDemo}>
            Vào phiên demo
          </button>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="landing-hero-copy">
          <p className="eyebrow">EMR interoperability prototype</p>
          <h1>Bệnh án điện tử liên thông cho bối cảnh bệnh viện Việt Nam</h1>
          <p className="lede">
            WiiiCare Nexus là mô hình EMR (Electronic Medical Record, bệnh án điện tử)
            tập trung vào hồ sơ bệnh nhân, tài liệu lâm sàng, đồng ý chia sẻ dữ liệu,
            chuyển hồ sơ liên viện và audit trail. Mục tiêu không phải làm màn hình đẹp
            đơn thuần, mà là trình bày một lát cắt sản phẩm đủ gần thực tế để phát triển
            thành hệ thống bệnh viện số.
          </p>
          <div className="landing-actions">
            <button className="ghost-button" type="button" onClick={onDemo}>
              Vào nhanh bằng tài khoản bác sĩ
            </button>
            <button className="primary-button" type="button" onClick={onLogin}>
              Chọn vai trò đăng nhập
            </button>
          </div>
          <div className="landing-proof-row" aria-label="Tín hiệu năng lực sản phẩm">
            <span>FHIR R4</span>
            <span>26 SQL migrations</span>
            <span>RBAC/ABAC</span>
            <span>Hải Phòng referral flow</span>
          </div>
        </div>
        <aside className="landing-card" aria-label="Tổng quan luồng sản phẩm">
          <span className="status-pill">Prototype an toàn, không dùng dữ liệu thật</span>
          <div className="clinical-window">
            <div className="clinical-window-header">
              <span>Clinical command center</span>
              <strong>RecordTransfer #demo-001</strong>
            </div>
            <div className="patient-strip">
              <span>Bệnh nhân</span>
              <strong>Nguyễn Minh An</strong>
              <small>Consent hợp lệ · Endpoint FHIR sẵn sàng</small>
            </div>
            <ol className="transfer-timeline" aria-label="Luồng chuyển hồ sơ">
              {workflowSignals.map((signal, index) => (
                <li key={signal}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{signal}</strong>
                </li>
              ))}
            </ol>
          </div>
          <small>
            Lát cắt hiện tại ưu tiên luồng nghiệp vụ thật: bác sĩ tạo hồ sơ, gateway
            nhận gói chuyển, auditor kiểm tra lịch sử truy cập.
          </small>
        </aside>
      </section>

      <section className="landing-context" aria-label="Bối cảnh triển khai">
        <article>
          <p className="eyebrow">Bài toán</p>
          <h2>Chuyển bệnh án giữa bệnh viện không chỉ là upload file</h2>
          <p>
            Hệ thống cần biết ai được truy cập, bệnh nhân đã đồng ý hay chưa, tài liệu
            thuộc hồ sơ nào, cơ sở nhận có endpoint kỹ thuật nào, và toàn bộ thao tác
            có để lại dấu vết kiểm toán hay không.
          </p>
        </article>
        <article>
          <p className="eyebrow">Cách tiếp cận</p>
          <h2>Đi từ EMR lõi trước, AI và tự động hóa để sau</h2>
          <p>
            Nền tảng hiện bám vào hồ sơ bệnh nhân, tài liệu, Provider Directory, FHIR,
            phân quyền và audit. Đây là phần xương sống cần chắc trước khi tích hợp
            HIS/LIS/PACS thật hoặc thêm AI.
          </p>
        </article>
      </section>

      <section className="landing-grid">
        {capabilityCards.map((card) => (
          <article className="landing-feature-card" key={card.title}>
            <p className="eyebrow">{card.label}</p>
            <h2>{card.title}</h2>
            <p>{card.description}</p>
            <div className="feature-tags" aria-label={`Chuẩn và thành phần của ${card.title}`}>
              {card.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="landing-standard-strip" aria-label="Chuẩn và giới hạn hiện tại">
        <span>HL7 FHIR R4</span>
        <span>Provider Directory</span>
        <span>DocumentReference</span>
        <span>AuditEvent</span>
        <span>Orthanc/PACS profile</span>
        <span>HAPI FHIR lab</span>
      </section>
    </main>
  );
}

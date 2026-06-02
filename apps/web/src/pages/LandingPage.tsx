type LandingPageProps = {
  readonly onDemo: () => void;
  readonly onLogin: () => void;
};

const capabilityCards = [
  {
    label: "Hồ sơ lâm sàng",
    title: "Không gian hồ sơ bệnh nhân",
    description:
      "Theo dõi bệnh nhân, lượt khám, dị ứng, chẩn đoán, chỉ định, kết quả và thuốc trong một bàn làm việc thống nhất.",
    tags: ["Patient", "Encounter", "Medication"]
  },
  {
    label: "Bệnh án điện tử",
    title: "Trung tâm tài liệu bệnh án",
    description:
      "Quản lý tài liệu bệnh án, metadata tệp, nguồn tạo, băm kiểm chứng và ánh xạ sang DocumentReference/Provenance.",
    tags: ["DocumentReference", "Provenance", "Hash"]
  },
  {
    label: "Liên thông",
    title: "Chuyển hồ sơ liên viện",
    description:
      "Mô phỏng chuyển hồ sơ theo đồng ý của người bệnh, tạo gói FHIR Bundle, hàng đợi gửi, retry và callback biên nhận.",
    tags: ["Consent", "FHIR Task", "Outbox"]
  },
  {
    label: "An toàn vận hành",
    title: "Kiểm soát truy cập và audit",
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

const scopeCards = [
  {
    tone: "primary",
    label: "Đang có trong prototype",
    title: "Một lát cắt EMR có thể thao tác, không phải slide mô phỏng",
    points: [
      "Patient Registry quản lý định danh, hồ sơ và tình huống gộp bệnh nhân.",
      "Workspace lâm sàng có lượt khám, dị ứng, chẩn đoán, chỉ định, kết quả, thuốc và tài liệu.",
      "Luồng chuyển hồ sơ tạo FHIR document Bundle, kiểm tra đồng ý chia sẻ và ghi nhật ký kiểm toán."
    ],
    evidence: [
      ["FHIR Bundle", "Gói hồ sơ tự chứa"],
      ["AuditEvent", "Truy vết thao tác"],
      ["Outbox", "Gửi và retry"],
      ["Provider Directory", "Cơ sở và endpoint"]
    ]
  },
  {
    tone: "integration",
    label: "Cần tích hợp khi triển khai thật",
    title: "Các hệ thống bệnh viện phải được cắm bằng hợp đồng kỹ thuật rõ ràng",
    points: [
      "HIS: hệ thống thông tin bệnh viện cho tiếp đón, viện phí, bảo hiểm và vận hành nội trú/ngoại trú.",
      "LIS/RIS: hệ thống xét nghiệm và chẩn đoán hình ảnh trả kết quả có cấu trúc.",
      "PACS/DICOMweb: kho ảnh y khoa và endpoint truy xuất ảnh, không lưu ảnh lớn trực tiếp vào EMR."
    ],
    evidence: []
  },
  {
    tone: "guardrail",
    label: "Không tuyên bố quá mức",
    title: "Prototype chưa thay thế hệ thống bệnh viện hoàn chỉnh",
    points: [
      "Chưa dùng dữ liệu bệnh nhân thật và chưa khẳng định tuân thủ sản xuất.",
      "Chưa có chữ ký số pháp lý, SSO/MFA thật, mTLS/JWS gateway hai chiều hoặc MHD registry đầy đủ.",
      "AI chỉ là hướng mở rộng sau khi EMR, FHIR, phân quyền và audit đủ chắc."
    ],
    evidence: []
  }
] as const;

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
          <p className="eyebrow">Nguyên mẫu EMR liên thông</p>
          <h1>Bệnh án điện tử liên thông cho bối cảnh bệnh viện Việt Nam</h1>
          <p className="lede">
            WiiiCare Nexus là mô hình EMR (Electronic Medical Record, bệnh án điện tử)
            tập trung vào hồ sơ bệnh nhân, tài liệu lâm sàng, đồng ý chia sẻ dữ liệu,
            chuyển hồ sơ liên viện và audit trail (nhật ký kiểm toán). Mục tiêu không phải làm màn hình đẹp
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
            <span>FHIR document Bundle</span>
            <span>Schema migrations có kiểm soát</span>
            <span>RBAC/ABAC + audit</span>
            <span>Luồng chuyển viện Hải Phòng</span>
          </div>
        </div>
        <aside className="landing-card" aria-label="Tổng quan luồng sản phẩm">
          <span className="status-pill">Prototype an toàn, không dùng dữ liệu thật</span>
          <div className="clinical-window">
            <div className="clinical-window-header">
              <span>Trung tâm điều phối lâm sàng</span>
              <strong>Gói chuyển hồ sơ #demo-001</strong>
            </div>
            <div className="patient-strip">
              <span>Bệnh nhân</span>
              <strong>Nguyễn Văn An</strong>
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
            Nền tảng hiện bám vào hồ sơ bệnh nhân, tài liệu, Provider Directory
            (danh bạ cơ sở, nhân sự và endpoint), FHIR, phân quyền và audit. Đây là phần xương sống cần chắc trước khi tích hợp
            HIS/LIS/PACS thật hoặc thêm AI.
          </p>
        </article>
      </section>

      <section className="landing-scope-board" aria-label="Ranh giới năng lực của nguyên mẫu">
        {scopeCards.map((card) => (
          <article className={`scope-card scope-card--${card.tone}`} key={card.title}>
            <p className="eyebrow">{card.label}</p>
            <h2>{card.title}</h2>
            <ul className="scope-list">
              {card.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            {card.evidence.length ? (
              <div className="scope-proof-strip" aria-label="Bằng chứng kỹ thuật của lát cắt hiện tại">
                {card.evidence.map(([label, note]) => (
                  <span key={label}>
                    <strong>{label}</strong>
                    <small>{note}</small>
                  </span>
                ))}
              </div>
            ) : null}
          </article>
        ))}
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
        <span>Hồ sơ Orthanc/PACS</span>
        <span>Lab HAPI FHIR</span>
      </section>
    </main>
  );
}

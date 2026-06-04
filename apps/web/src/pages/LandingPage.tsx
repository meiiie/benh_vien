type LandingPageProps = {
  readonly onDemo: () => void;
  readonly onLogin: () => void;
};

const capabilityCards = [
  {
    label: "Lõi hồ sơ",
    title: "Không gian bệnh án theo bệnh nhân",
    description:
      "Tập hợp định danh, lượt khám, dị ứng, chẩn đoán, chỉ định, kết quả, thuốc và tài liệu lâm sàng trong một không gian làm việc thống nhất.",
    tags: ["Patient", "Encounter", "Dữ liệu lâm sàng"]
  },
  {
    label: "Tài liệu",
    title: "Bệnh án điện tử có dấu vết kỹ thuật",
    description:
      "Quản lý tệp bệnh án, metadata, nguồn tạo, hash kiểm chứng và ánh xạ sang DocumentReference/Provenance để phục vụ truy vết.",
    tags: ["DocumentReference", "Provenance", "Hash"]
  },
  {
    label: "Liên thông",
    title: "Chuyển hồ sơ có đồng ý của người bệnh",
    description:
      "Tạo gói FHIR document Bundle, kiểm tra đồng ý chia sẻ dữ liệu, đưa vào outbox, retry khi lỗi và nhận callback biên nhận từ hệ thống đích.",
    tags: ["Consent", "FHIR Task", "Outbox"]
  },
  {
    label: "Kiểm soát",
    title: "Phân quyền và nhật ký kiểm toán",
    description:
      "Kết hợp vai trò, mục đích sử dụng, phạm vi tổ chức và nhật ký kiểm toán để giảm truy cập sai mục đích vào dữ liệu nhạy cảm.",
    tags: ["RBAC", "ABAC", "AuditEvent"]
  }
];

const workflowSteps = [
  {
    code: "01",
    label: "Định danh",
    detail: "Đăng ký, đối soát và xử lý trường hợp gộp hồ sơ bệnh nhân."
  },
  {
    code: "02",
    label: "Khám bệnh",
    detail: "Ghi nhận lượt khám, dữ liệu lâm sàng và tài liệu phát sinh."
  },
  {
    code: "03",
    label: "Đồng ý",
    detail: "Kiểm tra phạm vi chia sẻ trước khi đóng gói hồ sơ."
  },
  {
    code: "04",
    label: "Đóng gói",
    detail: "Sinh FHIR document Bundle tự chứa, có Composition và Provenance."
  },
  {
    code: "05",
    label: "Gửi nhận",
    detail: "Chuyển qua gateway, outbox, retry và callback biên nhận."
  },
  {
    code: "06",
    label: "Kiểm toán",
    detail: "Lưu AuditEvent và kiểm tra toàn vẹn chuỗi truy cập."
  }
];

const scopeCards = [
  {
    tone: "primary",
    label: "Đã có trong prototype",
    title: "Một lát cắt EMR có thể thao tác, không phải slide mô phỏng",
    points: [
      "Patient Registry quản lý định danh, hồ sơ và tình huống gộp bệnh nhân.",
      "Không gian lâm sàng có lượt khám, dị ứng, chẩn đoán, chỉ định, kết quả, thuốc và tài liệu.",
      "Luồng chuyển hồ sơ tạo FHIR document Bundle, kiểm tra đồng ý chia sẻ dữ liệu và ghi nhật ký kiểm toán."
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
    title: "HIS, LIS và PACS phải được cắm bằng hợp đồng kỹ thuật rõ ràng",
    points: [
      "HIS: hệ thống thông tin bệnh viện cho tiếp đón, viện phí, bảo hiểm và vận hành nội trú/ngoại trú.",
      "LIS/RIS: hệ thống xét nghiệm và chẩn đoán hình ảnh trả kết quả có cấu trúc.",
      "PACS/DICOMweb: kho ảnh y khoa và endpoint truy xuất ảnh, không nên nhét ảnh lớn trực tiếp vào EMR."
    ],
    evidence: []
  },
  {
    tone: "guardrail",
    label: "Ranh giới trung thực",
    title: "Prototype chưa phải hệ thống bệnh viện sản xuất",
    points: [
      "Chưa dùng dữ liệu bệnh nhân thật và chưa tuyên bố tuân thủ pháp lý ở môi trường sản xuất.",
      "Chưa có chữ ký số pháp lý, SSO/MFA thật, mTLS/JWS gateway hai chiều hoặc registry MHD đầy đủ.",
      "AI chỉ nên bổ sung sau khi EMR, FHIR, phân quyền và audit đã đủ chắc."
    ],
    evidence: []
  }
] as const;

const standardBadges = [
  "HL7 FHIR R4",
  "FHIR document Bundle",
  "Provider Directory",
  "DocumentReference",
  "Provenance",
  "AuditEvent",
  "Sẵn sàng DICOM/PACS",
  "Migration PostgreSQL"
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
            <strong>Wiii Care</strong>
            <small>HoLiLiHu · The Wiii Lab</small>
          </span>
        </div>
        <div className="marketing-actions">
          <button className="ghost-button" type="button" onClick={onLogin}>
            Đăng nhập
          </button>
          <button className="primary-button" type="button" onClick={onDemo}>
            Mở không gian demo
          </button>
        </div>
      </nav>

      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-hero-copy">
          <p className="eyebrow">Nguyên mẫu EMR liên thông</p>
          <h1 id="landing-title">Bệnh án điện tử cho mạng lưới bệnh viện Việt Nam</h1>
          <p className="lede">
            Wiii Care mô phỏng lõi EMR (Electronic Medical Record, bệnh án điện tử) phục vụ
            quản lý hồ sơ bệnh nhân, tài liệu lâm sàng, đồng ý chia sẻ dữ liệu và chuyển hồ sơ
            liên viện theo chuẩn FHIR. Trọng tâm của nguyên mẫu là luồng nghiệp vụ đủ thật để
            thảo luận kỹ thuật, không chỉ là giao diện trình diễn.
          </p>

          <div className="landing-actions">
            <button className="primary-button" type="button" onClick={onDemo}>
              Vào nhanh bằng tài khoản bác sĩ
            </button>
            <button className="ghost-button" type="button" onClick={onLogin}>
              Chọn vai trò đăng nhập
            </button>
          </div>

          <div className="landing-proof-row" aria-label="Tín hiệu năng lực sản phẩm">
            <span>FHIR R4</span>
            <span>FHIR document Bundle</span>
            <span>Consent trước khi chia sẻ</span>
            <span>RBAC/ABAC + audit</span>
            <span>Luồng chuyển hồ sơ Hải Phòng</span>
          </div>

          <dl className="landing-metrics" aria-label="Các trụ cột của nguyên mẫu">
            <div>
              <dt>06</dt>
              <dd>Bước chuyển hồ sơ có kiểm soát</dd>
            </div>
            <div>
              <dt>FHIR R4</dt>
              <dd>Chuẩn trao đổi dữ liệu y tế chính</dd>
            </div>
            <div>
              <dt>Không PHI</dt>
              <dd>Không dùng dữ liệu bệnh nhân thật</dd>
            </div>
          </dl>
        </div>

        <aside className="landing-card handoff-console" aria-label="Minh họa luồng chuyển hồ sơ">
          <div className="console-header">
            <span>Bàn giao lâm sàng</span>
            <strong>Gói chuyển hồ sơ #demo-001</strong>
          </div>
          <div className="patient-strip">
            <span>Bệnh nhân</span>
            <strong>Nguyễn Văn An</strong>
            <small>Consent hợp lệ · Endpoint FHIR sẵn sàng · Audit đang bật</small>
          </div>
          <ol className="transfer-timeline" aria-label="Luồng chuyển hồ sơ liên viện">
            {workflowSteps.map((step) => (
              <li key={step.code}>
                <span>{step.code}</span>
                <div>
                  <strong>{step.label}</strong>
                  <small>{step.detail}</small>
                </div>
              </li>
            ))}
          </ol>
          <p>
            Lát cắt hiện tại ưu tiên bệnh viện Hải Phòng hoặc mạng lưới cơ sở tương tự: nơi
            hồ sơ cần đi qua nhiều hệ thống, nhiều vai trò và nhiều điểm kiểm soát.
          </p>
        </aside>
      </section>

      <section className="landing-context" aria-label="Bối cảnh triển khai">
        <article>
          <p className="eyebrow">Bài toán</p>
          <h2>Chuyển bệnh án không đơn giản là upload một tệp PDF</h2>
          <p>
            Hệ thống phải biết hồ sơ thuộc bệnh nhân nào, ai được truy cập, bệnh nhân đã đồng
            ý chia sẻ chưa, cơ sở nhận có endpoint kỹ thuật nào và toàn bộ thao tác có để lại
            dấu vết kiểm toán hay không.
          </p>
        </article>
        <article>
          <p className="eyebrow">Chiến lược</p>
          <h2>Đi từ EMR lõi trước, AI và tự động hóa để sau</h2>
          <p>
            Nền tảng hiện bám vào Patient Registry, không gian lâm sàng, Provider Directory
            (danh bạ cơ sở, nhân sự và endpoint), FHIR, phân quyền và audit. Đây là phần
            xương sống cần chắc trước khi tích hợp HIS/LIS/PACS thật.
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

      <section className="landing-grid" aria-label="Các năng lực chính">
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

      <section className="landing-standard-strip" aria-label="Chuẩn và thành phần kỹ thuật">
        {standardBadges.map((badge) => (
          <span key={badge}>{badge}</span>
        ))}
      </section>
    </main>
  );
}

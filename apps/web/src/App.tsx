const capabilities = [
  "Đăng ký và đối soát định danh bệnh nhân",
  "Tạo, ký và lưu trữ tài liệu bệnh án điện tử",
  "Xuất dữ liệu liên thông theo HL7 FHIR",
  "Kết nối hình ảnh y khoa qua PACS/DICOM",
  "Theo dõi nhật ký truy cập và thao tác hồ sơ"
];

const contexts = [
  "Identity & Access",
  "Patient Registry",
  "Clinical Records",
  "Interoperability",
  "Imaging",
  "Audit & Compliance"
];

export function App() {
  return (
    <main className="shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Bản khởi đầu kiến trúc</p>
          <h1>Nền tảng bệnh án điện tử và liên thông bệnh viện</h1>
          <p className="lede">
            Thiết kế theo hướng DDD, ưu tiên FHIR, DICOM và khả năng mở rộng từ
            prototype học thuật sang hệ thống thí nghiệm nghiêm túc.
          </p>
        </div>
        <div className="status-card" aria-label="Trạng thái dự án">
          <span>Phiên bản</span>
          <strong>0.1.0</strong>
          <small>Modular monolith, sẵn sàng tách service khi cần.</small>
        </div>
      </section>

      <section className="grid">
        <article className="panel">
          <h2>Năng lực cốt lõi</h2>
          <ul>
            {capabilities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="panel accent">
          <h2>Bounded context</h2>
          <div className="context-list">
            {contexts.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}


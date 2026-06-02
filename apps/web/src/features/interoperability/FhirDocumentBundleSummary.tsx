import {
  buildBundleChecks,
  summarizeDocumentBundle
} from "./fhirDocumentBundleSummaryModel.js";

export function FhirDocumentBundleSummary({ value }: { readonly value: unknown }) {
  const summary = summarizeDocumentBundle(value);
  const checks = buildBundleChecks(summary);
  const isReady = checks.every((check) => check.passed);
  const metrics = [
    ["Entry", "Tổng resource trong Bundle", summary.entryCount],
    ["DocumentReference", "Metadata tài liệu bệnh án", summary.documentReferenceCount],
    ["Provenance", "Nguồn gốc tài liệu đã ký", summary.provenanceCount],
    ["Consent", "Căn cứ chia sẻ hồ sơ", summary.consentCount],
    ["Task", "Luồng thực thi/y lệnh liên quan", summary.taskCount]
  ] as const;

  return (
    <article className="panel bundle-summary-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Document Bundle readiness</p>
          <h2>Gói bệnh án chuyển viện đang đóng những gì?</h2>
        </div>
        <span className={isReady ? "pill cyan" : "pill gold"}>
          {isReady ? "sẵn sàng demo" : "cần kiểm tra"}
        </span>
      </div>

      {summary.entryCount > 0 ? (
        <>
          <div
            className="bundle-quality-grid"
            aria-label="Thành phần FHIR document Bundle"
          >
            {metrics.map(([label, note, count]) => (
              <BundleMetric
                key={label}
                label={label}
                note={note}
                value={String(count)}
              />
            ))}
          </div>

          <ol className="bundle-checklist">
            {checks.map((check) => (
              <li className={check.passed ? "is-ok" : "is-risk"} key={check.label}>
                <span>{check.passed ? "Đạt" : "Cần xem"}</span>
                <strong>{check.label}</strong>
                <small>{check.note}</small>
              </li>
            ))}
          </ol>

          <p className="bundle-summary-note">
            {summary.compositionTitle ??
              "Composition đầu tiên sẽ đóng vai trò mục lục lâm sàng của gói bệnh án."}
          </p>
        </>
      ) : (
        <p
          className={
            summary.issueMessage
              ? "empty-state bundle-summary-error"
              : "empty-state"
          }
        >
          {summary.issueMessage ??
            "Chưa có FHIR document Bundle để tóm tắt. Chọn bệnh nhân và tải preview FHIR trước khi kiểm tra gói liên thông."}
        </p>
      )}
    </article>
  );
}

function BundleMetric({
  label,
  note,
  value
}: {
  readonly label: string;
  readonly note: string;
  readonly value: string;
}) {
  return (
    <div className="bundle-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}

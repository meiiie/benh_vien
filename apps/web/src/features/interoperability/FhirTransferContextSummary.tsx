import { Info } from "../../components/AppShell.js";
import type { Patient } from "../../types/patientRegistry.js";
import type { RecordTransferBundleType } from "../../types/recordTransfers.js";

export type FhirTransferContext = {
  readonly bundleType: RecordTransferBundleType;
  readonly consentReference: string;
  readonly reason: string;
  readonly recipientOrganizationId: string;
  readonly sourceOrganizationId: string;
};

type FhirTransferContextSummaryProps = {
  readonly context: FhirTransferContext;
  readonly patient?: Patient;
};

export function FhirTransferContextSummary({
  context,
  patient
}: FhirTransferContextSummaryProps) {
  const patientIdentifier = patient?.identifiers[0]?.value ?? patient?.id;
  const patientLabel = patient
    ? `${patient.fullName}${patientIdentifier ? ` (${patientIdentifier})` : ""}`
    : "Chưa chọn bệnh nhân";
  const bundleLabel =
    context.bundleType === "document"
      ? "FHIR document Bundle"
      : "FHIR collection Bundle";

  return (
    <article className="panel transfer-context-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Ngữ cảnh liên thông</p>
          <h2>Bệnh án điện tử sẽ được đóng gói và chuyển như thế nào?</h2>
        </div>
        <span className="pill cyan">kiểm consent</span>
      </div>

      <div className="detail-grid compact transfer-context-grid">
        <Info label="Bệnh nhân" value={patientLabel} />
        <Info label="Cơ sở gửi" value={context.sourceOrganizationId} />
        <Info label="Cơ sở nhận" value={context.recipientOrganizationId} />
        <Info label="Consent dùng để xuất" value={context.consentReference} />
        <Info label="Kiểu gói FHIR" value={bundleLabel} />
      </div>

      <ol className="transfer-context-flow">
        <li>
          <strong>1. Gom hồ sơ lâm sàng</strong>
          <span>
            Hồ sơ gồm thông tin người bệnh, lượt khám, chẩn đoán, chỉ định, kết
            quả xét nghiệm, hình ảnh, thuốc và tài liệu bệnh án.
          </span>
        </li>
        <li>
          <strong>2. Đóng gói theo FHIR</strong>
          <span>
            {bundleLabel} dùng Composition làm mục lục, DocumentReference làm
            metadata tài liệu, Consent làm căn cứ chia sẻ và Provenance làm dấu
            vết nguồn gốc.
          </span>
        </li>
        <li>
          <strong>3. Điều phối chuyển viện</strong>
          <span>
            RecordTransfer theo dõi trạng thái gửi/nhận; khi xuất chuẩn, luồng
            này được biểu diễn bằng FHIR Task trỏ tới Bundle và consent tương ứng.
          </span>
        </li>
      </ol>

      <p className="transfer-context-note">
        API không xuất Bundle chỉ vì người dùng có quyền xem hồ sơ. Mỗi lần xuất
        gói liên viện phải có consent còn hiệu lực và đơn vị nhận khớp với ngữ
        cảnh chuyển hồ sơ.
      </p>

      <p className="transfer-context-reason">{context.reason}</p>
    </article>
  );
}

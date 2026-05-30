import { Info } from "../../components/AppShell.js";
import {
  formatConsentCategory,
  formatConsentStatus,
  formatDateTime
} from "../../lib/clinicalFormatters.js";
import type { Consent } from "../../types/clinical.js";

type ConsentInteropPanelProps = {
  readonly consents: readonly Consent[];
  readonly consentReference: string;
  readonly isLoading: boolean;
  readonly isWriteDisabled: boolean;
  readonly recipientOrganizationId: string;
  readonly revokingConsentId?: string;
  readonly onLoadFhirPreview: (consentId: string) => Promise<void> | void;
  readonly onRevokeConsent: (consent: Consent) => Promise<void> | void;
};

export function ConsentInteropPanel({
  consents,
  consentReference,
  isLoading,
  isWriteDisabled,
  recipientOrganizationId,
  revokingConsentId,
  onLoadFhirPreview,
  onRevokeConsent
}: ConsentInteropPanelProps) {
  return (
    <article className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Đồng ý chia sẻ hồ sơ</p>
          <h2>Căn cứ chia sẻ hồ sơ</h2>
        </div>
        <span className="pill cyan">
          {isLoading ? "đang tải" : `${consents.length} đồng ý`}
        </span>
      </div>

      <div className="detail-grid compact">
        <Info label="Mã đồng ý dùng để xuất Bundle" value={consentReference} />
        <Info label="Đơn vị nhận" value={recipientOrganizationId} />
      </div>

      <div className="reference-list">
        {consents.map((consent) => (
          <div key={consent.id}>
            <div className="reference-header">
              <strong>
                {consent.id} · {formatConsentStatus(consent.status)}
              </strong>
              <div className="reference-actions">
                <button
                  className="ghost-button compact-button"
                  type="button"
                  onClick={() => void onLoadFhirPreview(consent.id)}
                >
                  FHIR
                </button>
                <button
                  className="ghost-button compact-button"
                  type="button"
                  disabled={
                    consent.status !== "active" ||
                    revokingConsentId === consent.id ||
                    isWriteDisabled
                  }
                  onClick={() => void onRevokeConsent(consent)}
                >
                  {revokingConsentId === consent.id ? "Đang thu hồi..." : "Thu hồi"}
                </button>
              </div>
            </div>
            <span>
              {formatConsentCategory(consent.category)} cho {consent.granteeOrganizationId},
              hiệu lực từ {formatDateTime(consent.validFrom)}
              {consent.validUntil ? ` đến ${formatDateTime(consent.validUntil)}` : ""}
            </span>
            {consent.revokedAt ? (
              <span>
                Thu hồi lúc {formatDateTime(consent.revokedAt)} bởi{" "}
                {consent.revokedByActorId ?? "không rõ"}
                {consent.revocationReason ? ` · ${consent.revocationReason}` : ""}
              </span>
            ) : null}
          </div>
        ))}
        {consents.length === 0 ? (
          <p className="empty-state">
            Chưa có đồng ý chia sẻ hợp lệ trong workspace này; FHIR Bundle liên
            viện sẽ bị API chặn nếu thiếu consent.
          </p>
        ) : null}
      </div>
    </article>
  );
}

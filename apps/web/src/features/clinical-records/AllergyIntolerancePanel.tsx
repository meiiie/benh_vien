import type { FormEvent } from "react";
import { Info } from "../../components/AppShell.js";
import {
  formatAllergyCategory,
  formatAllergyClinicalStatus,
  formatAllergyCriticality,
  formatAllergyType,
  formatAllergyVerificationStatus,
  formatDateTime
} from "../../lib/clinicalFormatters.js";
import type {
  AllergyCategory,
  AllergyClinicalStatus,
  AllergyCriticality,
  AllergyIntolerance,
  AllergyReactionSeverity,
  AllergyType,
  AllergyVerificationStatus,
  Encounter,
  NewAllergyIntoleranceForm
} from "../../types/clinical.js";

type AllergyIntolerancePanelProps = {
  readonly allergyIntolerances: readonly AllergyIntolerance[];
  readonly encounters: readonly Encounter[];
  readonly form: NewAllergyIntoleranceForm;
  readonly isLoading: boolean;
  readonly isSubmitting: boolean;
  readonly isWriteDisabled: boolean;
  readonly selectedAllergyIntolerance?: AllergyIntolerance;
  readonly selectedAllergyIntoleranceId?: string;
  readonly onCreateAllergyIntolerance: (event: FormEvent<HTMLFormElement>) => Promise<void> | void;
  readonly onFormChange: (form: NewAllergyIntoleranceForm) => void;
  readonly onSelectAllergyIntolerance: (allergyIntoleranceId: string) => void;
};

export function AllergyIntolerancePanel({
  allergyIntolerances,
  encounters,
  form,
  isLoading,
  isSubmitting,
  isWriteDisabled,
  selectedAllergyIntolerance,
  selectedAllergyIntoleranceId,
  onCreateAllergyIntolerance,
  onFormChange,
  onSelectAllergyIntolerance
}: AllergyIntolerancePanelProps) {
  return (
    <article className="panel allergy-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Allergy safety</p>
          <h2>Dị ứng và cảnh báo an toàn</h2>
        </div>
        <span className="pill cyan">
          {isLoading ? "đang tải" : `${allergyIntolerances.length} cảnh báo`}
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
              onClick={() => onSelectAllergyIntolerance(allergyIntolerance.id)}
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
                <Info
                  label="Mức cảnh báo"
                  value={formatAllergyCriticality(selectedAllergyIntolerance.criticality)}
                />
                <Info
                  label="Lâm sàng"
                  value={formatAllergyClinicalStatus(selectedAllergyIntolerance.clinicalStatus)}
                />
                <Info
                  label="Xác minh"
                  value={formatAllergyVerificationStatus(selectedAllergyIntolerance.verificationStatus)}
                />
                <Info
                  label="Biểu hiện"
                  value={selectedAllergyIntolerance.reaction?.manifestation.display ?? "Chưa ghi"}
                />
                <Info label="Encounter" value={selectedAllergyIntolerance.encounterId ?? "Chưa gắn"} />
              </div>
              <p className="empty-state">
                AllergyIntolerance giúp hệ thống cảnh báo trước khi kê thuốc hoặc chuyển hồ sơ, tránh để dị ứng chỉ nằm trong ghi chú tự do.
              </p>
            </>
          ) : (
            <p className="empty-state">
              Chọn một dị ứng/cảnh báo để xem siêu dữ liệu và xuất FHIR AllergyIntolerance.
            </p>
          )}
        </div>
      </div>

      <form className="allergy-form" onSubmit={(event) => void onCreateAllergyIntolerance(event)}>
        <label>
          Gắn với lượt khám
          <select
            value={form.encounterId}
            onChange={(event) => onFormChange({ ...form, encounterId: event.target.value })}
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
            value={form.type}
            onChange={(event) => onFormChange({ ...form, type: event.target.value as AllergyType })}
          >
            <option value="allergy">Dị ứng</option>
            <option value="intolerance">Không dung nạp</option>
          </select>
        </label>
        <label>
          Nhóm
          <select
            value={form.category}
            onChange={(event) => onFormChange({ ...form, category: event.target.value as AllergyCategory })}
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
            value={form.criticality}
            onChange={(event) =>
              onFormChange({ ...form, criticality: event.target.value as "" | AllergyCriticality })
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
            value={form.clinicalStatus}
            onChange={(event) =>
              onFormChange({ ...form, clinicalStatus: event.target.value as AllergyClinicalStatus })
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
            value={form.verificationStatus}
            onChange={(event) =>
              onFormChange({ ...form, verificationStatus: event.target.value as AllergyVerificationStatus })
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
            value={form.codeSystem}
            onChange={(event) => onFormChange({ ...form, codeSystem: event.target.value })}
          />
        </label>
        <label>
          Mã tác nhân
          <input
            value={form.code}
            onChange={(event) => onFormChange({ ...form, code: event.target.value })}
          />
        </label>
        <label className="wide-field">
          Tên tác nhân
          <input
            value={form.codeDisplay}
            onChange={(event) => onFormChange({ ...form, codeDisplay: event.target.value })}
          />
        </label>
        <label>
          Mã biểu hiện
          <input
            value={form.manifestationCode}
            onChange={(event) => onFormChange({ ...form, manifestationCode: event.target.value })}
          />
        </label>
        <label className="wide-field">
          Biểu hiện phản ứng
          <input
            value={form.manifestationDisplay}
            onChange={(event) => onFormChange({ ...form, manifestationDisplay: event.target.value })}
          />
        </label>
        <label>
          Mức độ phản ứng
          <select
            value={form.reactionSeverity}
            onChange={(event) =>
              onFormChange({ ...form, reactionSeverity: event.target.value as "" | AllergyReactionSeverity })
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
            value={form.recordedAt}
            onChange={(event) => onFormChange({ ...form, recordedAt: event.target.value })}
          />
        </label>
        <label className="wide-field">
          Người ghi nhận
          <input
            value={form.recorderPractitionerId}
            onChange={(event) => onFormChange({ ...form, recorderPractitionerId: event.target.value })}
          />
        </label>
        <label className="wide-field">
          Mô tả phản ứng
          <input
            value={form.reactionDescription}
            onChange={(event) => onFormChange({ ...form, reactionDescription: event.target.value })}
          />
        </label>
        <label className="wide-field">
          Ghi chú
          <input value={form.note} onChange={(event) => onFormChange({ ...form, note: event.target.value })} />
        </label>
        <button className="primary-button" type="submit" disabled={isWriteDisabled || isSubmitting}>
          {isSubmitting ? "Đang ghi nhận..." : "Ghi nhận dị ứng/cảnh báo"}
        </button>
      </form>
    </article>
  );
}

import type { FormEvent } from "react";
import { formatDateTime } from "../../lib/clinicalFormatters.js";
import type {
  AllergyCategory,
  AllergyClinicalStatus,
  AllergyCriticality,
  AllergyReactionSeverity,
  AllergyType,
  AllergyVerificationStatus,
  NewAllergyIntoleranceForm
} from "../../types/allergies.js";
import type { Encounter } from "../../types/encounters.js";

type AllergyIntoleranceFormProps = {
  readonly encounters: readonly Encounter[];
  readonly form: NewAllergyIntoleranceForm;
  readonly isSubmitting: boolean;
  readonly isWriteDisabled: boolean;
  readonly onCreateAllergyIntolerance: (event: FormEvent<HTMLFormElement>) => Promise<void> | void;
  readonly onFormChange: (form: NewAllergyIntoleranceForm) => void;
};

export function AllergyIntoleranceForm({
  encounters,
  form,
  isSubmitting,
  isWriteDisabled,
  onCreateAllergyIntolerance,
  onFormChange
}: AllergyIntoleranceFormProps) {
  return (
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
  );
}

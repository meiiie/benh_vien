import type {
  AllergyCategory,
  AllergyClinicalStatus,
  AllergyCriticality,
  AllergyType,
  AllergyVerificationStatus,
  NewAllergyIntoleranceForm
} from "../../types/allergies.js";

type AllergyIntoleranceClassificationFieldsProps = {
  readonly form: NewAllergyIntoleranceForm;
  readonly onFormChange: (form: NewAllergyIntoleranceForm) => void;
};

export function AllergyIntoleranceClassificationFields({
  form,
  onFormChange
}: AllergyIntoleranceClassificationFieldsProps) {
  return (
    <>
      <label>
        Loại
        <select
          value={form.type}
          onChange={(event) =>
            onFormChange({ ...form, type: event.target.value as AllergyType })
          }
        >
          <option value="allergy">Dị ứng</option>
          <option value="intolerance">Không dung nạp</option>
        </select>
      </label>
      <label>
        Nhóm
        <select
          value={form.category}
          onChange={(event) =>
            onFormChange({ ...form, category: event.target.value as AllergyCategory })
          }
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
            onFormChange({
              ...form,
              clinicalStatus: event.target.value as AllergyClinicalStatus
            })
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
            onFormChange({
              ...form,
              verificationStatus: event.target.value as AllergyVerificationStatus
            })
          }
        >
          <option value="confirmed">Đã xác nhận</option>
          <option value="unconfirmed">Chưa xác nhận</option>
          <option value="refuted">Đã loại trừ</option>
          <option value="entered-in-error">Nhập lỗi</option>
        </select>
      </label>
    </>
  );
}

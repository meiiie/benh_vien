import type { FormEvent } from "react";
import type { NewPatientForm, PatientGender } from "../../types/clinical.js";

type CreatePatientPanelProps = {
  readonly form: NewPatientForm;
  readonly isSubmitting: boolean;
  readonly onCreatePatient: (event: FormEvent<HTMLFormElement>) => Promise<void> | void;
  readonly onFormChange: (form: NewPatientForm) => void;
};

export function CreatePatientPanel({
  form,
  isSubmitting,
  onCreatePatient,
  onFormChange
}: CreatePatientPanelProps) {
  return (
    <article className="panel create-panel">
      <div>
        <p className="eyebrow">Intake</p>
        <h2>Tạo nhanh hồ sơ mới</h2>
      </div>

      <form className="patient-form" onSubmit={(event) => void onCreatePatient(event)}>
        <label>
          Họ tên
          <input
            value={form.fullName}
            onChange={(event) => onFormChange({ ...form, fullName: event.target.value })}
          />
        </label>
        <label>
          Số định danh
          <input
            value={form.nationalId}
            onChange={(event) => onFormChange({ ...form, nationalId: event.target.value })}
          />
        </label>
        <label>
          Mã hồ sơ bệnh viện
          <input
            value={form.hospitalMrn}
            onChange={(event) => onFormChange({ ...form, hospitalMrn: event.target.value })}
          />
        </label>
        <label>
          Ngày sinh
          <input
            type="date"
            value={form.birthDate}
            onChange={(event) => onFormChange({ ...form, birthDate: event.target.value })}
          />
        </label>
        <label>
          Giới tính
          <select
            value={form.gender}
            onChange={(event) =>
              onFormChange({ ...form, gender: event.target.value as PatientGender })
            }
          >
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
            <option value="other">Khác</option>
            <option value="unknown">Chưa rõ</option>
          </select>
        </label>
        <label>
          Điện thoại
          <input
            value={form.phone}
            onChange={(event) => onFormChange({ ...form, phone: event.target.value })}
          />
        </label>
        <label className="wide-field">
          Địa chỉ
          <input
            value={form.address}
            onChange={(event) => onFormChange({ ...form, address: event.target.value })}
          />
        </label>
        <label className="wide-field">
          Cơ sở quản lý
          <input
            value={form.managingOrganizationId}
            onChange={(event) =>
              onFormChange({ ...form, managingOrganizationId: event.target.value })
            }
          />
        </label>
        <button className="primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Đang tạo..." : "Tạo hồ sơ bệnh nhân"}
        </button>
      </form>
    </article>
  );
}

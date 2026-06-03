import type {
  NewProcedureForm,
  ProcedureCategory,
  ProcedureStatus
} from "../../types/careWorkflow.js";

type ProcedureClassificationFieldsProps = {
  readonly form: NewProcedureForm;
  readonly onFormChange: (form: NewProcedureForm) => void;
};

export function ProcedureClassificationFields({
  form,
  onFormChange
}: ProcedureClassificationFieldsProps) {
  return (
    <>
      <label>
        Nhóm Procedure
        <select
          value={form.category}
          onChange={(event) =>
            onFormChange({ ...form, category: event.target.value as ProcedureCategory })
          }
        >
          <option value="diagnostic">Chẩn đoán</option>
          <option value="therapeutic">Điều trị</option>
          <option value="surgical">Phẫu thuật</option>
          <option value="counseling">Tư vấn</option>
          <option value="rehabilitation">Phục hồi chức năng</option>
          <option value="other">Khác</option>
        </select>
      </label>
      <label>
        Trạng thái
        <select
          value={form.status}
          onChange={(event) =>
            onFormChange({ ...form, status: event.target.value as ProcedureStatus })
          }
        >
          <option value="completed">Hoàn tất</option>
          <option value="in-progress">Đang thực hiện</option>
          <option value="preparation">Chuẩn bị</option>
          <option value="not-done">Không thực hiện</option>
          <option value="on-hold">Tạm giữ</option>
          <option value="stopped">Đã dừng</option>
          <option value="unknown">Chưa rõ</option>
        </select>
      </label>
    </>
  );
}

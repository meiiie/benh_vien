import type { FormEvent } from "react";
import { Info } from "../../components/AppShell.js";
import { formatPatientRecordStatus } from "../../lib/clinicalFormatters.js";
import type { Patient, PatientMergeForm } from "../../types/clinical.js";

type PatientMergePanelProps = {
  readonly candidates: readonly Patient[];
  readonly confirmationCode: string;
  readonly form: PatientMergeForm;
  readonly isConfirmationValid: boolean;
  readonly isMerging: boolean;
  readonly selectedPatient?: Patient;
  readonly targetPatientId: string;
  readonly onFormChange: (form: PatientMergeForm) => void;
  readonly onMergePatient: (event: FormEvent<HTMLFormElement>) => Promise<void> | void;
};

export function PatientMergePanel({
  candidates,
  confirmationCode,
  form,
  isConfirmationValid,
  isMerging,
  selectedPatient,
  targetPatientId,
  onFormChange,
  onMergePatient
}: PatientMergePanelProps) {
  const canMergeSelectedPatient = Boolean(selectedPatient && selectedPatient.status === "active");

  return (
    <article className="panel patient-merge-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">MPI Governance</p>
          <h2>Đối soát và merge hồ sơ</h2>
        </div>
        <span className="pill gold">Admin-only</span>
      </div>

      <p className="empty-state">
        Dùng khi phát hiện hồ sơ đăng ký trùng. Hệ thống giữ lại hồ sơ nguồn để
        kiểm toán, đánh dấu chỉ đọc và ghi liên kết tới hồ sơ đích theo hướng
        Master Patient Index.
      </p>

      {selectedPatient ? (
        <div className="detail-grid compact">
          <Info
            label="Hồ sơ nguồn"
            value={`${selectedPatient.fullName} (${selectedPatient.identifiers[0]?.value ?? selectedPatient.id})`}
          />
          <Info label="Trạng thái nguồn" value={formatPatientRecordStatus(selectedPatient.status)} />
          <Info label="Mã xác nhận merge" value={confirmationCode} />
        </div>
      ) : null}

      <form className="patient-form" onSubmit={(event) => void onMergePatient(event)}>
        <label>
          Hồ sơ đích
          <select
            value={targetPatientId}
            onChange={(event) =>
              onFormChange({
                ...form,
                targetPatientId: event.target.value
              })
            }
            disabled={!canMergeSelectedPatient || isMerging || candidates.length === 0}
          >
            {candidates.length === 0 ? (
              <option value="">Không có hồ sơ đích khả dụng</option>
            ) : (
              candidates.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.fullName} · {patient.identifiers[0]?.value ?? patient.id}
                </option>
              ))
            )}
          </select>
        </label>

        <label className="wide-field">
          Lý do merge
          <input
            value={form.reason}
            onChange={(event) =>
              onFormChange({
                ...form,
                reason: event.target.value
              })
            }
            placeholder="Ví dụ: Trùng CCCD/BHYT sau khi đối soát MPI."
          />
        </label>

        <label className="wide-field">
          Nhập lại mã xác nhận của hồ sơ nguồn
          <input
            value={form.confirmationText}
            onChange={(event) =>
              onFormChange({
                ...form,
                confirmationText: event.target.value
              })
            }
            placeholder={confirmationCode || "Chọn hồ sơ nguồn trước"}
          />
        </label>

        {selectedPatient && form.confirmationText.trim() && !isConfirmationValid ? (
          <p className="transfer-alert wide-field">
            Mã xác nhận chưa khớp. Để tránh merge nhầm bệnh án, hãy nhập đúng{" "}
            <strong>{confirmationCode}</strong>.
          </p>
        ) : null}

        {selectedPatient && selectedPatient.status !== "active" ? (
          <p className="transfer-alert wide-field">
            Hồ sơ đang chọn không còn ở trạng thái hoạt động nên không thể dùng làm
            hồ sơ nguồn để merge.
          </p>
        ) : null}

        <button
          className="primary-button"
          type="submit"
          disabled={
            !canMergeSelectedPatient ||
            !targetPatientId ||
            !form.reason.trim() ||
            !isConfirmationValid ||
            isMerging
          }
        >
          {isMerging ? "Đang merge..." : "Merge hồ sơ nguồn"}
        </button>
      </form>
    </article>
  );
}

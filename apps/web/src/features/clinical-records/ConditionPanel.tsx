import type { FormEvent } from "react";
import { Info } from "../../components/AppShell.js";
import {
  formatConditionCategory,
  formatConditionClinicalStatus,
  formatConditionSeverity,
  formatConditionVerificationStatus
} from "./conditionFormatters.js";
import {
  formatDateTime
} from "../../lib/clinicalFormatters.js";
import type {
  Condition,
  NewConditionForm
} from "../../types/conditions.js";
import type { Encounter } from "../../types/encounters.js";
import { ConditionForm } from "./ConditionForm.js";

type ConditionPanelProps = {
  readonly conditions: readonly Condition[];
  readonly encounters: readonly Encounter[];
  readonly form: NewConditionForm;
  readonly isLoading: boolean;
  readonly isSubmitting: boolean;
  readonly isWriteDisabled: boolean;
  readonly selectedCondition?: Condition;
  readonly selectedConditionId?: string;
  readonly onCreateCondition: (event: FormEvent<HTMLFormElement>) => Promise<void> | void;
  readonly onFormChange: (form: NewConditionForm) => void;
  readonly onSelectCondition: (conditionId: string) => void;
};

export function ConditionPanel({
  conditions,
  encounters,
  form,
  isLoading,
  isSubmitting,
  isWriteDisabled,
  selectedCondition,
  selectedConditionId,
  onCreateCondition,
  onFormChange,
  onSelectCondition
}: ConditionPanelProps) {
  return (
    <article className="panel condition-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Conditions</p>
          <h2>Chẩn đoán và vấn đề sức khỏe</h2>
        </div>
        <span className="pill cyan">{isLoading ? "đang tải" : `${conditions.length} chẩn đoán`}</span>
      </div>

      <div className="document-layout">
        <div className="condition-cards">
          {conditions.map((condition) => (
            <button
              className={condition.id === selectedConditionId ? "condition-card selected" : "condition-card"}
              key={condition.id}
              type="button"
              onClick={() => onSelectCondition(condition.id)}
            >
              <span>{formatConditionCategory(condition.category)}</span>
              <strong>{condition.code.display}</strong>
              <small>
                {formatConditionClinicalStatus(condition.clinicalStatus)} ·{" "}
                {formatDateTime(condition.recordedAt)}
              </small>
            </button>
          ))}
          {conditions.length === 0 ? (
            <p className="empty-state">
              Bệnh nhân này chưa có chẩn đoán có cấu trúc. Hãy ghi nhận vấn đề sức khỏe đầu tiên.
            </p>
          ) : null}
        </div>

        <div className="condition-summary">
          {selectedCondition ? (
            <>
              <div className="document-meta">
                <Info label="Nhóm" value={formatConditionCategory(selectedCondition.category)} />
                <Info label="Lâm sàng" value={formatConditionClinicalStatus(selectedCondition.clinicalStatus)} />
                <Info label="Xác minh" value={formatConditionVerificationStatus(selectedCondition.verificationStatus)} />
                <Info label="Mã chuẩn" value={`${selectedCondition.code.system} · ${selectedCondition.code.code}`} />
                <Info
                  label="Mức độ"
                  value={selectedCondition.severity ? formatConditionSeverity(selectedCondition.severity) : "Chưa gắn"}
                />
                <Info label="Encounter" value={selectedCondition.encounterId ?? "Chưa gắn"} />
              </div>
              <p className="empty-state">
                Condition giúp bên nhận hiểu chẩn đoán/vấn đề sức khỏe ở dạng có cấu trúc, thay vì chỉ đọc thủ công trong file PDF.
              </p>
            </>
          ) : (
            <p className="empty-state">Chọn một chẩn đoán để xem siêu dữ liệu và xuất FHIR Condition.</p>
          )}
        </div>
      </div>

      <ConditionForm
        encounters={encounters}
        form={form}
        isSubmitting={isSubmitting}
        isWriteDisabled={isWriteDisabled}
        onCreateCondition={onCreateCondition}
        onFormChange={onFormChange}
      />
    </article>
  );
}

import type { FormEvent } from "react";
import { Info } from "../../components/AppShell.js";
import {
  formatAllergyCategory,
  formatAllergyClinicalStatus,
  formatAllergyCriticality,
  formatAllergyType,
  formatAllergyVerificationStatus
} from "./allergyFormatters.js";
import {
  formatDateTime
} from "../../lib/clinicalFormatters.js";
import type {
  AllergyIntolerance,
  NewAllergyIntoleranceForm
} from "../../types/allergies.js";
import type { Encounter } from "../../types/encounters.js";
import { AllergyIntoleranceForm } from "./AllergyIntoleranceForm.js";

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

      <AllergyIntoleranceForm
        encounters={encounters}
        form={form}
        isSubmitting={isSubmitting}
        isWriteDisabled={isWriteDisabled}
        onCreateAllergyIntolerance={onCreateAllergyIntolerance}
        onFormChange={onFormChange}
      />
    </article>
  );
}

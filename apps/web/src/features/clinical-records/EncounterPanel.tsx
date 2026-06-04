import type { FormEvent } from "react";
import type {
  Encounter,
  NewEncounterForm
} from "../../types/encounters.js";
import { EncounterForm } from "./EncounterForm.js";
import { EncounterSummary } from "./EncounterSummary.js";
import { EncounterTimeline } from "./EncounterTimeline.js";
import type { EncounterPanelCounts } from "./EncounterPanelTypes.js";

export type { EncounterPanelCounts } from "./EncounterPanelTypes.js";

type EncounterPanelProps = {
  readonly encounters: readonly Encounter[];
  readonly form: NewEncounterForm;
  readonly isFinishing: boolean;
  readonly isLoading: boolean;
  readonly isSubmitting: boolean;
  readonly isWriteDisabled: boolean;
  readonly selectedEncounter?: Encounter;
  readonly selectedEncounterCounts: EncounterPanelCounts;
  readonly selectedEncounterId?: string;
  readonly onCreateEncounter: (event: FormEvent<HTMLFormElement>) => Promise<void> | void;
  readonly onFinishEncounter: (encounterId: string) => Promise<void> | void;
  readonly onFormChange: (form: NewEncounterForm) => void;
  readonly onSelectEncounter: (encounterId: string) => void;
};

export function EncounterPanel({
  encounters,
  form,
  isFinishing,
  isLoading,
  isSubmitting,
  isWriteDisabled,
  selectedEncounter,
  selectedEncounterCounts,
  selectedEncounterId,
  onCreateEncounter,
  onFinishEncounter,
  onFormChange,
  onSelectEncounter
}: EncounterPanelProps) {
  return (
    <article className="panel encounter-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Dòng thời gian lượt khám</p>
          <h2>Lượt khám và đợt điều trị</h2>
        </div>
        <span className="pill cyan">{isLoading ? "đang tải" : `${encounters.length} lượt`}</span>
      </div>

      <div className="encounter-layout">
        <EncounterTimeline
          encounters={encounters}
          selectedEncounterId={selectedEncounterId}
          onSelectEncounter={onSelectEncounter}
        />
        <EncounterSummary
          isFinishing={isFinishing}
          isWriteDisabled={isWriteDisabled}
          selectedEncounter={selectedEncounter}
          selectedEncounterCounts={selectedEncounterCounts}
          onFinishEncounter={onFinishEncounter}
        />
      </div>

      <EncounterForm
        form={form}
        isSubmitting={isSubmitting}
        isWriteDisabled={isWriteDisabled}
        onCreateEncounter={onCreateEncounter}
        onFormChange={onFormChange}
      />
    </article>
  );
}

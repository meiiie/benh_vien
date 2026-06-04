import type { FormEvent } from "react";
import type { Encounter } from "../../types/encounters.js";
import type {
  MedicationDispense,
  MedicationRequest,
  NewMedicationDispenseForm
} from "../../types/medications.js";
import { MedicationDispenseForm } from "./MedicationDispenseForm.js";
import { MedicationDispenseList } from "./MedicationDispenseList.js";
import { MedicationDispenseSummary } from "./MedicationDispenseSummary.js";

type MedicationDispensePanelProps = {
  readonly encounters: readonly Encounter[];
  readonly form: NewMedicationDispenseForm;
  readonly isLoading: boolean;
  readonly isSubmitting: boolean;
  readonly isWriteDisabled: boolean;
  readonly medicationDispenses: readonly MedicationDispense[];
  readonly medicationRequests: readonly MedicationRequest[];
  readonly selectedMedicationDispense?: MedicationDispense;
  readonly selectedMedicationDispenseId?: string;
  readonly onCreateMedicationDispense: (
    event: FormEvent<HTMLFormElement>
  ) => Promise<void> | void;
  readonly onFormChange: (form: NewMedicationDispenseForm) => void;
  readonly onSelectMedicationDispense: (medicationDispenseId: string) => void;
};

export function MedicationDispensePanel({
  encounters,
  form,
  isLoading,
  isSubmitting,
  isWriteDisabled,
  medicationDispenses,
  medicationRequests,
  selectedMedicationDispense,
  selectedMedicationDispenseId,
  onCreateMedicationDispense,
  onFormChange,
  onSelectMedicationDispense
}: MedicationDispensePanelProps) {
  return (
    <article className="panel medication-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">FHIR MedicationDispense</p>
          <h2>Cấp phát thuốc</h2>
        </div>
        <span className="pill cyan">
          {isLoading ? "đang tải" : `${medicationDispenses.length} lần cấp`}
        </span>
      </div>

      <div className="document-layout">
        <MedicationDispenseList
          medicationDispenses={medicationDispenses}
          selectedMedicationDispenseId={selectedMedicationDispenseId}
          onSelectMedicationDispense={onSelectMedicationDispense}
        />
        <MedicationDispenseSummary
          selectedMedicationDispense={selectedMedicationDispense}
        />
      </div>

      <MedicationDispenseForm
        encounters={encounters}
        form={form}
        isSubmitting={isSubmitting}
        isWriteDisabled={isWriteDisabled}
        medicationRequests={medicationRequests}
        onCreateMedicationDispense={onCreateMedicationDispense}
        onFormChange={onFormChange}
      />
    </article>
  );
}

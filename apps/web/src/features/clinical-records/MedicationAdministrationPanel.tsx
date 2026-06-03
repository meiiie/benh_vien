import type { FormEvent } from "react";
import type { Condition } from "../../types/conditions.js";
import type { Encounter } from "../../types/encounters.js";
import type {
  MedicationAdministration,
  MedicationRequest,
  NewMedicationAdministrationForm
} from "../../types/medications.js";
import { MedicationAdministrationForm } from "./MedicationAdministrationForm.js";
import { MedicationAdministrationList } from "./MedicationAdministrationList.js";
import { MedicationAdministrationSummary } from "./MedicationAdministrationSummary.js";

type MedicationAdministrationPanelProps = {
  readonly conditions: readonly Condition[];
  readonly encounters: readonly Encounter[];
  readonly form: NewMedicationAdministrationForm;
  readonly isLoading: boolean;
  readonly isSubmitting: boolean;
  readonly isWriteDisabled: boolean;
  readonly medicationAdministrations: readonly MedicationAdministration[];
  readonly medicationRequests: readonly MedicationRequest[];
  readonly selectedMedicationAdministration?: MedicationAdministration;
  readonly selectedMedicationAdministrationId?: string;
  readonly onCreateMedicationAdministration: (
    event: FormEvent<HTMLFormElement>
  ) => Promise<void> | void;
  readonly onFormChange: (form: NewMedicationAdministrationForm) => void;
  readonly onSelectMedicationAdministration: (
    medicationAdministrationId: string
  ) => void;
};

export function MedicationAdministrationPanel({
  conditions,
  encounters,
  form,
  isLoading,
  isSubmitting,
  isWriteDisabled,
  medicationAdministrations,
  medicationRequests,
  selectedMedicationAdministration,
  selectedMedicationAdministrationId,
  onCreateMedicationAdministration,
  onFormChange,
  onSelectMedicationAdministration
}: MedicationAdministrationPanelProps) {
  return (
    <article className="panel medication-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">FHIR MedicationAdministration</p>
          <h2>Dùng thuốc thực tế</h2>
        </div>
        <span className="pill cyan">
          {isLoading ? "đang tải" : `${medicationAdministrations.length} lần dùng`}
        </span>
      </div>

      <div className="document-layout">
        <MedicationAdministrationList
          medicationAdministrations={medicationAdministrations}
          selectedMedicationAdministrationId={selectedMedicationAdministrationId}
          onSelectMedicationAdministration={onSelectMedicationAdministration}
        />
        <MedicationAdministrationSummary
          selectedMedicationAdministration={selectedMedicationAdministration}
        />
      </div>

      <MedicationAdministrationForm
        conditions={conditions}
        encounters={encounters}
        form={form}
        isSubmitting={isSubmitting}
        isWriteDisabled={isWriteDisabled}
        medicationRequests={medicationRequests}
        onCreateMedicationAdministration={onCreateMedicationAdministration}
        onFormChange={onFormChange}
      />
    </article>
  );
}

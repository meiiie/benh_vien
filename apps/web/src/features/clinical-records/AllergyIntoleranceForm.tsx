import type { FormEvent } from "react";
import type { NewAllergyIntoleranceForm } from "../../types/allergies.js";
import type { Encounter } from "../../types/encounters.js";
import { AllergyIntoleranceClassificationFields } from "./AllergyIntoleranceClassificationFields.js";
import { AllergyIntoleranceCodeFields } from "./AllergyIntoleranceCodeFields.js";
import { AllergyIntoleranceContextFields } from "./AllergyIntoleranceContextFields.js";
import { AllergyIntoleranceNoteFields } from "./AllergyIntoleranceNoteFields.js";
import { AllergyIntoleranceReactionFields } from "./AllergyIntoleranceReactionFields.js";
import { AllergyIntoleranceRecordFields } from "./AllergyIntoleranceRecordFields.js";

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
      <AllergyIntoleranceContextFields
        encounters={encounters}
        form={form}
        onFormChange={onFormChange}
      />
      <AllergyIntoleranceClassificationFields form={form} onFormChange={onFormChange} />
      <AllergyIntoleranceCodeFields form={form} onFormChange={onFormChange} />
      <AllergyIntoleranceReactionFields form={form} onFormChange={onFormChange} />
      <AllergyIntoleranceRecordFields form={form} onFormChange={onFormChange} />
      <AllergyIntoleranceNoteFields form={form} onFormChange={onFormChange} />
      <button className="primary-button" type="submit" disabled={isWriteDisabled || isSubmitting}>
        {isSubmitting ? "Đang ghi nhận..." : "Ghi nhận dị ứng/cảnh báo"}
      </button>
    </form>
  );
}

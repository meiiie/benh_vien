import type { NewImagingStudyForm } from "../../types/diagnosticResults.js";

type ImagingStudySeriesReferenceFieldsProps = {
  readonly form: NewImagingStudyForm;
  readonly onFormChange: (form: NewImagingStudyForm) => void;
};

export function ImagingStudySeriesReferenceFields({
  form,
  onFormChange
}: ImagingStudySeriesReferenceFieldsProps) {
  return (
    <>
      <label className="wide-field">
        DICOM Series Instance UID
        <input
          value={form.seriesUid}
          onChange={(event) => onFormChange({ ...form, seriesUid: event.target.value })}
        />
      </label>
      <label>
        Số thứ tự series
        <input
          value={form.seriesNumber}
          onChange={(event) => onFormChange({ ...form, seriesNumber: event.target.value })}
        />
      </label>
      <label>
        Số ảnh
        <input
          value={form.numberOfInstances}
          onChange={(event) => onFormChange({ ...form, numberOfInstances: event.target.value })}
        />
      </label>
    </>
  );
}

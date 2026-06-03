import type { NewImagingStudyForm } from "../../types/diagnosticResults.js";

type ImagingStudyStudyIdentityFieldsProps = {
  readonly form: NewImagingStudyForm;
  readonly onFormChange: (form: NewImagingStudyForm) => void;
};

export function ImagingStudyStudyIdentityFields({
  form,
  onFormChange
}: ImagingStudyStudyIdentityFieldsProps) {
  return (
    <>
      <label className="wide-field">
        DICOM Study Instance UID
        <input
          value={form.studyInstanceUid}
          onChange={(event) => onFormChange({ ...form, studyInstanceUid: event.target.value })}
        />
      </label>
      <label>
        Accession number
        <input
          value={form.accessionNumber}
          onChange={(event) => onFormChange({ ...form, accessionNumber: event.target.value })}
        />
      </label>
      <label>
        Thời điểm bắt đầu
        <input
          type="datetime-local"
          value={form.startedAt}
          onChange={(event) => onFormChange({ ...form, startedAt: event.target.value })}
        />
      </label>
      <label className="wide-field">
        Mô tả nghiên cứu
        <input
          value={form.description}
          onChange={(event) => onFormChange({ ...form, description: event.target.value })}
        />
      </label>
    </>
  );
}

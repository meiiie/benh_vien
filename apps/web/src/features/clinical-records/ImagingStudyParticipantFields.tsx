import type { NewImagingStudyForm } from "../../types/diagnosticResults.js";

type ImagingStudyParticipantFieldsProps = {
  readonly form: NewImagingStudyForm;
  readonly onFormChange: (form: NewImagingStudyForm) => void;
};

export function ImagingStudyParticipantFields({
  form,
  onFormChange
}: ImagingStudyParticipantFieldsProps) {
  return (
    <>
      <label>
        Bác sĩ chỉ định
        <input
          value={form.referrerPractitionerId}
          onChange={(event) =>
            onFormChange({
              ...form,
              referrerPractitionerId: event.target.value
            })
          }
        />
      </label>
      <label>
        Bác sĩ đọc ảnh
        <input
          value={form.interpreterPractitionerId}
          onChange={(event) =>
            onFormChange({
              ...form,
              interpreterPractitionerId: event.target.value
            })
          }
        />
      </label>
      <label className="wide-field">
        Endpoint PACS/DICOMweb
        <input
          value={form.endpointId}
          onChange={(event) => onFormChange({ ...form, endpointId: event.target.value })}
        />
      </label>
    </>
  );
}

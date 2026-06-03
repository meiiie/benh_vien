import type { NewImagingStudyForm } from "../../types/diagnosticResults.js";

type ImagingStudySeriesDetailFieldsProps = {
  readonly form: NewImagingStudyForm;
  readonly onFormChange: (form: NewImagingStudyForm) => void;
};

export function ImagingStudySeriesDetailFields({
  form,
  onFormChange
}: ImagingStudySeriesDetailFieldsProps) {
  return (
    <>
      <label>
        Hệ mã modality
        <input
          value={form.modalitySystem}
          onChange={(event) => onFormChange({ ...form, modalitySystem: event.target.value })}
        />
      </label>
      <label>
        Mã modality
        <input
          value={form.modalityCode}
          onChange={(event) => onFormChange({ ...form, modalityCode: event.target.value })}
        />
      </label>
      <label className="wide-field">
        Tên modality
        <input
          value={form.modalityDisplay}
          onChange={(event) => onFormChange({ ...form, modalityDisplay: event.target.value })}
        />
      </label>
      <label className="wide-field">
        Mô tả series
        <input
          value={form.seriesDescription}
          onChange={(event) => onFormChange({ ...form, seriesDescription: event.target.value })}
        />
      </label>
      <label>
        Hệ mã vùng chụp
        <input
          value={form.bodySiteSystem}
          onChange={(event) => onFormChange({ ...form, bodySiteSystem: event.target.value })}
        />
      </label>
      <label>
        Mã vùng chụp
        <input
          value={form.bodySiteCode}
          onChange={(event) => onFormChange({ ...form, bodySiteCode: event.target.value })}
        />
      </label>
      <label>
        Tên vùng chụp
        <input
          value={form.bodySiteDisplay}
          onChange={(event) => onFormChange({ ...form, bodySiteDisplay: event.target.value })}
        />
      </label>
    </>
  );
}

import type { FormEvent } from "react";
import type { ServiceRequest } from "../../types/careWorkflow.js";
import type {
  DiagnosticReport,
  NewImagingStudyForm
} from "../../types/diagnosticResults.js";
import type { Encounter } from "../../types/encounters.js";
import { ImagingStudyContextFields } from "./ImagingStudyContextFields.js";
import { ImagingStudyParticipantFields } from "./ImagingStudyParticipantFields.js";
import { ImagingStudySeriesDetailFields } from "./ImagingStudySeriesDetailFields.js";
import { ImagingStudySeriesReferenceFields } from "./ImagingStudySeriesReferenceFields.js";
import { ImagingStudyStudyIdentityFields } from "./ImagingStudyStudyIdentityFields.js";

type ImagingStudyFormProps = {
  readonly diagnosticReports: readonly DiagnosticReport[];
  readonly encounters: readonly Encounter[];
  readonly form: NewImagingStudyForm;
  readonly isSubmitting: boolean;
  readonly isWriteDisabled: boolean;
  readonly serviceRequests: readonly ServiceRequest[];
  readonly onCreateImagingStudy: (event: FormEvent<HTMLFormElement>) => Promise<void> | void;
  readonly onFormChange: (form: NewImagingStudyForm) => void;
};

export function ImagingStudyForm({
  diagnosticReports,
  encounters,
  form,
  isSubmitting,
  isWriteDisabled,
  serviceRequests,
  onCreateImagingStudy,
  onFormChange
}: ImagingStudyFormProps) {
  return (
    <form className="imaging-study-form" onSubmit={(event) => void onCreateImagingStudy(event)}>
      <ImagingStudyContextFields
        diagnosticReports={diagnosticReports}
        encounters={encounters}
        form={form}
        serviceRequests={serviceRequests}
        onFormChange={onFormChange}
      />
      <ImagingStudyStudyIdentityFields form={form} onFormChange={onFormChange} />
      <ImagingStudyParticipantFields form={form} onFormChange={onFormChange} />
      <ImagingStudySeriesReferenceFields form={form} onFormChange={onFormChange} />
      <ImagingStudySeriesDetailFields form={form} onFormChange={onFormChange} />
      <button className="primary-button" type="submit" disabled={isWriteDisabled || isSubmitting}>
        {isSubmitting ? "Đang tạo..." : "Tạo ImagingStudy"}
      </button>
    </form>
  );
}

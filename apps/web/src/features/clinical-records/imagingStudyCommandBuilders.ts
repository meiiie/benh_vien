import { toApiDateTime } from "../../lib/clinicalFormatters.js";
import type { CommandDraft } from "../../lib/commandDrafts.js";
import {
  parseDicomUid,
  parseOptionalApiDateTime,
  parseOptionalFhirUnsignedInt
} from "../../lib/commandDrafts.js";
import type { NewImagingStudyForm } from "../../types/diagnosticResults.js";
import type { createImagingStudy } from "./clinicalRecordApi.js";

type CreateImagingStudyCommand = Parameters<typeof createImagingStudy>[2];

type ImagingStudyCommandOptions = {
  readonly startedAt?: string;
  readonly seriesNumber?: number;
  readonly numberOfInstances?: number;
  readonly seriesUid?: string;
  readonly studyInstanceUid?: string;
};

export function buildImagingStudyCommand(
  form: NewImagingStudyForm,
  options: ImagingStudyCommandOptions = {}
): CreateImagingStudyCommand {
  return {
    encounterId: form.encounterId || undefined,
    basedOnServiceRequestId: form.basedOnServiceRequestId || undefined,
    diagnosticReportId: form.diagnosticReportId || undefined,
    studyInstanceUid: options.studyInstanceUid ?? form.studyInstanceUid,
    accessionNumber: form.accessionNumber || undefined,
    description: form.description || undefined,
    startedAt:
      options.startedAt ??
      (form.startedAt ? toApiDateTime(form.startedAt) : undefined),
    referrerPractitionerId: form.referrerPractitionerId || undefined,
    interpreterPractitionerId: form.interpreterPractitionerId || undefined,
    endpointId: form.endpointId || undefined,
    series: [
      {
        uid: options.seriesUid ?? form.seriesUid,
        number: options.seriesNumber,
        modality: {
          system: form.modalitySystem,
          code: form.modalityCode,
          display: form.modalityDisplay
        },
        description: form.seriesDescription || undefined,
        numberOfInstances: options.numberOfInstances,
        bodySite:
          form.bodySiteCode || form.bodySiteDisplay
            ? {
                system: form.bodySiteSystem,
                code: form.bodySiteCode,
                display: form.bodySiteDisplay
              }
            : undefined
      }
    ]
  };
}

export function buildImagingStudyCommandDraft(
  form: NewImagingStudyForm
): CommandDraft<CreateImagingStudyCommand> {
  const seriesNumber = parseOptionalFhirUnsignedInt(
    form.seriesNumber,
    "Số thứ tự series phải là số nguyên FHIR unsignedInt hợp lệ."
  );

  if (!seriesNumber.ok) {
    return seriesNumber;
  }

  const numberOfInstances = parseOptionalFhirUnsignedInt(
    form.numberOfInstances,
    "Số ảnh trong series phải là số nguyên FHIR unsignedInt hợp lệ."
  );

  if (!numberOfInstances.ok) {
    return numberOfInstances;
  }

  const startedAt = parseOptionalApiDateTime(
    form.startedAt,
    "Thời điểm bắt đầu nghiên cứu hình ảnh phải là ngày giờ hợp lệ."
  );

  if (!startedAt.ok) {
    return startedAt;
  }

  const studyInstanceUid = parseDicomUid(
    form.studyInstanceUid,
    "DICOM Study Instance UID không hợp lệ."
  );

  if (!studyInstanceUid.ok) {
    return studyInstanceUid;
  }

  const seriesUid = parseDicomUid(
    form.seriesUid,
    "DICOM Series Instance UID không hợp lệ."
  );

  if (!seriesUid.ok) {
    return seriesUid;
  }

  return {
    ok: true,
    command: buildImagingStudyCommand(form, {
      numberOfInstances: numberOfInstances.value,
      seriesUid: seriesUid.value,
      startedAt: startedAt.value,
      seriesNumber: seriesNumber.value,
      studyInstanceUid: studyInstanceUid.value
    })
  };
}

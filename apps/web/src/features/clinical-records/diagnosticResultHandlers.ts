import type {
  CarePlanHandlers,
  CarePlanHandlerConfig,
  EnsureSelectedWritablePatient
} from "./carePlanHandlerTypes.js";
import {
  buildDiagnosticReportCommand,
  buildImagingStudyCommandDraft
} from "./carePlanCommandBuilders.js";
import {
  createDiagnosticReport,
  createImagingStudy
} from "./clinicalRecordApi.js";

type DiagnosticResultHandlerConfig = Pick<
  CarePlanHandlerConfig,
  | "clinicalApi"
  | "diagnosticReportForm"
  | "imagingStudyForm"
  | "loadAuditEvents"
  | "loadDiagnosticReports"
  | "loadImagingStudies"
  | "loadPatientFhirBundlePreview"
  | "setAppRoute"
  | "setIsSubmittingDiagnosticReport"
  | "setIsSubmittingImagingStudy"
  | "setStatusMessage"
> & {
  readonly ensureSelectedWritablePatient: EnsureSelectedWritablePatient;
};

export function buildDiagnosticResultHandlers(
  config: DiagnosticResultHandlerConfig
): Pick<CarePlanHandlers, "handleCreateDiagnosticReport" | "handleCreateImagingStudy"> {
  return {
    handleCreateDiagnosticReport: async (event) => {
      event.preventDefault();

      const selectedPatient = config.ensureSelectedWritablePatient(
        "Cần chọn bệnh nhân trước khi tạo báo cáo kết quả."
      );

      if (!selectedPatient) {
        return;
      }

      config.setIsSubmittingDiagnosticReport(true);

      try {
        const createdDiagnosticReport = await createDiagnosticReport(
          config.clinicalApi,
          selectedPatient.id,
          buildDiagnosticReportCommand(config.diagnosticReportForm)
        );
        await config.loadDiagnosticReports(
          selectedPatient.id,
          createdDiagnosticReport.id
        );
        await config.loadPatientFhirBundlePreview(selectedPatient.id);
        await config.loadAuditEvents(selectedPatient.id, { silent: true });
        config.setAppRoute("workspace");
        config.setStatusMessage(
          `Đã tạo báo cáo kết quả "${createdDiagnosticReport.code.display}" cho ${selectedPatient.fullName}.`
        );
      } catch (error) {
        config.setStatusMessage(
          error instanceof Error
            ? `Không thể tạo báo cáo kết quả: ${error.message}`
            : "Không thể tạo báo cáo kết quả."
        );
      } finally {
        config.setIsSubmittingDiagnosticReport(false);
      }
    },
    handleCreateImagingStudy: async (event) => {
      event.preventDefault();

      const selectedPatient = config.ensureSelectedWritablePatient(
        "Cần chọn bệnh nhân trước khi tạo nghiên cứu hình ảnh."
      );

      if (!selectedPatient) {
        return;
      }

      const commandDraft = buildImagingStudyCommandDraft(config.imagingStudyForm);

      if (!commandDraft.ok) {
        config.setStatusMessage(commandDraft.message);
        return;
      }

      config.setIsSubmittingImagingStudy(true);

      try {
        const createdImagingStudy = await createImagingStudy(
          config.clinicalApi,
          selectedPatient.id,
          commandDraft.command
        );
        await config.loadImagingStudies(selectedPatient.id, createdImagingStudy.id);
        await config.loadPatientFhirBundlePreview(selectedPatient.id);
        await config.loadAuditEvents(selectedPatient.id, { silent: true });
        config.setAppRoute("workspace");
        config.setStatusMessage(
          `Đã tạo nghiên cứu hình ảnh "${createdImagingStudy.description ?? createdImagingStudy.studyInstanceUid}" cho ${selectedPatient.fullName}.`
        );
      } catch (error) {
        config.setStatusMessage(
          error instanceof Error
            ? `Không thể tạo nghiên cứu hình ảnh: ${error.message}`
            : "Không thể tạo nghiên cứu hình ảnh."
        );
      } finally {
        config.setIsSubmittingImagingStudy(false);
      }
    }
  };
}

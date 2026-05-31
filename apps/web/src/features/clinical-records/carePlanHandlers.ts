import type { FormEvent } from "react";
import type { ClinicalApiClient } from "../../api/clinicalApi.js";
import type {
  AppRoute,
  NewDiagnosticReportForm,
  NewImagingStudyForm,
  NewProcedureForm,
  NewServiceRequestForm,
  Patient
} from "../../types/clinical.js";
import {
  createDiagnosticReport,
  createImagingStudy,
  createProcedure,
  createServiceRequest
} from "./clinicalRecordApi.js";
import {
  buildDiagnosticReportCommand,
  buildImagingStudyCommandDraft,
  buildProcedureCommand,
  buildServiceRequestCommand
} from "./carePlanCommandBuilders.js";

type CarePlanHandlerConfig = {
  readonly clinicalApi: ClinicalApiClient;
  readonly diagnosticReportForm: NewDiagnosticReportForm;
  readonly ensureSelectedPatientWritable: () => boolean;
  readonly imagingStudyForm: NewImagingStudyForm;
  readonly loadAuditEvents: (
    patientId: string,
    options?: { readonly silent?: boolean }
  ) => Promise<void>;
  readonly loadDiagnosticReports: (
    patientId: string,
    nextSelectedDiagnosticReportId?: string
  ) => Promise<void>;
  readonly loadImagingStudies: (
    patientId: string,
    nextSelectedImagingStudyId?: string
  ) => Promise<void>;
  readonly loadPatientFhirBundlePreview: (patientId: string) => Promise<void>;
  readonly loadPatientFhirDocumentBundlePreview: (patientId: string) => Promise<void>;
  readonly loadProcedures: (
    patientId: string,
    nextSelectedProcedureId?: string
  ) => Promise<void>;
  readonly loadServiceRequests: (
    patientId: string,
    nextSelectedServiceRequestId?: string
  ) => Promise<void>;
  readonly procedureForm: NewProcedureForm;
  readonly selectedPatient: Patient | undefined;
  readonly serviceRequestForm: NewServiceRequestForm;
  readonly setAppRoute: (route: AppRoute) => void;
  readonly setIsSubmittingDiagnosticReport: (isSubmitting: boolean) => void;
  readonly setIsSubmittingImagingStudy: (isSubmitting: boolean) => void;
  readonly setIsSubmittingProcedure: (isSubmitting: boolean) => void;
  readonly setIsSubmittingServiceRequest: (isSubmitting: boolean) => void;
  readonly setStatusMessage: (message: string) => void;
};

export function buildCarePlanHandlers(config: CarePlanHandlerConfig) {
  const ensureSelectedWritablePatient = (emptyMessage: string): Patient | undefined => {
    if (!config.selectedPatient) {
      config.setStatusMessage(emptyMessage);
      return undefined;
    }

    if (!config.ensureSelectedPatientWritable()) {
      return undefined;
    }

    return config.selectedPatient;
  };

  return {
    handleCreateDiagnosticReport: async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const selectedPatient = ensureSelectedWritablePatient(
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
    handleCreateImagingStudy: async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const selectedPatient = ensureSelectedWritablePatient(
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
    },
    handleCreateProcedure: async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const selectedPatient = ensureSelectedWritablePatient(
        "Cần chọn bệnh nhân trước khi ghi nhận thủ thuật/hoạt động đã thực hiện."
      );

      if (!selectedPatient) {
        return;
      }

      config.setIsSubmittingProcedure(true);

      try {
        const createdProcedure = await createProcedure(
          config.clinicalApi,
          selectedPatient.id,
          buildProcedureCommand(config.procedureForm)
        );
        await config.loadProcedures(selectedPatient.id, createdProcedure.id);
        await config.loadPatientFhirBundlePreview(selectedPatient.id);
        await config.loadPatientFhirDocumentBundlePreview(selectedPatient.id);
        await config.loadAuditEvents(selectedPatient.id, { silent: true });
        config.setAppRoute("workspace");
        config.setStatusMessage(
          `Đã ghi nhận Procedure "${createdProcedure.code.display}" cho ${selectedPatient.fullName}.`
        );
      } catch (error) {
        config.setStatusMessage(
          error instanceof Error
            ? `Không thể ghi nhận thủ thuật/hoạt động: ${error.message}`
            : "Không thể ghi nhận thủ thuật/hoạt động."
        );
      } finally {
        config.setIsSubmittingProcedure(false);
      }
    },
    handleCreateServiceRequest: async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const selectedPatient = ensureSelectedWritablePatient(
        "Cần chọn bệnh nhân trước khi tạo chỉ định dịch vụ."
      );

      if (!selectedPatient) {
        return;
      }

      config.setIsSubmittingServiceRequest(true);

      try {
        const createdServiceRequest = await createServiceRequest(
          config.clinicalApi,
          selectedPatient.id,
          buildServiceRequestCommand(config.serviceRequestForm)
        );
        await config.loadServiceRequests(selectedPatient.id, createdServiceRequest.id);
        await config.loadPatientFhirBundlePreview(selectedPatient.id);
        await config.loadAuditEvents(selectedPatient.id, { silent: true });
        config.setAppRoute("workspace");
        config.setStatusMessage(
          `Đã tạo chỉ định dịch vụ "${createdServiceRequest.code.display}" cho ${selectedPatient.fullName}.`
        );
      } catch (error) {
        config.setStatusMessage(
          error instanceof Error
            ? `Không thể tạo chỉ định dịch vụ: ${error.message}`
            : "Không thể tạo chỉ định dịch vụ."
        );
      } finally {
        config.setIsSubmittingServiceRequest(false);
      }
    }
  };
}

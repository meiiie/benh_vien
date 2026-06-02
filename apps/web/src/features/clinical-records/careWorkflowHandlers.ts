import type {
  CarePlanHandlers,
  CarePlanHandlerConfig,
  EnsureSelectedWritablePatient
} from "./carePlanHandlerTypes.js";
import {
  buildProcedureCommand,
  buildServiceRequestCommand
} from "./carePlanCommandBuilders.js";
import {
  createProcedure,
  createServiceRequest
} from "./clinicalRecordApi.js";

type CareWorkflowHandlerConfig = Pick<
  CarePlanHandlerConfig,
  | "clinicalApi"
  | "loadAuditEvents"
  | "loadPatientFhirBundlePreview"
  | "loadPatientFhirDocumentBundlePreview"
  | "loadProcedures"
  | "loadServiceRequests"
  | "procedureForm"
  | "serviceRequestForm"
  | "setAppRoute"
  | "setIsSubmittingProcedure"
  | "setIsSubmittingServiceRequest"
  | "setStatusMessage"
> & {
  readonly ensureSelectedWritablePatient: EnsureSelectedWritablePatient;
};

export function buildCareWorkflowHandlers(
  config: CareWorkflowHandlerConfig
): Pick<CarePlanHandlers, "handleCreateProcedure" | "handleCreateServiceRequest"> {
  return {
    handleCreateProcedure: async (event) => {
      event.preventDefault();

      const selectedPatient = config.ensureSelectedWritablePatient(
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
    handleCreateServiceRequest: async (event) => {
      event.preventDefault();

      const selectedPatient = config.ensureSelectedWritablePatient(
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

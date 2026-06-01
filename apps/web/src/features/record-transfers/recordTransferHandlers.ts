import type { FormEvent } from "react";
import type { ClinicalApiClient } from "../../api/clinicalApi.js";
import type { Patient } from "../../types/patientRegistry.js";
import type {
  GatewayAcknowledgementForm,
  NewRecordTransferForm,
  RecordTransfer
} from "../../types/recordTransfers.js";
import {
  acknowledgeRecordTransfer,
  createRecordTransfer,
  failRecordTransfer,
  receiveRecordTransfer,
  retryRecordTransfer,
  sendRecordTransfer
} from "./recordTransferApi.js";
import { recordTransferCommands } from "./recordTransferCommandBuilders.js";

type RecordTransferHandlerConfig = {
  readonly clinicalApi: ClinicalApiClient;
  readonly ensureSelectedPatientWritable: () => boolean;
  readonly gatewayAcknowledgementForm: GatewayAcknowledgementForm;
  readonly loadRecordTransferDeliveryAttempts: (recordTransferId: string) => Promise<void>;
  readonly loadRecordTransferFhirTaskPreview: (recordTransferId: string) => Promise<void>;
  readonly loadRecordTransfers: (
    patientId: string,
    nextSelectedRecordTransferId?: string
  ) => Promise<void>;
  readonly recordTransferForm: NewRecordTransferForm;
  readonly selectedPatient: Patient | undefined;
  readonly setGatewayAcknowledgementResult: (
    recordTransfer: RecordTransfer | undefined
  ) => void;
  readonly setIsSubmittingGatewayAcknowledgement: (isSubmitting: boolean) => void;
  readonly setIsSubmittingRecordTransfer: (isSubmitting: boolean) => void;
  readonly setStatusMessage: (message: string) => void;
  readonly setTransitioningRecordTransferId: (
    recordTransferId: string | undefined
  ) => void;
};

export function buildRecordTransferHandlers(config: RecordTransferHandlerConfig) {
  const refreshSelectedTransfer = async (
    selectedPatient: Patient,
    recordTransferId: string
  ) => {
    await config.loadRecordTransfers(selectedPatient.id, recordTransferId);
    await config.loadRecordTransferFhirTaskPreview(recordTransferId);
    await config.loadRecordTransferDeliveryAttempts(recordTransferId);
  };

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
    handleCreateRecordTransfer: async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const selectedPatient = ensureSelectedWritablePatient(
        "Cần chọn bệnh nhân trước khi tạo gói chuyển hồ sơ."
      );

      if (!selectedPatient) {
        return;
      }

      config.setIsSubmittingRecordTransfer(true);

      try {
        const createdTransfer = await createRecordTransfer(
          config.clinicalApi,
          selectedPatient.id,
          recordTransferCommands.create(config.recordTransferForm)
        );
        await config.loadRecordTransfers(selectedPatient.id, createdTransfer.id);
        config.setStatusMessage(
          `Đã tạo gói chuyển hồ sơ ${createdTransfer.id} cho ${selectedPatient.fullName}.`
        );
      } catch (error) {
        config.setStatusMessage(
          error instanceof Error
            ? `Không thể tạo gói chuyển hồ sơ: ${error.message}`
            : "Không thể tạo gói chuyển hồ sơ."
        );
      } finally {
        config.setIsSubmittingRecordTransfer(false);
      }
    },
    handleFailRecordTransfer: async (recordTransfer: RecordTransfer) => {
      const selectedPatient = ensureSelectedWritablePatient(
        "Cần chọn bệnh nhân trước khi ghi nhận lỗi chuyển hồ sơ."
      );

      if (!selectedPatient) {
        return;
      }

      config.setTransitioningRecordTransferId(recordTransfer.id);

      try {
        const updatedTransfer = await failRecordTransfer(
          config.clinicalApi,
          recordTransfer.id,
          recordTransferCommands.fail()
        );
        await refreshSelectedTransfer(selectedPatient, updatedTransfer.id);
        config.setStatusMessage(
          `Đã ghi nhận lỗi gửi gói chuyển hồ sơ ${updatedTransfer.id}.`
        );
      } catch (error) {
        config.setStatusMessage(
          error instanceof Error
            ? `Không thể ghi nhận lỗi chuyển hồ sơ: ${error.message}`
            : "Không thể ghi nhận lỗi chuyển hồ sơ."
        );
      } finally {
        config.setTransitioningRecordTransferId(undefined);
      }
    },
    handleGatewayAcknowledgementSubmit: async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const acknowledgementDraft = recordTransferCommands.gatewayAcknowledgementDraft(
        config.gatewayAcknowledgementForm
      );

      if (!acknowledgementDraft.ok) {
        config.setStatusMessage(acknowledgementDraft.message);
        return;
      }

      const { acknowledgementReference, payload, recordTransferId } =
        acknowledgementDraft.command;

      config.setIsSubmittingGatewayAcknowledgement(true);
      config.setGatewayAcknowledgementResult(undefined);

      try {
        const acknowledgedTransfer = await acknowledgeRecordTransfer(
          config.clinicalApi,
          recordTransferId,
          payload
        );
        config.setGatewayAcknowledgementResult(acknowledgedTransfer);
        config.setStatusMessage(
          `Gateway đã xác nhận tiếp nhận gói ${acknowledgedTransfer.id} bằng biên nhận ${acknowledgedTransfer.acknowledgementReference ?? acknowledgementReference}.`
        );
      } catch (error) {
        config.setStatusMessage(
          error instanceof Error
            ? `Không thể gửi callback tiếp nhận: ${error.message}`
            : "Không thể gửi callback tiếp nhận."
        );
      } finally {
        config.setIsSubmittingGatewayAcknowledgement(false);
      }
    },
    handleReceiveRecordTransfer: async (recordTransfer: RecordTransfer) => {
      const selectedPatient = ensureSelectedWritablePatient(
        "Cần chọn bệnh nhân trước khi xác nhận tiếp nhận hồ sơ."
      );

      if (!selectedPatient) {
        return;
      }

      config.setTransitioningRecordTransferId(recordTransfer.id);

      try {
        const updatedTransfer = await receiveRecordTransfer(
          config.clinicalApi,
          recordTransfer.id,
          recordTransferCommands.receive()
        );
        await refreshSelectedTransfer(selectedPatient, updatedTransfer.id);
        config.setStatusMessage(
          `Đã xác nhận bệnh viện nhận tiếp nhận gói ${updatedTransfer.id}.`
        );
      } catch (error) {
        config.setStatusMessage(
          error instanceof Error
            ? `Không thể xác nhận tiếp nhận hồ sơ: ${error.message}`
            : "Không thể xác nhận tiếp nhận hồ sơ."
        );
      } finally {
        config.setTransitioningRecordTransferId(undefined);
      }
    },
    handleRetryRecordTransfer: async (recordTransfer: RecordTransfer) => {
      const selectedPatient = ensureSelectedWritablePatient(
        "Cần chọn bệnh nhân trước khi thử gửi lại hồ sơ."
      );

      if (!selectedPatient) {
        return;
      }

      config.setTransitioningRecordTransferId(recordTransfer.id);

      try {
        const updatedTransfer = await retryRecordTransfer(
          config.clinicalApi,
          recordTransfer.id,
          recordTransferCommands.retry()
        );
        await refreshSelectedTransfer(selectedPatient, updatedTransfer.id);
        config.setStatusMessage(
          `Đã đưa gói chuyển hồ sơ ${updatedTransfer.id} về hàng đợi gửi lại.`
        );
      } catch (error) {
        config.setStatusMessage(
          error instanceof Error
            ? `Không thể thử gửi lại hồ sơ: ${error.message}`
            : "Không thể thử gửi lại hồ sơ."
        );
      } finally {
        config.setTransitioningRecordTransferId(undefined);
      }
    },
    handleSendRecordTransfer: async (recordTransfer: RecordTransfer) => {
      const selectedPatient = ensureSelectedWritablePatient(
        "Cần chọn bệnh nhân trước khi gửi gói chuyển hồ sơ."
      );

      if (!selectedPatient) {
        return;
      }

      config.setTransitioningRecordTransferId(recordTransfer.id);

      try {
        const updatedTransfer = await sendRecordTransfer(
          config.clinicalApi,
          recordTransfer.id,
          recordTransferCommands.send()
        );
        await refreshSelectedTransfer(selectedPatient, updatedTransfer.id);
        config.setStatusMessage(`Đã gửi gói chuyển hồ sơ ${updatedTransfer.id}.`);
      } catch (error) {
        config.setStatusMessage(
          error instanceof Error
            ? `Không thể gửi gói chuyển hồ sơ: ${error.message}`
            : "Không thể gửi gói chuyển hồ sơ."
        );
      } finally {
        config.setTransitioningRecordTransferId(undefined);
      }
    }
  };
}

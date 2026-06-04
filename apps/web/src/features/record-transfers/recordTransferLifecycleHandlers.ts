import type { ClinicalApiClient } from "../../api/clinicalApi.js";
import type { RecordTransfer } from "../../types/recordTransfers.js";
import {
  failRecordTransfer,
  receiveRecordTransfer,
  retryRecordTransfer,
  sendRecordTransfer
} from "./recordTransferApi.js";
import { recordTransferCommands } from "./recordTransferCommandBuilders.js";
import type {
  EnsureSelectedWritablePatient,
  RecordTransferHandlerConfig,
  RefreshSelectedTransfer
} from "./recordTransferHandlerTypes.js";

type RecordTransferTransition = (
  api: ClinicalApiClient,
  recordTransferId: string
) => Promise<RecordTransfer>;

type RecordTransferTransitionOptions = {
  readonly emptyPatientMessage: string;
  readonly errorMessage: string;
  readonly fallbackErrorMessage: string;
  readonly runTransition: RecordTransferTransition;
  readonly successMessage: (updatedTransfer: RecordTransfer) => string;
};

function buildRecordTransferTransitionHandler(
  config: RecordTransferHandlerConfig,
  ensureSelectedWritablePatient: EnsureSelectedWritablePatient,
  refreshSelectedTransfer: RefreshSelectedTransfer,
  {
    emptyPatientMessage,
    errorMessage,
    fallbackErrorMessage,
    runTransition,
    successMessage
  }: RecordTransferTransitionOptions
) {
  return async (recordTransfer: RecordTransfer) => {
    const selectedPatient = ensureSelectedWritablePatient(emptyPatientMessage);

    if (!selectedPatient) {
      return;
    }

    config.setTransitioningRecordTransferId(recordTransfer.id);

    try {
      const updatedTransfer = await runTransition(
        config.clinicalApi,
        recordTransfer.id
      );
      await refreshSelectedTransfer(selectedPatient, updatedTransfer.id);
      config.setStatusMessage(successMessage(updatedTransfer));
    } catch (error) {
      config.setStatusMessage(
        error instanceof Error
          ? `${errorMessage}: ${error.message}`
          : fallbackErrorMessage
      );
    } finally {
      config.setTransitioningRecordTransferId(undefined);
    }
  };
}

export function buildRecordTransferLifecycleHandlers(
  config: RecordTransferHandlerConfig,
  ensureSelectedWritablePatient: EnsureSelectedWritablePatient,
  refreshSelectedTransfer: RefreshSelectedTransfer
) {
  return {
    handleFailRecordTransfer: buildRecordTransferTransitionHandler(
      config,
      ensureSelectedWritablePatient,
      refreshSelectedTransfer,
      {
        emptyPatientMessage:
          "Cần chọn bệnh nhân trước khi ghi nhận lỗi chuyển hồ sơ.",
        errorMessage: "Không thể ghi nhận lỗi chuyển hồ sơ",
        fallbackErrorMessage: "Không thể ghi nhận lỗi chuyển hồ sơ.",
        runTransition: (api, recordTransferId) =>
          failRecordTransfer(api, recordTransferId, recordTransferCommands.fail()),
        successMessage: (updatedTransfer) =>
          `Đã ghi nhận lỗi gửi gói chuyển hồ sơ ${updatedTransfer.id}.`
      }
    ),
    handleReceiveRecordTransfer: buildRecordTransferTransitionHandler(
      config,
      ensureSelectedWritablePatient,
      refreshSelectedTransfer,
      {
        emptyPatientMessage:
          "Cần chọn bệnh nhân trước khi xác nhận tiếp nhận hồ sơ.",
        errorMessage: "Không thể xác nhận tiếp nhận hồ sơ",
        fallbackErrorMessage: "Không thể xác nhận tiếp nhận hồ sơ.",
        runTransition: (api, recordTransferId) =>
          receiveRecordTransfer(
            api,
            recordTransferId,
            recordTransferCommands.receive()
          ),
        successMessage: (updatedTransfer) =>
          `Đã xác nhận bệnh viện nhận tiếp nhận gói ${updatedTransfer.id}.`
      }
    ),
    handleRetryRecordTransfer: buildRecordTransferTransitionHandler(
      config,
      ensureSelectedWritablePatient,
      refreshSelectedTransfer,
      {
        emptyPatientMessage: "Cần chọn bệnh nhân trước khi thử gửi lại hồ sơ.",
        errorMessage: "Không thể thử gửi lại hồ sơ",
        fallbackErrorMessage: "Không thể thử gửi lại hồ sơ.",
        runTransition: (api, recordTransferId) =>
          retryRecordTransfer(api, recordTransferId, recordTransferCommands.retry()),
        successMessage: (updatedTransfer) =>
          `Đã đưa gói chuyển hồ sơ ${updatedTransfer.id} về hàng đợi gửi lại.`
      }
    ),
    handleSendRecordTransfer: buildRecordTransferTransitionHandler(
      config,
      ensureSelectedWritablePatient,
      refreshSelectedTransfer,
      {
        emptyPatientMessage:
          "Cần chọn bệnh nhân trước khi gửi gói chuyển hồ sơ.",
        errorMessage: "Không thể gửi gói chuyển hồ sơ",
        fallbackErrorMessage: "Không thể gửi gói chuyển hồ sơ.",
        runTransition: (api, recordTransferId) =>
          sendRecordTransfer(api, recordTransferId, recordTransferCommands.send()),
        successMessage: (updatedTransfer) =>
          `Đã gửi gói chuyển hồ sơ ${updatedTransfer.id}.`
      }
    )
  };
}

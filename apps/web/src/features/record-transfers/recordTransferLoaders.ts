import {
  isApiHttpError,
  type ClinicalApiClient
} from "../../api/clinicalApi.js";
import {
  isMissingRecordTransferDeliveryAttemptsRoute,
  resolveSelectedRecordTransferId
} from "./recordTransferFormatters.js";
import type {
  RecordTransfer,
  RecordTransferDeliveryAttempt
} from "../../types/clinical.js";
import {
  exportRecordTransferFhirTask,
  listRecordTransferDeliveryAttempts,
  listRecordTransfers
} from "./recordTransferApi.js";

type RecordTransferLoaderConfig = {
  readonly clinicalApi: ClinicalApiClient;
  readonly getCurrentRecordTransferId: () => string | undefined;
  readonly setIsLoadingRecordTransfers: (isLoading: boolean) => void;
  readonly setIsLoadingRecordTransferDeliveryAttempts: (isLoading: boolean) => void;
  readonly setRecordTransferDeliveryAttempts: (
    attempts: readonly RecordTransferDeliveryAttempt[]
  ) => void;
  readonly setRecordTransferDeliveryAttemptWarning: (message: string | undefined) => void;
  readonly setRecordTransferFhirTaskPreview: (preview: unknown) => void;
  readonly setRecordTransfers: (recordTransfers: readonly RecordTransfer[]) => void;
  readonly setSelectedRecordTransferId: (recordTransferId: string | undefined) => void;
  readonly setStatusMessage: (message: string) => void;
};

export function buildRecordTransferLoaders(config: RecordTransferLoaderConfig) {
  const isCurrentRecordTransferSelection = (recordTransferId: string): boolean =>
    config.getCurrentRecordTransferId() === recordTransferId;

  const loadRecordTransfers = async (
    patientId: string,
    nextSelectedRecordTransferId?: string
  ) => {
    config.setIsLoadingRecordTransfers(true);

    try {
      const data = await listRecordTransfers(config.clinicalApi, patientId);
      config.setRecordTransfers(data.items);
      config.setSelectedRecordTransferId(
        resolveSelectedRecordTransferId({
          items: data.items,
          preferredId: nextSelectedRecordTransferId,
          currentId: config.getCurrentRecordTransferId()
        })
      );
    } catch (error) {
      config.setRecordTransfers([]);
      config.setSelectedRecordTransferId(undefined);
      config.setRecordTransferDeliveryAttempts([]);
      config.setRecordTransferDeliveryAttemptWarning(undefined);
      config.setStatusMessage(
        error instanceof Error
          ? `Không thể tải gói chuyển hồ sơ: ${error.message}`
          : "Không thể tải gói chuyển hồ sơ."
      );
    } finally {
      config.setIsLoadingRecordTransfers(false);
    }
  };

  const loadRecordTransferFhirTaskPreview = async (recordTransferId: string) => {
    try {
      const preview = await exportRecordTransferFhirTask(
        config.clinicalApi,
        recordTransferId
      );

      if (!isCurrentRecordTransferSelection(recordTransferId)) {
        return;
      }

      config.setRecordTransferFhirTaskPreview(preview);
    } catch (error) {
      if (!isCurrentRecordTransferSelection(recordTransferId)) {
        return;
      }

      config.setRecordTransferFhirTaskPreview({
        error:
          error instanceof Error
            ? `Không thể xuất FHIR Task chuyển hồ sơ: ${error.message}`
            : "Không thể xuất FHIR Task chuyển hồ sơ."
      });
    }
  };

  const loadRecordTransferDeliveryAttempts = async (recordTransferId: string) => {
    if (!isCurrentRecordTransferSelection(recordTransferId)) {
      return;
    }

    config.setIsLoadingRecordTransferDeliveryAttempts(true);
    config.setRecordTransferDeliveryAttemptWarning(undefined);

    try {
      const data = await listRecordTransferDeliveryAttempts(
        config.clinicalApi,
        recordTransferId
      );

      if (!isCurrentRecordTransferSelection(recordTransferId)) {
        return;
      }

      config.setRecordTransferDeliveryAttempts(data.items);
      config.setRecordTransferDeliveryAttemptWarning(undefined);
    } catch (error) {
      if (!isCurrentRecordTransferSelection(recordTransferId)) {
        return;
      }

      if (
        isApiHttpError(error) &&
        error.status === 404 &&
        isMissingRecordTransferDeliveryAttemptsRoute(error.payload)
      ) {
        config.setRecordTransferDeliveryAttempts([]);
        config.setRecordTransferDeliveryAttemptWarning(
          "API lịch sử gửi chưa sẵn sàng trong runtime hiện tại. Gói chuyển vẫn hiển thị được, nhưng cần khởi động lại backend mới nhất để xem delivery attempt/outbox."
        );
        return;
      }

      config.setRecordTransferDeliveryAttempts([]);
      config.setStatusMessage(
        error instanceof Error
          ? `Không thể tải lịch sử gửi hồ sơ: ${error.message}`
          : "Không thể tải lịch sử gửi hồ sơ."
      );
    } finally {
      if (isCurrentRecordTransferSelection(recordTransferId)) {
        config.setIsLoadingRecordTransferDeliveryAttempts(false);
      }
    }
  };

  return {
    loadRecordTransferDeliveryAttempts,
    loadRecordTransferFhirTaskPreview,
    loadRecordTransfers
  };
}

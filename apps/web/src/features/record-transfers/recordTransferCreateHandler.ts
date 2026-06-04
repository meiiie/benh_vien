import type { FormEvent } from "react";
import { createRecordTransfer } from "./recordTransferApi.js";
import { recordTransferCommands } from "./recordTransferCommandBuilders.js";
import type {
  EnsureSelectedWritablePatient,
  RecordTransferHandlerConfig
} from "./recordTransferHandlerTypes.js";

export function buildCreateRecordTransferHandler(
  config: RecordTransferHandlerConfig,
  ensureSelectedWritablePatient: EnsureSelectedWritablePatient
) {
  return async (event: FormEvent<HTMLFormElement>) => {
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
  };
}

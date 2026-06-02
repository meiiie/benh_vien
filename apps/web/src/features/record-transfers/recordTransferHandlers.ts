import type { Patient } from "../../types/patientRegistry.js";
import { buildCreateRecordTransferHandler } from "./recordTransferCreateHandler.js";
import { buildGatewayAcknowledgementHandler } from "./recordTransferGatewayHandler.js";
import {
  buildRecordTransferLifecycleHandlers
} from "./recordTransferLifecycleHandlers.js";
import type { RecordTransferHandlerConfig } from "./recordTransferHandlerTypes.js";

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
    handleCreateRecordTransfer: buildCreateRecordTransferHandler(
      config,
      ensureSelectedWritablePatient
    ),
    handleGatewayAcknowledgementSubmit:
      buildGatewayAcknowledgementHandler(config),
    ...buildRecordTransferLifecycleHandlers(
      config,
      ensureSelectedWritablePatient,
      refreshSelectedTransfer
    )
  };
}

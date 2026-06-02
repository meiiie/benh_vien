import type { FormEvent } from "react";
import { acknowledgeRecordTransfer } from "./recordTransferApi.js";
import { recordTransferCommands } from "./recordTransferCommandBuilders.js";
import type { RecordTransferHandlerConfig } from "./recordTransferHandlerTypes.js";

export function buildGatewayAcknowledgementHandler(
  config: RecordTransferHandlerConfig
) {
  return async (event: FormEvent<HTMLFormElement>) => {
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
  };
}

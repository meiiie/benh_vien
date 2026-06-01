import { validateRecordTransferEndpointForDelivery } from "../record-transfers/record-transfer-endpoint-policy.js";
import {
  formatErrorMessage,
  readResponseBodyPreview
} from "./record-transfer-delivery-format.js";
import type { RecordTransferFhirBundleSender } from "./record-transfer-delivery-worker.types.js";

export const defaultRecordTransferFhirBundleSender: RecordTransferFhirBundleSender = {
  async send(input) {
    const attemptSnapshot = input.attempt.toSnapshot();
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
    }, input.timeoutMs);

    try {
      const endpointPolicy = validateRecordTransferEndpointForDelivery({
        endpointAddress: attemptSnapshot.targetEndpointAddress
      });

      if (!endpointPolicy.allowed) {
        return {
          errorMessage: endpointPolicy.message
        };
      }

      const response = await fetch(attemptSnapshot.targetEndpointAddress, {
        method: "POST",
        headers: {
          Accept: "application/fhir+json, application/json",
          "Content-Type": "application/fhir+json",
          "Idempotency-Key": attemptSnapshot.idempotencyKey,
          "X-WiiiCare-Record-Transfer-Id": attemptSnapshot.recordTransferId,
          "X-WiiiCare-Delivery-Attempt-Id": attemptSnapshot.id
        },
        body: JSON.stringify(input.bundle),
        signal: controller.signal
      });

      return {
        httpStatus: response.status,
        responseBodyPreview: await readResponseBodyPreview(response)
      };
    } catch (error) {
      return {
        errorMessage: formatErrorMessage(error)
      };
    } finally {
      clearTimeout(timer);
    }
  }
};

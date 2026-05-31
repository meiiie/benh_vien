import { useRef, useState } from "react";
import {
  defaultGatewayAcknowledgementForm,
  defaultRecordTransferForm
} from "../../config/demoClinicalDefaults.js";
import type {
  Consent,
  GatewayAcknowledgementForm,
  NewRecordTransferForm,
  RecordTransfer,
  RecordTransferDeliveryAttempt
} from "../../types/clinical.js";

export function useInteroperabilityState() {
  const [consents, setConsents] = useState<readonly Consent[]>([]);
  const [recordTransfers, setRecordTransfers] =
    useState<readonly RecordTransfer[]>([]);
  const [selectedRecordTransferId, setSelectedRecordTransferId] =
    useState<string>();
  const selectedRecordTransferIdRef = useRef<string | undefined>(undefined);
  const [recordTransferDeliveryAttempts, setRecordTransferDeliveryAttempts] =
    useState<readonly RecordTransferDeliveryAttempt[]>([]);
  const [
    recordTransferDeliveryAttemptWarning,
    setRecordTransferDeliveryAttemptWarning
  ] = useState<string>();
  const [recordTransferForm, setRecordTransferForm] =
    useState<NewRecordTransferForm>(defaultRecordTransferForm);
  const [gatewayAcknowledgementForm, setGatewayAcknowledgementForm] =
    useState<GatewayAcknowledgementForm>(defaultGatewayAcknowledgementForm);
  const [gatewayAcknowledgementResult, setGatewayAcknowledgementResult] =
    useState<RecordTransfer>();
  const [isLoadingConsents, setIsLoadingConsents] = useState(false);
  const [isLoadingRecordTransfers, setIsLoadingRecordTransfers] =
    useState(false);
  const [
    isLoadingRecordTransferDeliveryAttempts,
    setIsLoadingRecordTransferDeliveryAttempts
  ] = useState(false);
  const [isSubmittingRecordTransfer, setIsSubmittingRecordTransfer] =
    useState(false);
  const [
    isSubmittingGatewayAcknowledgement,
    setIsSubmittingGatewayAcknowledgement
  ] = useState(false);
  const [transitioningRecordTransferId, setTransitioningRecordTransferId] =
    useState<string>();
  const [revokingConsentId, setRevokingConsentId] = useState<string>();

  selectedRecordTransferIdRef.current = selectedRecordTransferId;

  return {
    consents,
    gatewayAcknowledgementForm,
    gatewayAcknowledgementResult,
    getCurrentRecordTransferId: () => selectedRecordTransferIdRef.current,
    isLoadingConsents,
    isLoadingRecordTransferDeliveryAttempts,
    isLoadingRecordTransfers,
    isSubmittingGatewayAcknowledgement,
    isSubmittingRecordTransfer,
    recordTransferDeliveryAttempts,
    recordTransferDeliveryAttemptWarning,
    recordTransferForm,
    recordTransfers,
    revokingConsentId,
    selectedRecordTransferId,
    setConsents,
    setGatewayAcknowledgementForm,
    setGatewayAcknowledgementResult,
    setIsLoadingConsents,
    setIsLoadingRecordTransferDeliveryAttempts,
    setIsLoadingRecordTransfers,
    setIsSubmittingGatewayAcknowledgement,
    setIsSubmittingRecordTransfer,
    setRecordTransferDeliveryAttempts,
    setRecordTransferDeliveryAttemptWarning,
    setRecordTransferForm,
    setRecordTransfers,
    setRevokingConsentId,
    setSelectedRecordTransferId,
    setTransitioningRecordTransferId,
    transitioningRecordTransferId
  };
}

import type { FormEvent, ReactNode } from "react";
import type {
  Consent,
  NewRecordTransferForm,
  ProviderDirectory,
  RecordTransfer,
  RecordTransferDeliveryAttempt
} from "../../types/clinical.js";
import { ConsentInteropPanel } from "../consents/ConsentInteropPanel.js";
import { ProviderDirectoryPanel } from "../provider-directory/ProviderDirectoryPanel.js";
import { RecordTransferInteropPanel } from "../record-transfers/RecordTransferInteropPanel.js";

type RecordTransferSubmitHandler = (event: FormEvent<HTMLFormElement>) => Promise<void> | void;
type RecordTransferActionHandler = (recordTransfer: RecordTransfer) => Promise<void> | void;

type BuildInteropPanelRenderersOptions = {
  readonly consentReference: string;
  readonly consents: readonly Consent[];
  readonly deliveryAttemptWarning?: string;
  readonly deliveryAttempts: readonly RecordTransferDeliveryAttempt[];
  readonly form: NewRecordTransferForm;
  readonly isLoadingConsents: boolean;
  readonly isLoadingDeliveryAttempts: boolean;
  readonly isLoadingProviderDirectory: boolean;
  readonly isLoadingRecordTransfers: boolean;
  readonly isPatientMerged: boolean;
  readonly isSubmittingRecordTransfer: boolean;
  readonly isWriteDisabled: boolean;
  readonly providerDirectory?: ProviderDirectory;
  readonly recipientOrganizationId: string;
  readonly recordTransfers: readonly RecordTransfer[];
  readonly revokingConsentId?: string;
  readonly selectedRecordTransfer?: RecordTransfer;
  readonly selectedRecordTransferId?: string;
  readonly transitioningRecordTransferId?: string;
  readonly onCreateRecordTransfer: RecordTransferSubmitHandler;
  readonly onFailRecordTransfer: RecordTransferActionHandler;
  readonly onLoadConsentFhirPreview: (consentId: string) => Promise<void> | void;
  readonly onProviderDirectoryRefresh: () => Promise<void> | void;
  readonly onReceiveRecordTransfer: RecordTransferActionHandler;
  readonly onRecordTransferFormChange: (form: NewRecordTransferForm) => void;
  readonly onRetryRecordTransfer: RecordTransferActionHandler;
  readonly onRevokeConsent: (consent: Consent) => Promise<void> | void;
  readonly onSelectRecordTransfer: (recordTransferId: string) => void;
  readonly onSendRecordTransfer: RecordTransferActionHandler;
};

export type InteropPanelRenderers = {
  readonly consentInterop: () => ReactNode;
  readonly providerDirectory: () => ReactNode;
  readonly recordTransferInterop: () => ReactNode;
};

export function buildInteropPanelRenderers({
  consentReference,
  consents,
  deliveryAttemptWarning,
  deliveryAttempts,
  form,
  isLoadingConsents,
  isLoadingDeliveryAttempts,
  isLoadingProviderDirectory,
  isLoadingRecordTransfers,
  isPatientMerged,
  isSubmittingRecordTransfer,
  isWriteDisabled,
  providerDirectory,
  recipientOrganizationId,
  recordTransfers,
  revokingConsentId,
  selectedRecordTransfer,
  selectedRecordTransferId,
  transitioningRecordTransferId,
  onCreateRecordTransfer,
  onFailRecordTransfer,
  onLoadConsentFhirPreview,
  onProviderDirectoryRefresh,
  onReceiveRecordTransfer,
  onRecordTransferFormChange,
  onRetryRecordTransfer,
  onRevokeConsent,
  onSelectRecordTransfer,
  onSendRecordTransfer
}: BuildInteropPanelRenderersOptions): InteropPanelRenderers {
  return {
    consentInterop: () => (
      <ConsentInteropPanel
        consents={consents}
        consentReference={consentReference}
        isLoading={isLoadingConsents}
        isWriteDisabled={isWriteDisabled}
        recipientOrganizationId={recipientOrganizationId}
        revokingConsentId={revokingConsentId}
        onLoadFhirPreview={onLoadConsentFhirPreview}
        onRevokeConsent={onRevokeConsent}
      />
    ),
    providerDirectory: () => (
      <ProviderDirectoryPanel
        directory={providerDirectory}
        isLoading={isLoadingProviderDirectory}
        onRefresh={onProviderDirectoryRefresh}
      />
    ),
    recordTransferInterop: () => (
      <RecordTransferInteropPanel
        deliveryAttemptWarning={deliveryAttemptWarning}
        deliveryAttempts={deliveryAttempts}
        form={form}
        isLoadingDeliveryAttempts={isLoadingDeliveryAttempts}
        isLoadingRecordTransfers={isLoadingRecordTransfers}
        isPatientMerged={isPatientMerged}
        isSubmitting={isSubmittingRecordTransfer}
        isWriteDisabled={isWriteDisabled}
        recordTransfers={recordTransfers}
        selectedRecordTransfer={selectedRecordTransfer}
        selectedRecordTransferId={selectedRecordTransferId}
        transitioningRecordTransferId={transitioningRecordTransferId}
        onCreateRecordTransfer={onCreateRecordTransfer}
        onFailRecordTransfer={onFailRecordTransfer}
        onFormChange={onRecordTransferFormChange}
        onReceiveRecordTransfer={onReceiveRecordTransfer}
        onRetryRecordTransfer={onRetryRecordTransfer}
        onSelectRecordTransfer={onSelectRecordTransfer}
        onSendRecordTransfer={onSendRecordTransfer}
      />
    )
  };
}

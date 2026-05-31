import { defaultTransferContext } from "../config/demoClinicalDefaults.js";
import { buildInteropPanelRenderers } from "../features/interoperability/interopPanelRenderers.js";
import type { useInteroperabilityState } from "../features/interoperability/interoperabilityState.js";
import type { usePlatformState } from "../features/platform/platformState.js";
import type { buildAppWorkspaceContext } from "./appDerivedContext.js";

type InteroperabilityState = ReturnType<typeof useInteroperabilityState>;
type PlatformState = ReturnType<typeof usePlatformState>;
type AppWorkspaceContext = ReturnType<typeof buildAppWorkspaceContext>;
type InteropPanelOptions = Parameters<typeof buildInteropPanelRenderers>[0];

type BuildInteropPanelsInput = {
  readonly interoperabilityState: InteroperabilityState;
  readonly isSelectedPatientMerged: boolean;
  readonly onCreateRecordTransfer: InteropPanelOptions["onCreateRecordTransfer"];
  readonly onFailRecordTransfer: InteropPanelOptions["onFailRecordTransfer"];
  readonly onLoadConsentFhirPreview: InteropPanelOptions["onLoadConsentFhirPreview"];
  readonly onProviderDirectoryRefresh: InteropPanelOptions["onProviderDirectoryRefresh"];
  readonly onReceiveRecordTransfer: InteropPanelOptions["onReceiveRecordTransfer"];
  readonly onRetryRecordTransfer: InteropPanelOptions["onRetryRecordTransfer"];
  readonly onRevokeConsent: InteropPanelOptions["onRevokeConsent"];
  readonly onSendRecordTransfer: InteropPanelOptions["onSendRecordTransfer"];
  readonly platformState: PlatformState;
  readonly selectedPatientWriteDisabled: boolean;
  readonly workspaceSelection: AppWorkspaceContext["workspaceSelection"];
};

export function buildInteropPanels({
  interoperabilityState,
  isSelectedPatientMerged,
  onCreateRecordTransfer,
  onFailRecordTransfer,
  onLoadConsentFhirPreview,
  onProviderDirectoryRefresh,
  onReceiveRecordTransfer,
  onRetryRecordTransfer,
  onRevokeConsent,
  onSendRecordTransfer,
  platformState,
  selectedPatientWriteDisabled,
  workspaceSelection
}: BuildInteropPanelsInput) {
  return buildInteropPanelRenderers({
    consentReference: defaultTransferContext.consentReference,
    consents: interoperabilityState.consents,
    deliveryAttemptWarning:
      interoperabilityState.recordTransferDeliveryAttemptWarning,
    deliveryAttempts: interoperabilityState.recordTransferDeliveryAttempts,
    form: interoperabilityState.recordTransferForm,
    isLoadingConsents: interoperabilityState.isLoadingConsents,
    isLoadingDeliveryAttempts:
      interoperabilityState.isLoadingRecordTransferDeliveryAttempts,
    isLoadingProviderDirectory: platformState.isLoadingProviderDirectory,
    isLoadingRecordTransfers: interoperabilityState.isLoadingRecordTransfers,
    isPatientMerged: isSelectedPatientMerged,
    isSubmittingRecordTransfer: interoperabilityState.isSubmittingRecordTransfer,
    isWriteDisabled: selectedPatientWriteDisabled,
    providerDirectory: platformState.providerDirectory,
    recipientOrganizationId: defaultTransferContext.recipientOrganizationId,
    recordTransfers: interoperabilityState.recordTransfers,
    revokingConsentId: interoperabilityState.revokingConsentId,
    selectedRecordTransfer: workspaceSelection.selectedRecordTransfer,
    selectedRecordTransferId: interoperabilityState.selectedRecordTransferId,
    transitioningRecordTransferId:
      interoperabilityState.transitioningRecordTransferId,
    onCreateRecordTransfer,
    onFailRecordTransfer,
    onLoadConsentFhirPreview,
    onProviderDirectoryRefresh,
    onReceiveRecordTransfer,
    onRecordTransferFormChange: interoperabilityState.setRecordTransferForm,
    onRetryRecordTransfer,
    onRevokeConsent,
    onSelectRecordTransfer: interoperabilityState.setSelectedRecordTransferId,
    onSendRecordTransfer
  });
}

import type {
  ProviderDirectory,
  ProviderDirectoryRepository,
  ProviderEndpointSnapshot,
  RecordTransferDeliveryAttemptSnapshot,
  RecordTransferSnapshot
} from "@benh-vien-so/domain";
import { RecordTransfer, RecordTransferDeliveryAttempt } from "@benh-vien-so/domain";

export function buildBundleId(
  patientId: string,
  bundleType: "collection" | "document"
): string {
  return bundleType === "document"
    ? `patient-document-${patientId}`
    : `patient-record-${patientId}`;
}

export function toRecordTransferResponse(
  recordTransfer: RecordTransfer
): RecordTransferSnapshot {
  return recordTransfer.toSnapshot();
}

export function toDeliveryAttemptResponse(
  deliveryAttempt: RecordTransferDeliveryAttempt
): RecordTransferDeliveryAttemptSnapshot {
  return deliveryAttempt.toSnapshot();
}

export async function resolveRecordTransferFhirEndpoint(
  providerDirectoryRepository: ProviderDirectoryRepository,
  recipientOrganizationId: string
): Promise<ProviderEndpointSnapshot | undefined> {
  const providerDirectory = await providerDirectoryRepository.findDirectory();
  return findRecordTransferFhirEndpoint(providerDirectory, recipientOrganizationId);
}

export function findRecordTransferFhirEndpoint(
  providerDirectory: ProviderDirectory,
  recipientOrganizationId: string
): ProviderEndpointSnapshot | undefined {
  return providerDirectory
    .toSnapshot()
    .endpoints.find(
      (endpoint) =>
        endpoint.managingOrganizationId === recipientOrganizationId &&
        endpoint.status === "active" &&
        endpoint.connectionType === "hl7-fhir-rest" &&
        endpoint.payloadTypes.some(
          (payloadType) =>
            payloadType.system === "http://hl7.org/fhir/resource-types" &&
            payloadType.code === "Bundle"
        )
    );
}

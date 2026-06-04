import type {
  ProviderDirectory,
  ProviderDirectoryRepository,
  ProviderEndpointSnapshot
} from "@benh-vien-so/domain";

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

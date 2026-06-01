import { createHash } from "node:crypto";
import type {
  ActorContext,
  ProviderDirectory,
  ProviderDirectoryRepository,
  ProviderEndpointSnapshot,
  RecordTransferDeliveryAttemptSnapshot,
  RecordTransferSnapshot
} from "@benh-vien-so/domain";
import { RecordTransfer, RecordTransferDeliveryAttempt } from "@benh-vien-so/domain";
import type { verifyRecordTransferCallbackSignature } from "./record-transfer-callback-signature.js";

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

export function canAcknowledgeForRecipient(
  actor: ActorContext,
  providerDirectory: ProviderDirectory,
  recipientOrganizationId: string
): boolean {
  if (actor.role === "admin") {
    return true;
  }

  if (actor.role !== "integration") {
    return false;
  }

  const snapshot = providerDirectory.toSnapshot();
  return snapshot.practitionerRoles.some(
    (role) =>
      role.active &&
      role.practitionerId === actor.actorId &&
      organizationIsSameOrChild(
        role.organizationId,
        recipientOrganizationId,
        snapshot.organizations
      )
  );
}

export function buildAcknowledgementReference(input: {
  readonly recordTransferId: string;
  readonly receivedByActorId: string;
  readonly receivedAt: string;
}): string {
  const hash = createHash("sha256")
    .update([input.recordTransferId, input.receivedByActorId, input.receivedAt].join("|"))
    .digest("hex")
    .slice(0, 32);

  return `wiiicare-record-transfer-ack-${hash}`;
}

export function toCallbackSignatureAuditMetadata(input: ReturnType<
  typeof verifyRecordTransferCallbackSignature
>): {
  readonly callbackSignatureRequired: boolean;
  readonly callbackSignatureVerified: boolean;
  readonly callbackSignatureTimestamp?: string;
  readonly callbackSignatureAlgorithm?: string;
  readonly callbackSignatureKeyId?: string;
} {
  return {
    callbackSignatureRequired: input.required,
    callbackSignatureVerified: input.verified,
    callbackSignatureTimestamp: input.timestamp,
    callbackSignatureAlgorithm: input.algorithm,
    callbackSignatureKeyId: input.keyId
  };
}

function organizationIsSameOrChild(
  organizationId: string,
  expectedOrganizationId: string,
  organizations: ReturnType<ProviderDirectory["toSnapshot"]>["organizations"]
): boolean {
  let currentOrganizationId: string | undefined = organizationId;

  while (currentOrganizationId) {
    if (currentOrganizationId === expectedOrganizationId) {
      return true;
    }

    currentOrganizationId = organizations.find(
      (organization) => organization.id === currentOrganizationId
    )?.partOfOrganizationId;
  }

  return false;
}

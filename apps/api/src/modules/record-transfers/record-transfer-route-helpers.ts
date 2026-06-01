import { createHash } from "node:crypto";
import type {
  ActorContext,
  ProviderDirectory,
  ProviderDirectoryRepository,
  ProviderEndpointSnapshot,
  RecordTransferDeliveryAttemptRepository,
  RecordTransferDeliveryAttemptSnapshot,
  RecordTransferRepository,
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

export function buildDeliveryIdempotencyKey(input: {
  readonly recordTransferId: string;
  readonly attemptNumber: number;
  readonly bundleId: string;
  readonly targetEndpointId: string;
  readonly queuedAt: string;
}): string {
  const hash = createHash("sha256")
    .update(
      [
        input.recordTransferId,
        String(input.attemptNumber),
        input.bundleId,
        input.targetEndpointId,
        input.queuedAt
      ].join("|")
    )
    .digest("hex");

  return `wiiicare-record-transfer-${hash}`;
}

type TransactionalRecordTransferRepository = RecordTransferRepository & {
  saveWithDeliveryAttempt(
    recordTransfer: RecordTransfer,
    deliveryAttempt: RecordTransferDeliveryAttempt
  ): Promise<void>;
};

export async function saveRecordTransferWithDeliveryAttempt(
  recordTransferRepository: RecordTransferRepository,
  deliveryAttemptRepository: RecordTransferDeliveryAttemptRepository,
  recordTransfer: RecordTransfer,
  deliveryAttempt: RecordTransferDeliveryAttempt
): Promise<void> {
  if (isTransactionalRecordTransferRepository(recordTransferRepository)) {
    await recordTransferRepository.saveWithDeliveryAttempt(recordTransfer, deliveryAttempt);
    return;
  }

  const previousRecordTransfer = await recordTransferRepository.findById(recordTransfer.id);
  await recordTransferRepository.save(recordTransfer);

  try {
    await deliveryAttemptRepository.save(deliveryAttempt);
  } catch (error) {
    if (previousRecordTransfer) {
      await recordTransferRepository.save(previousRecordTransfer);
    }

    throw error;
  }
}

export async function queueRecordTransferDeliveryAttempt(input: {
  readonly recordTransferRepository: RecordTransferRepository;
  readonly deliveryAttemptRepository: RecordTransferDeliveryAttemptRepository;
  readonly recordTransfer: RecordTransfer;
  readonly targetEndpoint: ProviderEndpointSnapshot;
  readonly id: string;
}): Promise<RecordTransferDeliveryAttempt> {
  const snapshot = input.recordTransfer.toSnapshot();
  const existingAttempts =
    await input.deliveryAttemptRepository.findByRecordTransferId(
      input.recordTransfer.id
    );
  const attemptNumber = existingAttempts.length + 1;
  const queuedAt = snapshot.sentAt ?? new Date().toISOString();
  const deliveryAttempt = RecordTransferDeliveryAttempt.queue({
    id: input.id,
    recordTransferId: snapshot.id,
    patientId: snapshot.patientId,
    targetEndpointId: input.targetEndpoint.id,
    targetEndpointAddress: input.targetEndpoint.address,
    bundleId: snapshot.bundleId,
    bundleType: snapshot.bundleType,
    idempotencyKey: buildDeliveryIdempotencyKey({
      recordTransferId: snapshot.id,
      attemptNumber,
      bundleId: snapshot.bundleId,
      targetEndpointId: input.targetEndpoint.id,
      queuedAt
    }),
    attemptNumber,
    queuedAt
  });

  await saveRecordTransferWithDeliveryAttempt(
    input.recordTransferRepository,
    input.deliveryAttemptRepository,
    input.recordTransfer,
    deliveryAttempt
  );

  return deliveryAttempt;
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

function isTransactionalRecordTransferRepository(
  repository: RecordTransferRepository
): repository is TransactionalRecordTransferRepository {
  return (
    typeof (repository as Partial<TransactionalRecordTransferRepository>)
      .saveWithDeliveryAttempt === "function"
  );
}

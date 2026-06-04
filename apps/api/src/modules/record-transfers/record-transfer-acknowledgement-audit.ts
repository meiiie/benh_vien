import type { FastifyRequest } from "fastify";
import type { RecordTransferAcknowledgementCallbackRequest } from "@benh-vien-so/contracts";
import type {
  ActorContext,
  AuditEventRepository,
  RecordTransfer,
  RecordTransferSnapshot
} from "@benh-vien-so/domain";
import { recordAuditEvent } from "../audit-events/audit-context.js";
import type { CallbackSignatureVerification } from "./record-transfer-callback-signature.js";
import {
  toAcknowledgementCallbackAuditMetadata,
  toCallbackSignatureAuditMetadata
} from "./record-transfer-acknowledgement-audit-metadata.js";

type DuplicateAcknowledgementAuditInput = {
  readonly auditRepository: AuditEventRepository;
  readonly request: FastifyRequest;
  readonly recordTransfer: RecordTransfer;
  readonly snapshot: RecordTransferSnapshot;
  readonly callback: RecordTransferAcknowledgementCallbackRequest;
  readonly signatureVerification: CallbackSignatureVerification;
};

type AcceptedAcknowledgementAuditInput = {
  readonly auditRepository: AuditEventRepository;
  readonly request: FastifyRequest;
  readonly recordTransfer: RecordTransfer;
  readonly actor: ActorContext;
  readonly callback: RecordTransferAcknowledgementCallbackRequest;
  readonly signatureVerification: CallbackSignatureVerification;
};

export async function recordDuplicateAcknowledgementCallbackAudit(
  input: DuplicateAcknowledgementAuditInput
): Promise<void> {
  await recordAuditEvent(input.auditRepository, input.request, {
    action: "record-transfer.acknowledgement-callback",
    resourceType: "RecordTransfer",
    resourceId: input.recordTransfer.id,
    patientId: input.recordTransfer.patientId,
    metadata: {
      duplicateCallback: true,
      ...toAcknowledgementCallbackAuditMetadata(input.snapshot, input.callback),
      ...toCallbackSignatureAuditMetadata(input.signatureVerification)
    }
  });
}

export async function recordAcceptedAcknowledgementCallbackAudit(
  input: AcceptedAcknowledgementAuditInput
): Promise<void> {
  const snapshot = input.recordTransfer.toSnapshot();

  await recordAuditEvent(input.auditRepository, input.request, {
    action: "record-transfer.acknowledgement-callback",
    resourceType: "RecordTransfer",
    resourceId: input.recordTransfer.id,
    patientId: input.recordTransfer.patientId,
    metadata: {
      duplicateCallback: false,
      sentAt: snapshot.sentAt,
      ...toAcknowledgementCallbackAuditMetadata(snapshot, input.callback),
      callbackActorId: input.actor.actorId,
      ...toCallbackSignatureAuditMetadata(input.signatureVerification)
    }
  });
}

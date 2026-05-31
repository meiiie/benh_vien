import type { FastifyReply, FastifyRequest } from "fastify";
import type {
  ActorContext,
  PatientRepository,
  ProviderDirectoryRepository,
  RecordTransfer,
  RecordTransferRepository
} from "@benh-vien-so/domain";
import { requirePatientRecordAccessByPatientId } from "../access-control/access-context.js";

type LoadRecordTransferForPatientAccessInput = {
  readonly request: FastifyRequest;
  readonly reply: FastifyReply;
  readonly actor: ActorContext;
  readonly recordTransferId: string;
  readonly recordTransferRepository: RecordTransferRepository;
  readonly patientRepository: PatientRepository;
  readonly providerDirectoryRepository: ProviderDirectoryRepository;
  readonly notFoundMessage?: string;
};

export async function loadRecordTransferForPatientAccess({
  request,
  reply,
  actor,
  recordTransferId,
  recordTransferRepository,
  patientRepository,
  providerDirectoryRepository,
  notFoundMessage
}: LoadRecordTransferForPatientAccessInput): Promise<RecordTransfer | undefined> {
  const recordTransfer = await recordTransferRepository.findById(recordTransferId);

  if (!recordTransfer) {
    reply.status(404).send({
      error: "RECORD_TRANSFER_NOT_FOUND",
      ...(notFoundMessage ? { message: notFoundMessage } : {})
    });
    return undefined;
  }

  const hasAccess = await requirePatientRecordAccessByPatientId(
    request,
    reply,
    actor,
    recordTransfer.patientId,
    patientRepository,
    providerDirectoryRepository
  );

  return hasAccess ? recordTransfer : undefined;
}

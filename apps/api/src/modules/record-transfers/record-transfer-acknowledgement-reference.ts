import { createHash } from "node:crypto";

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

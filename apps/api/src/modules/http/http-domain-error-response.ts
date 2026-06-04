import type { FastifyReply } from "fastify";
import { DomainError } from "@benh-vien-so/domain";

export function sendDomainErrorResponse(
  reply: FastifyReply,
  error: unknown,
  errorCode: string
): boolean {
  if (!(error instanceof DomainError)) {
    return false;
  }

  reply.status(422).send({
    error: errorCode,
    message: error.message
  });

  return true;
}

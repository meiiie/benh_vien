import type { FastifyReply } from "fastify";

export type HttpValidationErrorResponse = {
  readonly error: string;
  readonly message: string;
};

export function sendValidationErrorResponse(
  reply: FastifyReply,
  validationError: HttpValidationErrorResponse
): FastifyReply {
  return reply.status(422).send(validationError);
}

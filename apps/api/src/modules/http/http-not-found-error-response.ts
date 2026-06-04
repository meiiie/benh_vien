import type { FastifyReply } from "fastify";

export function sendNotFoundErrorResponse(
  reply: FastifyReply,
  errorCode: string,
  message?: string
): FastifyReply {
  return reply.status(404).send({
    error: errorCode,
    ...(message ? { message } : {})
  });
}

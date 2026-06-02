import type { FastifyReply } from "fastify";

export type HttpJsonErrorPayload = {
  readonly error: string;
  readonly message: string;
  readonly [key: string]: unknown;
};

export function sendJsonErrorResponse(
  reply: FastifyReply,
  statusCode: number,
  requestId: string,
  payload: HttpJsonErrorPayload
): FastifyReply {
  return reply.status(statusCode).send({
    ...payload,
    requestId
  });
}

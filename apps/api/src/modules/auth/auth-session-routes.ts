import type { FastifyInstance } from "fastify";
import { sendJsonErrorResponse } from "../http/http-json-error-response.js";
import { verifyAccessToken } from "./auth-session.js";
import { readBearerToken } from "./bearer-token.js";

export async function registerAuthSessionRoutes(app: FastifyInstance): Promise<void> {
  app.get("/auth/session", async (request, reply) => {
    const token = readBearerToken(request.headers.authorization);
    const session = token ? verifyAccessToken(token) : undefined;

    if (!session) {
      reply.header("WWW-Authenticate", "Bearer");

      return sendJsonErrorResponse(reply, 401, request.id, {
        error: "UNAUTHENTICATED",
        message: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn."
      });
    }

    return session;
  });
}

import type { FastifyInstance } from "fastify";
import { verifyAccessToken } from "./auth-session.js";
import { readBearerToken } from "./bearer-token.js";

export async function registerAuthSessionRoutes(app: FastifyInstance): Promise<void> {
  app.get("/auth/session", async (request, reply) => {
    const token = readBearerToken(request.headers.authorization);
    const session = token ? verifyAccessToken(token) : undefined;

    if (!session) {
      reply.header("WWW-Authenticate", "Bearer");

      return reply.status(401).send({
        error: "UNAUTHENTICATED",
        message: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.",
        requestId: request.id
      });
    }

    return session;
  });
}

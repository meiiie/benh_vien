import type { FastifyInstance, FastifyRequest } from "fastify";
import type { AuditEventRepository } from "@benh-vien-so/domain";
import {
  rememberDeniedAccessForAudit,
  recordDeniedAccessAuditEvent,
  type DeniedAccessPayload
} from "../audit-events/denied-access-audit.js";

export function registerDeniedAccessAuditHooks(
  app: FastifyInstance,
  auditEventRepository: AuditEventRepository
): void {
  const deniedAccessPayloads = new WeakMap<FastifyRequest, DeniedAccessPayload>();

  app.addHook("onSend", (request, reply, payload, done) => {
    rememberDeniedAccessForAudit(
      deniedAccessPayloads,
      request,
      reply.statusCode,
      payload
    );

    done(null, payload);
  });

  app.addHook("onResponse", async (request, reply) => {
    const deniedAccess = deniedAccessPayloads.get(request);

    if (!deniedAccess) {
      return;
    }

    deniedAccessPayloads.delete(request);
    await recordDeniedAccessAuditEvent(
      auditEventRepository,
      request,
      reply.statusCode,
      deniedAccess
    );
  });
}

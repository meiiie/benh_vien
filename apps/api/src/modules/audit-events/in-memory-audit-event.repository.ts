import { AuditEvent, buildAuditIntegrityReport, sealAuditEvent } from "@benh-vien-so/domain";
import type { AuditEventRepository } from "@benh-vien-so/domain";

export class InMemoryAuditEventRepository implements AuditEventRepository {
  private readonly events = new Map<string, AuditEvent>();
  private sequence = 1;

  async findByPatientId(patientId: string, limit = 50): Promise<AuditEvent[]> {
    return [...this.events.values()]
      .filter((event) => event.patientId === patientId)
      .sort((left, right) =>
        right.toSnapshot().occurredAt.localeCompare(left.toSnapshot().occurredAt)
      )
      .slice(0, limit)
      .map(cloneAuditEvent);
  }

  async verifyPatientIntegrity(patientId: string) {
    const events = [...this.events.values()]
      .filter((event) => event.patientId === patientId)
      .map(cloneAuditEvent);

    return buildAuditIntegrityReport(patientId, events);
  }

  async save(event: AuditEvent): Promise<AuditEvent> {
    const snapshot = event.toSnapshot();
    const id = snapshot.id ?? `audit-event-${String(this.sequence++).padStart(6, "0")}`;
    const latestHash = this.findLatestIntegrityHash(snapshot.patientId);
    const saved = sealAuditEvent(
      AuditEvent.rehydrate({
        ...snapshot,
        id
      }),
      latestHash
    );

    this.events.set(id, cloneAuditEvent(saved));
    return cloneAuditEvent(saved);
  }

  private findLatestIntegrityHash(patientId: string | undefined): string | undefined {
    const latest = [...this.events.values()]
      .filter((event) => event.toSnapshot().patientId === patientId)
      .at(-1);

    return latest?.toSnapshot().integrityHash;
  }
}

function cloneAuditEvent(event: AuditEvent): AuditEvent {
  return AuditEvent.rehydrate(event.toSnapshot());
}

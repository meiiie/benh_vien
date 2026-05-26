import { AuditEvent } from "@benh-vien-so/domain";
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

  async save(event: AuditEvent): Promise<AuditEvent> {
    const snapshot = event.toSnapshot();
    const id = snapshot.id ?? `audit-event-${String(this.sequence++).padStart(6, "0")}`;
    const saved = AuditEvent.rehydrate({
      ...snapshot,
      id
    });

    this.events.set(id, cloneAuditEvent(saved));
    return cloneAuditEvent(saved);
  }
}

function cloneAuditEvent(event: AuditEvent): AuditEvent {
  return AuditEvent.rehydrate(event.toSnapshot());
}

import { formatDateTime } from "../../lib/clinicalFormatters.js";
import type { Encounter } from "../../types/encounters.js";
import {
  formatEncounterClass,
  formatEncounterStatus
} from "./encounterFormatters.js";

type EncounterTimelineProps = {
  readonly encounters: readonly Encounter[];
  readonly selectedEncounterId?: string;
  readonly onSelectEncounter: (encounterId: string) => void;
};

export function EncounterTimeline({
  encounters,
  selectedEncounterId,
  onSelectEncounter
}: EncounterTimelineProps) {
  return (
    <div className="timeline">
      {encounters.map((encounter) => (
        <button
          className={encounter.id === selectedEncounterId ? "timeline-item selected" : "timeline-item"}
          key={encounter.id}
          type="button"
          onClick={() => onSelectEncounter(encounter.id)}
        >
          <span>{formatDateTime(encounter.startedAt)}</span>
          <strong>{encounter.serviceType}</strong>
          <small>
            {formatEncounterClass(encounter.class)} · {formatEncounterStatus(encounter.status)}
          </small>
        </button>
      ))}
      {encounters.length === 0 ? (
        <p className="empty-state">Chưa có lượt khám nào cho bệnh nhân này.</p>
      ) : null}
    </div>
  );
}

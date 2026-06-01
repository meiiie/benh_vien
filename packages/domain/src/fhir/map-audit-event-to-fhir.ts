import type { AuditEvent } from "../audit-event/audit-event.js";
import type { FhirAuditEvent, FhirBundle } from "./fhir-types.js";
import { auditActionLabels } from "./map-audit-event-labels.js";
import { buildEntityDetails } from "./map-audit-event-details.js";
import {
  mapAuditAction,
  mapAuditOutcome,
  mapAuditOutcomeDescription,
  mapPurposeOfUse
} from "./map-audit-event-outcome.js";
import {
  buildAuditAgentReference,
  buildAuditEntityReference
} from "./map-audit-event-references.js";

export function mapAuditEventToFhir(event: AuditEvent): FhirAuditEvent {
  const snapshot = event.toSnapshot();
  const details = buildEntityDetails(snapshot);

  return {
    resourceType: "AuditEvent",
    id: snapshot.id,
    meta: {
      profile: ["http://hl7.org/fhir/StructureDefinition/AuditEvent"]
    },
    type: {
      system: "http://terminology.hl7.org/CodeSystem/audit-event-type",
      code: "rest",
      display: "RESTful Operation"
    },
    subtype: [
      {
        system: "urn:wiiicare:nexus:audit-action",
        code: snapshot.action,
        display: auditActionLabels[snapshot.action]
      }
    ],
    action: mapAuditAction(snapshot.action),
    recorded: snapshot.occurredAt,
    outcome: mapAuditOutcome(snapshot.action),
    outcomeDesc: mapAuditOutcomeDescription(snapshot.action),
    agent: [
      {
        who: buildAuditAgentReference(snapshot),
        requestor: true,
        purposeOfUse: snapshot.purposeOfUse
          ? [mapPurposeOfUse(snapshot.purposeOfUse)]
          : undefined,
        network: snapshot.ipAddress
          ? {
              address: snapshot.ipAddress,
              type: "2"
            }
          : undefined
      }
    ],
    source: {
      site: "WiiiCare Nexus",
      observer: {
        display: "WiiiCare Nexus API"
      },
      type: [
        {
          system: "urn:wiiicare:nexus:audit-source-type",
          code: "application-server",
          display: "Application server"
        }
      ]
    },
    entity: [
      {
        what: buildAuditEntityReference(snapshot),
        name: snapshot.action,
        description: auditActionLabels[snapshot.action],
        detail: details.length > 0 ? details : undefined
      }
    ]
  };
}

export function mapAuditEventsToFhirBundle(
  patientId: string,
  events: readonly AuditEvent[],
  timestamp = new Date()
): FhirBundle {
  const timestampIso = timestamp.toISOString();

  return {
    resourceType: "Bundle",
    id: `patient-audit-${patientId}`,
    meta: {
      profile: ["http://hl7.org/fhir/StructureDefinition/Bundle"]
    },
    identifier: {
      system: "urn:wiiicare:nexus:fhir-audit-bundle",
      value: `audit-events:${patientId}:${timestampIso}`
    },
    type: "collection",
    timestamp: timestampIso,
    entry: events.map((event) => {
      const resource = mapAuditEventToFhir(event);

      return {
        fullUrl: `urn:wiiicare:nexus:AuditEvent:${resource.id ?? resource.recorded}`,
        resource
      };
    })
  };
}

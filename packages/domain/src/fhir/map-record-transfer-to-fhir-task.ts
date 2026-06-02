import type { RecordTransfer } from "../record-transfer/record-transfer.js";
import type { FhirTask } from "./fhir-types.js";
import {
  buildRecordTransferBusinessStatus,
  buildRecordTransferCode,
  buildRecordTransferNotes,
  formatRecordTransferBundleOutput,
  mapRecordTransferStatus,
  recordTransferIdentifierSystem,
  recordTransferTaskProfile
} from "./map-record-transfer-task-codings.js";

export function mapRecordTransferToFhirTask(recordTransfer: RecordTransfer): FhirTask {
  const snapshot = recordTransfer.toSnapshot();

  return {
    resourceType: "Task",
    id: snapshot.id,
    meta: {
      profile: [recordTransferTaskProfile]
    },
    identifier: [
      {
        system: recordTransferIdentifierSystem,
        value: snapshot.id
      }
    ],
    status: mapRecordTransferStatus(snapshot.status),
    businessStatus: buildRecordTransferBusinessStatus(snapshot.status),
    intent: "order",
    priority: snapshot.priority,
    code: buildRecordTransferCode(),
    description: snapshot.reason,
    focus: {
      reference: `Bundle/${snapshot.bundleId}`
    },
    for: {
      reference: `Patient/${snapshot.patientId}`
    },
    executionPeriod:
      snapshot.sentAt || snapshot.receivedAt
        ? {
            start: snapshot.sentAt,
            end: snapshot.receivedAt
          }
        : undefined,
    authoredOn: snapshot.requestedAt,
    lastModified: snapshot.updatedAt,
    requester: {
      reference: `Organization/${snapshot.sourceOrganizationId}`
    },
    owner: {
      reference: `Organization/${snapshot.recipientOrganizationId}`
    },
    input: [
      {
        type: {
          text: "Consent dùng để chia sẻ hồ sơ"
        },
        valueReference: {
          reference: `Consent/${snapshot.consentReference}`,
          display: snapshot.consentReference
        }
      }
    ],
    output: [
      {
        type: {
          text: formatRecordTransferBundleOutput(snapshot.bundleType)
        },
        valueReference: {
          reference: `Bundle/${snapshot.bundleId}`,
          display: snapshot.bundleId
        }
      }
    ],
    note: buildRecordTransferNotes(snapshot)
  };
}

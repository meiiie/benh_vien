import type { AuditEventSnapshot } from "../audit-event/audit-event.js";
import type { FhirAuditEvent } from "./fhir-types.js";

type FhirAuditEventEntityDetail = NonNullable<
  NonNullable<FhirAuditEvent["entity"]>[number]["detail"]
>[number];

export function buildEntityDetails(
  snapshot: AuditEventSnapshot
): readonly FhirAuditEventEntityDetail[] {
  const details: FhirAuditEventEntityDetail[] = [];

  addStringDetail(details, "patientId", snapshot.patientId);
  addStringDetail(details, "purposeOfUse", snapshot.purposeOfUse);
  addStringDetail(details, "hashAlgorithm", snapshot.hashAlgorithm);
  addStringDetail(details, "previousHash", snapshot.previousHash);
  addStringDetail(details, "payloadHash", snapshot.payloadHash);
  addStringDetail(details, "integrityHash", snapshot.integrityHash);
  addStringDetail(details, "metadata", JSON.stringify(snapshot.metadata));

  return details;
}

function addStringDetail(
  details: FhirAuditEventEntityDetail[],
  type: string,
  valueString: string | undefined
): void {
  if (!valueString) {
    return;
  }

  details.push({
    type,
    valueString
  });
}

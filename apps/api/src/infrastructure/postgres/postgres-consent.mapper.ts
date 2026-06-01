import { Consent } from "@benh-vien-so/domain";
import type { ConsentSnapshot } from "@benh-vien-so/domain";
import type { ConsentRow } from "./postgres-consent.types.js";

export function rowToConsent(row: ConsentRow): Consent {
  const snapshot: ConsentSnapshot = {
    id: row.id,
    patientId: row.patient_id,
    status: row.status,
    category: row.category,
    granteeOrganizationId: row.grantee_organization_id,
    grantorActorId: row.grantor_actor_id,
    evidenceDocumentId: row.evidence_document_id ?? undefined,
    revokedByActorId: row.revoked_by_actor_id ?? undefined,
    revokedAt: row.revoked_at ? toIsoString(row.revoked_at) : undefined,
    revocationReason: row.revocation_reason ?? undefined,
    validFrom: toIsoString(row.valid_from),
    validUntil: row.valid_until ? toIsoString(row.valid_until) : undefined,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at)
  };

  return Consent.rehydrate(snapshot);
}

export function consentToUpsertValues(consent: Consent): unknown[] {
  const snapshot = consent.toSnapshot();

  return [
    snapshot.id,
    snapshot.patientId,
    snapshot.status,
    snapshot.category,
    snapshot.granteeOrganizationId,
    snapshot.grantorActorId,
    snapshot.evidenceDocumentId ?? null,
    snapshot.revokedByActorId ?? null,
    snapshot.revokedAt ?? null,
    snapshot.revocationReason ?? null,
    snapshot.validFrom,
    snapshot.validUntil ?? null,
    snapshot.createdAt,
    snapshot.updatedAt
  ];
}

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

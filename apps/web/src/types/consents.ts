export type ConsentStatus = "active" | "revoked" | "expired";
export type ConsentCategory = "record-sharing";

export type Consent = {
  readonly id: string;
  readonly patientId: string;
  readonly status: ConsentStatus;
  readonly category: ConsentCategory;
  readonly granteeOrganizationId: string;
  readonly grantorActorId: string;
  readonly evidenceDocumentId?: string;
  readonly revokedByActorId?: string;
  readonly revokedAt?: string;
  readonly revocationReason?: string;
  readonly validFrom: string;
  readonly validUntil?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ConsentsResponse = {
  readonly items: readonly Consent[];
};

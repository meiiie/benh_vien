export type ConsentStatus = "active" | "revoked" | "expired";
export type ConsentCategory = "record-sharing";

export const consentStatuses = new Set<ConsentStatus>(["active", "revoked", "expired"]);
export const consentCategories = new Set<ConsentCategory>(["record-sharing"]);

export type ConsentSnapshot = {
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

export type CreateConsentInput = Omit<
  ConsentSnapshot,
  "status" | "revokedByActorId" | "revokedAt" | "revocationReason" | "createdAt" | "updatedAt"
>;

export type RevokeConsentInput = {
  readonly revokedByActorId: string;
  readonly revokedAt?: Date;
  readonly reason?: string;
};

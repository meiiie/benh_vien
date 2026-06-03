import { Consent } from "./consent.js";
import type { CreateConsentInput } from "./consent.types.js";

type CreateConsentOverrides = Partial<CreateConsentInput>;

export const consentRevocationReason = "Người bệnh rút lại đồng ý chia sẻ hồ sơ.";

export function createRecordSharingConsent(
  overrides: CreateConsentOverrides = {}
): Consent {
  return Consent.grant({
    id: "consent-test-fixture",
    patientId: "patient-test-001",
    category: "record-sharing",
    granteeOrganizationId: "hospital-recipient",
    grantorActorId: "practitioner-test",
    validFrom: "2026-05-28T00:00:00.000Z",
    validUntil: "2026-05-29T00:00:00.000Z",
    ...overrides
  });
}

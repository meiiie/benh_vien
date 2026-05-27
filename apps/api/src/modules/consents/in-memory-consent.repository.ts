import { Consent } from "@benh-vien-so/domain";
import type { ConsentRepository } from "@benh-vien-so/domain";

export class InMemoryConsentRepository implements ConsentRepository {
  private readonly consents = new Map<string, Consent>();

  constructor(seedConsents: readonly Consent[] = []) {
    for (const consent of seedConsents) {
      this.consents.set(consent.id, cloneConsent(consent));
    }
  }

  async findByPatientId(patientId: string): Promise<Consent[]> {
    return [...this.consents.values()]
      .filter((consent) => consent.patientId === patientId)
      .sort((left, right) => right.toSnapshot().createdAt.localeCompare(left.toSnapshot().createdAt))
      .map(cloneConsent);
  }

  async findById(id: string): Promise<Consent | undefined> {
    const consent = this.consents.get(id);
    return consent ? cloneConsent(consent) : undefined;
  }

  async save(consent: Consent): Promise<void> {
    this.consents.set(consent.id, cloneConsent(consent));
  }
}

export function createSeedConsents(): Consent[] {
  return [
    Consent.grant({
      id: "consent-demo-transfer-001",
      patientId: "patient-demo-001",
      category: "record-sharing",
      granteeOrganizationId: "hospital-hai-phong-referral",
      grantorActorId: "practitioner-demo-001",
      evidenceDocumentId: "clinical-document-demo-003",
      validFrom: "2026-05-27T00:00:00.000Z",
      validUntil: "2026-12-31T23:59:59.000Z"
    })
  ];
}

function cloneConsent(consent: Consent): Consent {
  return Consent.rehydrate(consent.toSnapshot());
}

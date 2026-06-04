import type { ConsentSnapshot } from "../consent/consent.types.js";
import type { FhirConsent } from "./fhir-types.js";

type ConsentProvision = NonNullable<FhirConsent["provision"]>;
type ConsentProvisionActor = NonNullable<ConsentProvision["actor"]>[number];
type ConsentProvisionAction = NonNullable<ConsentProvision["action"]>[number];
type ConsentProvisionPurpose = NonNullable<ConsentProvision["purpose"]>[number];
type ConsentProvisionClass = NonNullable<ConsentProvision["class"]>;

export function buildConsentProvision(
  snapshot: ConsentSnapshot
): ConsentProvision {
  return {
    type: "permit",
    period: {
      start: snapshot.validFrom,
      end: snapshot.revokedAt ?? snapshot.validUntil
    },
    actor: [buildConsentRecipientActor(snapshot.granteeOrganizationId)],
    action: [buildConsentRecordSharingAction()],
    purpose: [buildConsentTreatmentPurpose()],
    class: buildConsentRecordSharingClasses()
  };
}

function buildConsentRecipientActor(
  granteeOrganizationId: string
): ConsentProvisionActor {
  return {
    role: {
      text: "Đơn vị được nhận dữ liệu"
    },
    reference: {
      reference: `Organization/${granteeOrganizationId}`
    }
  };
}

function buildConsentRecordSharingAction(): ConsentProvisionAction {
  return {
    coding: [
      {
        system: "http://terminology.hl7.org/CodeSystem/consentaction",
        code: "disclose",
        display: "Disclose"
      }
    ],
    text: "Chia sẻ hồ sơ bệnh án"
  };
}

function buildConsentTreatmentPurpose(): ConsentProvisionPurpose {
  return {
    system: "http://terminology.hl7.org/CodeSystem/v3-ActReason",
    code: "TREAT",
    display: "Treatment"
  };
}

function buildConsentRecordSharingClasses(): ConsentProvisionClass {
  return [
    {
      system: "http://hl7.org/fhir/resource-types",
      code: "Bundle",
      display: "Bundle"
    },
    {
      system: "http://hl7.org/fhir/resource-types",
      code: "DocumentReference",
      display: "DocumentReference"
    }
  ];
}

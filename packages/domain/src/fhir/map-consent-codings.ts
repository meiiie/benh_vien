import type { ConsentCategory, ConsentStatus } from "../consent/consent.types.js";
import type { FhirConsent } from "./fhir-types.js";

const consentCategoryLabels: Record<ConsentCategory, string> = {
  "record-sharing": "Đồng ý chia sẻ hồ sơ bệnh án"
};

export const consentFhirProfile = "http://hl7.org/fhir/StructureDefinition/Consent";
export const consentIdentifierSystem = "urn:wiiicare:nexus:consent";

export function buildConsentIdentifier(
  consentId: string
): NonNullable<FhirConsent["identifier"]>[number] {
  return {
    system: consentIdentifierSystem,
    value: consentId,
    type: {
      text: "Mã đồng ý chia sẻ hồ sơ"
    }
  };
}

export function mapConsentStatus(status: ConsentStatus): FhirConsent["status"] {
  if (status === "active") {
    return "active";
  }

  return "inactive";
}

export function buildConsentScope(): FhirConsent["scope"] {
  return {
    coding: [
      {
        system: "http://terminology.hl7.org/CodeSystem/consentscope",
        code: "patient-privacy",
        display: "Privacy Consent"
      }
    ],
    text: "Đồng ý quyền riêng tư và chia sẻ dữ liệu bệnh án"
  };
}

export function buildConsentCategory(
  category: ConsentCategory
): FhirConsent["category"][number] {
  const display = consentCategoryLabels[category];

  return {
    coding: [
      {
        system: "urn:wiiicare:nexus:consent-category",
        code: category,
        display
      }
    ],
    text: display
  };
}

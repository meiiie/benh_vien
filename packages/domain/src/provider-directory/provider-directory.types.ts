export type ProviderIdentifier = {
  readonly system: string;
  readonly value: string;
  readonly type?: string;
};

export type ProviderTelecom = {
  readonly system: "phone" | "email" | "url";
  readonly value: string;
  readonly use?: "work" | "mobile" | "home";
};

export type ProviderCoding = {
  readonly system: string;
  readonly code: string;
  readonly display: string;
};

export type ProviderOrganizationType =
  | "hospital"
  | "department"
  | "laboratory"
  | "imaging"
  | "payer"
  | "government"
  | "other";

export type ProviderEndpointStatus =
  | "active"
  | "suspended"
  | "error"
  | "off"
  | "entered-in-error"
  | "test";

export type ProviderEndpointConnectionType =
  | "hl7-fhir-rest"
  | "dicom-wado-rs"
  | "hl7v2-mllp"
  | "direct-project"
  | "ihe-xds"
  | "other";

export const providerOrganizationTypes = new Set<ProviderOrganizationType>([
  "hospital",
  "department",
  "laboratory",
  "imaging",
  "payer",
  "government",
  "other"
]);

export const providerEndpointStatuses = new Set<ProviderEndpointStatus>([
  "active",
  "suspended",
  "error",
  "off",
  "entered-in-error",
  "test"
]);

export const providerEndpointConnectionTypes = new Set<ProviderEndpointConnectionType>([
  "hl7-fhir-rest",
  "dicom-wado-rs",
  "hl7v2-mllp",
  "direct-project",
  "ihe-xds",
  "other"
]);

export const providerTelecomSystems = new Set<ProviderTelecom["system"]>([
  "phone",
  "email",
  "url"
]);
export const providerTelecomUses = new Set<NonNullable<ProviderTelecom["use"]>>([
  "work",
  "mobile",
  "home"
]);

export type ProviderOrganizationSnapshot = {
  readonly id: string;
  readonly identifiers: readonly ProviderIdentifier[];
  readonly active: boolean;
  readonly type: ProviderOrganizationType;
  readonly name: string;
  readonly alias?: readonly string[];
  readonly address?: string;
  readonly telecom?: readonly ProviderTelecom[];
  readonly partOfOrganizationId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ProviderPractitionerSnapshot = {
  readonly id: string;
  readonly identifiers: readonly ProviderIdentifier[];
  readonly active: boolean;
  readonly fullName: string;
  readonly telecom?: readonly ProviderTelecom[];
  readonly qualification?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ProviderEndpointSnapshot = {
  readonly id: string;
  readonly managingOrganizationId: string;
  readonly status: ProviderEndpointStatus;
  readonly connectionType: ProviderEndpointConnectionType;
  readonly name: string;
  readonly address: string;
  readonly payloadTypes: readonly ProviderCoding[];
  readonly contact?: readonly ProviderTelecom[];
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ProviderPractitionerRoleSnapshot = {
  readonly id: string;
  readonly practitionerId?: string;
  readonly organizationId: string;
  readonly active: boolean;
  readonly code: ProviderCoding;
  readonly specialty?: ProviderCoding;
  readonly endpointIds?: readonly string[];
  readonly telecom?: readonly ProviderTelecom[];
  readonly periodStart?: string;
  readonly periodEnd?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ProviderDirectorySnapshot = {
  readonly organizations: readonly ProviderOrganizationSnapshot[];
  readonly practitioners: readonly ProviderPractitionerSnapshot[];
  readonly practitionerRoles: readonly ProviderPractitionerRoleSnapshot[];
  readonly endpoints: readonly ProviderEndpointSnapshot[];
  readonly generatedAt: string;
};

export type ProviderDirectoryInput = {
  readonly organizations: readonly Omit<ProviderOrganizationSnapshot, "createdAt" | "updatedAt">[];
  readonly practitioners: readonly Omit<ProviderPractitionerSnapshot, "createdAt" | "updatedAt">[];
  readonly practitionerRoles: readonly Omit<
    ProviderPractitionerRoleSnapshot,
    "createdAt" | "updatedAt"
  >[];
  readonly endpoints: readonly Omit<ProviderEndpointSnapshot, "createdAt" | "updatedAt">[];
  readonly generatedAt?: Date;
};

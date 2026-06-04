export type ProviderOrganizationType =
  | "hospital"
  | "department"
  | "laboratory"
  | "imaging"
  | "payer"
  | "government"
  | "other";

export type ProviderEndpointConnectionType =
  | "hl7-fhir-rest"
  | "dicom-wado-rs"
  | "hl7v2-mllp"
  | "direct-project"
  | "ihe-xds"
  | "other";

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

export type ProviderOrganization = {
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

export type ProviderPractitioner = {
  readonly id: string;
  readonly identifiers: readonly ProviderIdentifier[];
  readonly active: boolean;
  readonly fullName: string;
  readonly telecom?: readonly ProviderTelecom[];
  readonly qualification?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ProviderEndpoint = {
  readonly id: string;
  readonly managingOrganizationId: string;
  readonly status: "active" | "suspended" | "error" | "off" | "entered-in-error" | "test";
  readonly connectionType: ProviderEndpointConnectionType;
  readonly name: string;
  readonly address: string;
  readonly payloadTypes: readonly ProviderCoding[];
  readonly contact?: readonly ProviderTelecom[];
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ProviderPractitionerRole = {
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

export type ProviderDirectory = {
  readonly organizations: readonly ProviderOrganization[];
  readonly practitioners: readonly ProviderPractitioner[];
  readonly practitionerRoles: readonly ProviderPractitionerRole[];
  readonly endpoints: readonly ProviderEndpoint[];
  readonly generatedAt: string;
};

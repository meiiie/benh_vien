export type ClinicalDocumentType =
  | "admission-note"
  | "discharge-summary"
  | "lab-report"
  | "imaging-report"
  | "referral-letter"
  | "consent-form"
  | "advance-directive"
  | "ccda"
  | "ccr"
  | "medical-record"
  | "patient-information";

export type ClinicalDocumentStatus = "draft" | "signed" | "superseded" | "entered-in-error";

export const clinicalDocumentStatuses = new Set<ClinicalDocumentStatus>([
  "draft",
  "signed",
  "superseded",
  "entered-in-error"
]);

export type ClinicalDocumentSnapshot = {
  readonly id: string;
  readonly patientId: string;
  readonly encounterId?: string;
  readonly type: ClinicalDocumentType;
  readonly title: string;
  readonly status: ClinicalDocumentStatus;
  readonly storageUri: string;
  readonly attachmentContentType?: string;
  readonly attachmentSizeBytes?: number;
  readonly attachmentHashSha1Base64?: string;
  readonly attachmentCreatedAt?: string;
  readonly authorPractitionerId: string;
  readonly signedAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ClinicalDocumentProps = Omit<
  ClinicalDocumentSnapshot,
  "status" | "attachmentCreatedAt" | "signedAt" | "createdAt" | "updatedAt"
> & {
  status: ClinicalDocumentStatus;
  readonly attachmentCreatedAt?: Date;
  signedAt?: Date;
  readonly createdAt: Date;
  updatedAt: Date;
};

export type CreateClinicalDocumentInput = Omit<
  ClinicalDocumentSnapshot,
  "status" | "signedAt" | "createdAt" | "updatedAt"
>;

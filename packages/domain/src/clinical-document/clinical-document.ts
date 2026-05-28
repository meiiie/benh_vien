import { DomainError } from "../shared/domain-error.js";

const maxFhirUnsignedInt = 4_294_967_295;

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

export type CreateClinicalDocumentInput = Omit<
  ClinicalDocumentSnapshot,
  "status" | "signedAt" | "createdAt" | "updatedAt"
>;

type ClinicalDocumentProps = {
  id: string;
  patientId: string;
  encounterId?: string;
  type: ClinicalDocumentType;
  title: string;
  status: ClinicalDocumentStatus;
  storageUri: string;
  attachmentContentType?: string;
  attachmentSizeBytes?: number;
  attachmentHashSha1Base64?: string;
  attachmentCreatedAt?: Date;
  authorPractitionerId: string;
  signedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

export class ClinicalDocument {
  private constructor(private readonly props: ClinicalDocumentProps) {}

  static create(input: CreateClinicalDocumentInput): ClinicalDocument {
    const now = new Date();

    if (!input.patientId.trim()) {
      throw new DomainError("Tài liệu lâm sàng phải gắn với một bệnh nhân.");
    }

    if (!input.storageUri.trim()) {
      throw new DomainError("Tài liệu lâm sàng phải có vị trí lưu trữ.");
    }

    if (
      input.attachmentSizeBytes !== undefined &&
      (!Number.isInteger(input.attachmentSizeBytes) ||
        input.attachmentSizeBytes < 0 ||
        input.attachmentSizeBytes > maxFhirUnsignedInt)
    ) {
      throw new DomainError("Dung lượng tài liệu phải là số nguyên FHIR unsignedInt hợp lệ.");
    }

    const attachmentCreatedAt = input.attachmentCreatedAt
      ? new Date(input.attachmentCreatedAt)
      : undefined;

    if (attachmentCreatedAt && Number.isNaN(attachmentCreatedAt.getTime())) {
      throw new DomainError("Thời điểm tạo tệp đính kèm không hợp lệ.");
    }

    return new ClinicalDocument({
      ...input,
      id: input.id.trim(),
      patientId: input.patientId.trim(),
      encounterId: input.encounterId?.trim() || undefined,
      title: input.title.trim(),
      storageUri: input.storageUri.trim(),
      attachmentContentType: input.attachmentContentType?.trim() || undefined,
      attachmentSizeBytes: input.attachmentSizeBytes,
      attachmentHashSha1Base64: input.attachmentHashSha1Base64?.trim() || undefined,
      attachmentCreatedAt,
      authorPractitionerId: input.authorPractitionerId.trim(),
      status: "draft",
      createdAt: now,
      updatedAt: now
    });
  }

  static rehydrate(snapshot: ClinicalDocumentSnapshot): ClinicalDocument {
    return new ClinicalDocument({
      id: snapshot.id,
      patientId: snapshot.patientId,
      encounterId: snapshot.encounterId,
      type: snapshot.type,
      title: snapshot.title,
      status: snapshot.status,
      storageUri: snapshot.storageUri,
      attachmentContentType: snapshot.attachmentContentType,
      attachmentSizeBytes: snapshot.attachmentSizeBytes,
      attachmentHashSha1Base64: snapshot.attachmentHashSha1Base64,
      attachmentCreatedAt: snapshot.attachmentCreatedAt
        ? new Date(snapshot.attachmentCreatedAt)
        : undefined,
      authorPractitionerId: snapshot.authorPractitionerId,
      signedAt: snapshot.signedAt ? new Date(snapshot.signedAt) : undefined,
      createdAt: new Date(snapshot.createdAt),
      updatedAt: new Date(snapshot.updatedAt)
    });
  }

  get id(): string {
    return this.props.id;
  }

  get patientId(): string {
    return this.props.patientId;
  }

  get status(): ClinicalDocumentStatus {
    return this.props.status;
  }

  sign(signedAt = new Date()): void {
    if (this.props.status !== "draft") {
      throw new DomainError("Chỉ tài liệu ở trạng thái nháp mới được ký.");
    }

    this.props.status = "signed";
    this.props.signedAt = signedAt;
    this.touch();
  }

  toSnapshot(): ClinicalDocumentSnapshot {
    return {
      id: this.props.id,
      patientId: this.props.patientId,
      encounterId: this.props.encounterId,
      type: this.props.type,
      title: this.props.title,
      status: this.props.status,
      storageUri: this.props.storageUri,
      attachmentContentType: this.props.attachmentContentType,
      attachmentSizeBytes: this.props.attachmentSizeBytes,
      attachmentHashSha1Base64: this.props.attachmentHashSha1Base64,
      attachmentCreatedAt: this.props.attachmentCreatedAt?.toISOString(),
      authorPractitionerId: this.props.authorPractitionerId,
      signedAt: this.props.signedAt?.toISOString(),
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString()
    };
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }
}
